const mysql = require('mysql2/promise'); // Import promise-based version

// Cấu hình connection pool MySQL trên XAMPP
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',        // User mặc định của XAMPP
    password: '',        // Không có mật khẩu
    database: 'aerol', // Tên database của bạn
    waitForConnections: true, // Cho phép các request chờ nếu tất cả kết nối đang được sử dụng
    connectionLimit: 10,    // Số lượng kết nối tối đa trong pool (điều chỉnh theo nhu cầu)
    queueLimit: 0         // Không giới hạn số lượng request chờ
});

console.log('✅ Connection pool MySQL created!');

module.exports = pool; // Export pool instead of connection