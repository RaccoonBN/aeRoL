// routes/authRoutes.js
const express = require('express');
const pool = require('../../db'); // Adjust the path if your db connection is elsewhere
const bcrypt = require('bcrypt');
const path = require('path');
// const jwt = require('jsonwebtoken'); // You'll need this for authentication middleware

// --- File Upload & Cloudinary Setup ---
const multer = require('multer');
const storage = multer.memoryStorage(); // Store file in memory for Cloudinary upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Example: 5MB file size limit
    fileFilter: (req, file, cb) => { // Basic image filter
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận tệp hình ảnh!'), false);
        }
    }
});

const { v2: cloudinary } = require('cloudinary');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();

// --- Cloudinary Configuration ---
// !!! IMPORTANT: Use environment variables in production for security !!!
cloudinary.config({
    cloud_name: 'dyf91xhcr',
    api_key: '327687394212666',
    api_secret: 'cNpo1Z2F6xto3EwvTlpasKoxO-Y' 
});
console.log("Cloudinary configured.");
// ------------------------------------


const router = express.Router();

const VAA_EMAIL_DOMAIN = 'vaa.edu.vn';
const SALT_ROUNDS = 10;

// --- Helper Functions ---
// Helper to format buffer for Cloudinary upload
const formatBufferToDataURI = (file) => {
    // Use path.extname to get the extension from the original filename
    const fileExtension = path.extname(file.originalname).toString();
    return parser.format(fileExtension, file.buffer);
};

// --- Authentication Middleware Placeholder ---
// You MUST implement proper authentication (e.g., JWT verification)
// This middleware should verify the token and attach user info (like id) to req.user
const authenticateToken = (req, res, next) => {
    // Example: Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    // --- Replace this simulated user with actual token verification ---
    // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //     if (err) return res.sendStatus(403); // Invalid token
    //     req.user = user; // Add decoded user payload (e.g., { userId: 123, email: '...', role: 'sinhvien' }) to request object
    //     next(); // pass the execution off to whatever request the client intended
    // });
    // --- Simulation for now ---
    console.warn("AUTHENTICATION MIDDLEWARE IS SIMULATED - DO NOT USE IN PRODUCTION");
    // Simulate getting userId from token (replace with actual decoded ID)
    const simulatedUserId = token.startsWith('valid-token-for-user-') ? parseInt(token.split('-')[4], 10) : null;
    if (simulatedUserId) {
         req.user = { id: simulatedUserId, role: 'sinhvien' }; // Example structure
         console.log(`Simulated authentication for user ID: ${req.user.id}`);
         next();
    } else {
         console.log("Simulated token invalid or missing user ID.");
         return res.sendStatus(403); // Forbidden if token is invalid in simulation
    }
     // --- End Simulation ---
};
// ---------------------------------------------


