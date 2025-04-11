// routes/commonRoutes.js
const express = require('express');
const pool = require('../db'); 

const router = express.Router();

router.get('/khoa', async (req, res) => {
    try {
        // Truy vấn lấy id và tên khoa, sắp xếp theo tên cho dễ nhìn trên dropdown
        const [khoaList] = await pool.query('SELECT id, ten_khoa FROM khoa ORDER BY ten_khoa ASC');

        return res.status(200).json({
            success: true,
            khoaList: khoaList // Trả về mảng các object { id, ten_khoa }
        });

    } catch (error) {
        console.error("Lỗi lấy danh sách Khoa:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy danh sách Khoa.'
        });
    }
});

router.get('/lop', async (req, res) => {
    // Lấy khoaId từ query parameter, ví dụ: /api/common/lop?khoaId=1
    const khoaId = req.query.khoaId;

    // --- Validate Input ---
    if (!khoaId) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp `khoaId` trong query parameter.'
        });
    }

    // Kiểm tra khoaId có phải là số nguyên dương không
    const parsedKhoaId = parseInt(khoaId, 10);
    if (isNaN(parsedKhoaId) || parsedKhoaId <= 0) {
         return res.status(400).json({
            success: false,
            message: '`khoaId` không hợp lệ.'
        });
    }

    try {
        // Truy vấn lấy id và tên lớp thuộc khoa_id được cung cấp
        // Sắp xếp theo tên lớp
        const [lopList] = await pool.query(
            'SELECT id, ten_lop FROM lop WHERE khoa_id = ? ORDER BY ten_lop ASC',
            [parsedKhoaId] // Sử dụng khoaId đã được parse và validate
        );

        // Trả về danh sách lớp (có thể là mảng rỗng nếu khoa đó chưa có lớp nào)
        return res.status(200).json({
            success: true,
            lopList: lopList // Trả về mảng các object { id, ten_lop }
        });

    } catch (error) {
        console.error(`Lỗi lấy danh sách Lớp cho khoaId ${khoaId}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy danh sách Lớp.'
        });
    }
});


module.exports = router;