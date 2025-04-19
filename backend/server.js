const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import các routes
const adminAuthRoutes = require('./routes/admin/auth');
const commonRoutes = require('./routes/khoa'); 
const svauthRoutes = require('./routes/client/auth'); // Import routes cho sinh viên
const app = express();
const PORT = 5000;

// Middleware xử lý JSON & CORS
app.use(bodyParser.json());
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
}));
app.use(express.json());

// --- Routes ---
app.use('/admin', adminAuthRoutes);
app.use('/common', commonRoutes);
app.use('/sinhvien', svauthRoutes); 
// --- Khởi chạy server (giữ nguyên) ---
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});