// --- POST /api/auth/register (Student Registration - From previous code) ---
router.post('/register', async (req, res) => {
    // ... (registration logic remains the same) ...
    const { email, password, hoTen, mssv, khoaId, lopId } = req.body;
    let connection;
    if (!email || !password || !hoTen || !mssv || !khoaId || !lopId) return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Địa chỉ email không hợp lệ.' });
    if (email.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) return res.status(400).json({ success: false, message: `Email @${VAA_EMAIL_DOMAIN} không dùng cho chức năng đăng ký này.` });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    if (isNaN(parseInt(khoaId)) || isNaN(parseInt(lopId))) return res.status(400).json({ success: false, message: 'ID Khoa hoặc Lớp không hợp lệ.' });

    try {
        connection = await pool.getConnection();
        const checkSql = "SELECT email, mssv FROM sinhvien WHERE email = ? OR mssv = ? LIMIT 1";
        const [existingUsers] = await connection.execute(checkSql, [email, mssv]);
        if (existingUsers.length > 0) {
            connection.release();
            return res.status(409).json({ success: false, message: existingUsers[0].email === email ? 'Địa chỉ email đã được sử dụng.' : 'MSSV đã được đăng ký.' });
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const insertSql = `INSERT INTO sinhvien (email, password, ho_ten, mssv, khoa_id, lop_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
        const [result] = await connection.execute(insertSql, [email, hashedPassword, hoTen, mssv, khoaId, lopId]);
        connection.release();
        if (result.affectedRows === 1) return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
        else return res.status(500).json({ success: false, message: 'Đăng ký thất bại, không thể thêm dữ liệu.' });
    } catch (error) {
        console.error('Registration Route Error:', error);
        if (connection) connection.release();
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ trong quá trình đăng ký.' });
    }
});

// --- POST /api/auth/login (Student Login - From previous code) ---
router.post('/login', async (req, res) => {
    // ... (login logic remains the same) ...
    // ... remember to potentially generate and send a JWT token here ...
    const { identifier, password } = req.body;
    let connection;
    if (!identifier || !password) return res.status(400).json({ success: false, message: 'Vui lòng nhập Email/MSSV và Mật khẩu.' });

    try {
        connection = await pool.getConnection();
        const findUserSql = `SELECT id, email, mssv, password as hashedPassword, ho_ten, image_profile, lop_id, khoa_id, bi_khoa FROM sinhvien WHERE email = ? OR mssv = ? LIMIT 1`;
        const [users] = await connection.execute(findUserSql, [identifier, identifier]);
        connection.release();
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Email/MSSV hoặc mật khẩu không đúng.' });
        const user = users[0];
        if (user.bi_khoa === 1) return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Email/MSSV hoặc mật khẩu không đúng.' });

        // --- Generate Token (Example - replace with your actual token generation) ---
        const token = `valid-token-for-user-${user.id}`; // REPLACE with actual JWT generation
        // --- ---

        const userResponseData = { id: user.id, email: user.email, mssv: user.mssv, hoTen: user.ho_ten, imageProfile: user.image_profile, lopId: user.lop_id, khoaId: user.khoa_id };
        return res.status(200).json({ success: true, message: 'Đăng nhập thành công!', user: userResponseData, token: token /* Include token */ });
    } catch (error) {
        console.error('Login Route Error:', error);
        if (connection) connection.release();
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ trong quá trình đăng nhập.' });
    }
});

// --- GET /api/auth/profile (Get Logged-In Student Profile) ---
// Apply authentication middleware here!
router.get('/profile', authenticateToken, async (req, res) => {
    // Get user ID from the authenticated request (set by middleware)
    const userId = req.user?.id; // Assuming middleware adds user object with id

    if (!userId) {
        // This should ideally be caught by the middleware itself
        return res.status(401).json({ success: false, message: 'Không thể xác định người dùng.' });
    }

    console.log(`Fetching profile for student ID: ${userId}`);
    let connection;
    try {
        connection = await pool.getConnection();
        // Query to get student info and join with Khoa and Lop tables
        const sqlSelect = `
            SELECT
                sv.id, sv.mssv, sv.email, sv.ho_ten, sv.image_profile,
                sv.lop_id, sv.khoa_id, sv.created_at, sv.bi_khoa,
                k.ten_khoa,  -- Get faculty name
                l.ten_lop    -- Get class name
            FROM sinhvien sv
            LEFT JOIN khoa k ON sv.khoa_id = k.id
            LEFT JOIN lop l ON sv.lop_id = l.id
            WHERE sv.id = ?
            LIMIT 1
        `;
        const [rows] = await connection.execute(sqlSelect, [userId]);
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin sinh viên.' });
        }

        const studentProfile = rows[0];

        // Exclude password (even though we didn't select it, good practice)
        const { password: _, ...userProfileData } = studentProfile;

        // Format the response slightly differently to match frontend expectation
        const responsePayload = {
             id: userProfileData.id,
             mssv: userProfileData.mssv,
             email: userProfileData.email,
             ho_ten: userProfileData.ho_ten, // Keep original db column names
             image_profile: userProfileData.image_profile,
             bi_khoa: userProfileData.bi_khoa,
             created_at: userProfileData.created_at,
             lop: { // Nested object for lop
                id: userProfileData.lop_id,
                ten_lop: userProfileData.ten_lop
             },
             khoa: { // Nested object for khoa
                 id: userProfileData.khoa_id,
                 ten_khoa: userProfileData.ten_khoa
             }
        };


        return res.status(200).json({ success: true, student: responsePayload });

    } catch (error) {
        console.error(`Error fetching profile for student ID ${userId}:`, error);
        if (connection) connection.release();
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin cá nhân.' });
    }
});


// --- POST /api/auth/avatar (Update Student Avatar) ---
// Apply authentication middleware AND multer middleware for file upload
router.post('/avatar', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const imageFile = req.file;
    const userId = req.user?.id; // Get ID from authenticated user

    // Validation
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Không thể xác định người dùng.' });
    }
     if (!imageFile) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh để tải lên.' });
    }
    // Multer's fileFilter already checked basic image type

    console.log(`Updating avatar for student ID: ${userId}`);
    let connection;
    let newImageUrl = null; // Store the Cloudinary URL
    let oldImageUrl = null; // To potentially delete the old image

    try {
        connection = await pool.getConnection();

        // --- Optional: Get the old image URL to delete it from Cloudinary later ---
        // const [currentUserData] = await connection.execute('SELECT image_profile FROM sinhvien WHERE id = ?', [userId]);
        // if (currentUserData.length > 0 && currentUserData[0].image_profile) {
        //     oldImageUrl = currentUserData[0].image_profile;
        // }

        // --- 1. Upload new image to Cloudinary ---
        console.log("Uploading to Cloudinary...");
        const fileDataUri = formatBufferToDataURI(imageFile);
        const uploadResult = await cloudinary.uploader.upload(fileDataUri.content, {
             folder: 'student_avatars', // Optional: organize in Cloudinary
             // public_id: `student_${userId}_avatar`, // Optional: predictable ID
             // overwrite: true // Optional: overwrite if public_id exists
        });
        newImageUrl = uploadResult.secure_url; // Get the HTTPS URL
        console.log("Cloudinary Upload Success:", newImageUrl);

        // --- 2. Update image_profile path in the database ---
        const [updateResult] = await connection.execute(
            'UPDATE sinhvien SET image_profile = ? WHERE id = ?',
            [newImageUrl, userId] // Store the full Cloudinary URL
        );
        connection.release(); // Release connection after DB operation

        if (updateResult.affectedRows === 0) {
             // Should not happen if user exists from authenticateToken
            return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên để cập nhật ảnh.' });
        }

        // --- Optional: Delete old image from Cloudinary ---
        // if (oldImageUrl) {
        //     try {
        //         const publicId = oldImageUrl.substring(oldImageUrl.lastIndexOf('/') + 1, oldImageUrl.lastIndexOf('.')); // Extract public_id if stored as URL
        //         await cloudinary.uploader.destroy(`student_avatars/${publicId}`); // Use correct folder/public_id
        //         console.log("Old Cloudinary image deleted:", publicId);
        //     } catch (deleteError) {
        //         console.error("Failed to delete old Cloudinary image:", deleteError);
        //         // Don't fail the request, just log the error
        //     }
        // }

        // --- 3. Send Success Response ---
        return res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            newAvatarUrl: newImageUrl // Send the new URL back to the frontend
        });

    } catch (error) {
        console.error(`Avatar Update Error for user ID ${userId}:`, error);
        if (connection) connection.release();
        // Handle specific multer errors (like file too large)
        if (error instanceof multer.MulterError) {
             if (error.code === 'LIMIT_FILE_SIZE') {
                 return res.status(400).json({ success: false, message: 'Kích thước file quá lớn (tối đa 5MB).' });
             }
             return res.status(400).json({ success: false, message: `Lỗi tải file: ${error.message}` });
        }
         // Handle Cloudinary errors (if not caught earlier)
        if (error.http_code) { // Cloudinary errors often have http_code
             return res.status(error.http_code || 500).json({ success: false, message: `Lỗi Cloudinary: ${error.message}` });
        }
        // Handle generic errors
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật ảnh đại diện.' });
    }
});


module.exports = router;