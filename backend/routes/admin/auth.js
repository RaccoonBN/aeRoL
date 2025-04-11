// routes/adminAuthRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');

// Database connection pool
const pool = require('../../db'); // <<< VERIFY PATH

// File upload handling
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Cloudinary integration
const { v2: cloudinary } = require('cloudinary');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

// --- Cloudinary Configuration ---
// WARNING: Storing secrets directly in code is insecure for production. Use environment variables.
cloudinary.config({
    cloud_name: 'dyf91xhcr',
    api_key: '327687394212666',
    api_secret: 'cNpo1Z2F6xto3EwvTlpasKoxO-Y' // <<< PROTECT THIS SECRET
});
// -----------------------------

const router = express.Router();
const saltRounds = 10;

// Helper to format buffer for Cloudinary upload
const formatBufferToDataURI = (file) => {
    const fileExtension = path.extname(file.originalname).toString();
    return parser.format(fileExtension, file.buffer);
};

// --- Endpoint: Đăng ký Cán bộ/Admin ---
router.post('/register', upload.single('profileImage'), async (req, res) => {
    const { mssv, email, password, confirmPassword, hoTen, selectedKhoaId, selectedLopId, chucVu } = req.body;
    const imageFile = req.file;

    // Input Validation
    if (!mssv || !email || !password || !confirmPassword || !hoTen || !selectedKhoaId || !selectedLopId || !chucVu) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc và chọn Khoa/Lớp.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu không khớp.' });
    }
    const parsedKhoaId = parseInt(selectedKhoaId, 10);
    const parsedLopId = parseInt(selectedLopId, 10);
    if (isNaN(parsedKhoaId) || isNaN(parsedLopId) || parsedKhoaId <= 0 || parsedLopId <= 0) {
        return res.status(400).json({ success: false, message: 'ID Khoa hoặc Lớp không hợp lệ.' });
    }

    let connection;
    let imageUrl = null;

    try {
        // Upload Image if provided
        if (imageFile) {
            try {
                const fileDataUri = formatBufferToDataURI(imageFile);
                const uploadResult = await cloudinary.uploader.upload(fileDataUri.content, { folder: 'admin_profiles' });
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({ success: false, message: 'Lỗi tải ảnh đại diện lên Cloudinary.' });
            }
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check for existing Admin
        const [existingAdmin] = await connection.query('SELECT id FROM canbo WHERE email = ? OR mssv = ? LIMIT 1 FOR UPDATE', [email, mssv]);
        if (existingAdmin.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'Email hoặc Mã số cán bộ đã tồn tại.' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new Admin
        const sqlInsert = `INSERT INTO canbo (mssv, email, password, ho_ten, image_profile, lop_id, khoa_id, chuc_vu, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        const [result] = await connection.query(sqlInsert, [mssv, email, hashedPassword, hoTen, imageUrl, parsedLopId, parsedKhoaId, chucVu]);

        if (result.affectedRows === 1) {
            await connection.commit();
            return res.status(201).json({ success: true, message: 'Đăng ký tài khoản cán bộ thành công!' });
        } else {
            await connection.rollback();
            throw new Error('Không thể tạo tài khoản cán bộ.');
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Lỗi đăng ký cán bộ:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ success: false, message: 'Khoa hoặc Lớp được chọn không hợp lệ.' });
        if (error.code === 'ER_DUP_ENTRY') { const field = error.sqlMessage.includes('email') ? 'Email' : 'MSCB'; return res.status(409).json({ success: false, message: `${field} đã tồn tại.` }); }
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng ký.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- Endpoint: Đăng nhập Cán bộ ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu.' }); }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT id, mssv, email, password, ho_ten, image_profile, chuc_vu, khoa_id, lop_id FROM canbo WHERE email = ? LIMIT 1', [email]);
        const canbo = rows[0];

        if (!canbo) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });

        const isMatch = await bcrypt.compare(password, canbo.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });

        // Return user data (excluding password) upon successful login
        const { password: _, ...userData } = canbo; // Exclude password from user data
        return res.status(200).json({
            success: true,
            message: `Đăng nhập quản trị (${userData.ho_ten || userData.email}) thành công!`,
            user: userData
        });
    } catch (error) {
        console.error("Lỗi đăng nhập cán bộ:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng nhập.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- Endpoint: Lấy Thông Tin Cán Bộ Theo ID (kèm tên Khoa/Lớp) ---
router.get('/profile/:id', async (req, res) => {
    const adminId = req.params.id;
    const parsedAdminId = parseInt(adminId, 10);

    if (isNaN(parsedAdminId) || parsedAdminId <= 0) {
        return res.status(400).json({ success: false, message: 'ID cán bộ không hợp lệ.' });
    }

    // --- WARNING: SECURITY ---
    // This endpoint currently lacks authentication/authorization.
    // Add checks here to ensure the requester is allowed to view this profile.
    // --- END WARNING ---

    let connection;
    try {
        connection = await pool.getConnection();
        const sqlSelect = `
            SELECT
                cb.id, cb.mssv, cb.email, cb.ho_ten, cb.image_profile,
                cb.chuc_vu, cb.khoa_id, cb.lop_id, cb.created_at,
                k.ten_khoa, l.ten_lop
            FROM canbo cb
            LEFT JOIN khoa k ON cb.khoa_id = k.id
            LEFT JOIN lop l ON cb.lop_id = l.id
            WHERE cb.id = ? LIMIT 1
        `;
        const [rows] = await connection.query(sqlSelect, [parsedAdminId]);
        const adminProfile = rows[0];

        if (!adminProfile) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cán bộ với ID này.' });
        }

        // Exclude password if it were accidentally selected (it's not here)
        const { password: _, ...userProfileData } = adminProfile;
        return res.status(200).json({ success: true, user: userProfileData });

    } catch (error) {
        console.error(`Lỗi lấy thông tin cán bộ ID ${adminId}:`, error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy thông tin cán bộ.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- Endpoint: Cập nhật Ảnh Đại Diện ---
router.put('/profile/image', upload.single('profileImage'), async (req, res) => {
    const imageFile = req.file;

    // --- WARNING: SECURITY & USER IDENTIFICATION ---
    // This endpoint MUST be protected by authentication middleware.
    // You need a secure way to get the ID of the user whose profile is being updated.
    // Using req.body.userId is INSECURE. Use ID from authenticated session/token.
    const userIdToUpdate = req.body.userId; // <<< INSECURE EXAMPLE - REPLACE THIS
    // --- END WARNING ---

    if (!userIdToUpdate) return res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng cần cập nhật.' });
    const parsedUserId = parseInt(userIdToUpdate, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ.' });
    if (!imageFile) return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh để cập nhật.' });

    let connection;
    let newImageUrl = null;

    try {
        // Upload new image
        try {
            const fileDataUri = formatBufferToDataURI(imageFile);
            // Consider using public_id and overwrite: true for better management
            const uploadResult = await cloudinary.uploader.upload(fileDataUri.content, { folder: 'admin_profiles' });
            newImageUrl = uploadResult.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary upload error during update:", uploadError);
            return res.status(500).json({ success: false, message: 'Lỗi tải ảnh mới lên Cloudinary.' });
        }

        // Update database
        connection = await pool.getConnection();
        const [updateResult] = await connection.query('UPDATE canbo SET image_profile = ? WHERE id = ?', [newImageUrl, parsedUserId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cập nhật ảnh.' });
        }

        // Fetch updated user profile (with names) to return
        const sqlSelectUpdated = `
            SELECT cb.id, cb.mssv, cb.email, cb.ho_ten, cb.image_profile, cb.chuc_vu, cb.khoa_id, cb.lop_id, cb.created_at, k.ten_khoa, l.ten_lop
            FROM canbo cb
            LEFT JOIN khoa k ON cb.khoa_id = k.id
            LEFT JOIN lop l ON cb.lop_id = l.id
            WHERE cb.id = ? LIMIT 1
        `;
        const [finalUserRows] = await connection.query(sqlSelectUpdated, [parsedUserId]);

        if (finalUserRows.length === 0) throw new Error("Không thể lấy lại thông tin người dùng sau khi cập nhật ảnh.");

        const { password: _, ...updatedUserData } = finalUserRows[0]; // Exclude password again just in case
        return res.status(200).json({ success: true, message: 'Cập nhật ảnh đại diện thành công!', user: updatedUserData });

    } catch (error) {
        console.error(`Lỗi cập nhật ảnh cho user ID ${parsedUserId}:`, error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật ảnh.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;