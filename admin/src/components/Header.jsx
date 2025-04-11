// src/components/admin/AdminHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Import file CSS (đảm bảo bạn đã tạo và link đúng)
import './Header.css';

const AdminHeader = ({ adminUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Xóa dữ liệu người dùng khỏi nơi lưu trữ (ví dụ: localStorage)
        localStorage.removeItem('adminUser');
        // Chuyển hướng về trang đăng nhập admin
        navigate('/admin/login');
    };

    return (
        // Sử dụng class từ file CSS
        <header className="admin-header">
            <div className="header-logo">
                <img src="/logo.svg" alt="AeroRL+ Logo" className="header-logo-img" /> {/* Thêm class nếu cần */}
                <span className="header-logo-text">AeroRL+ Admin</span> {/* Thêm class nếu cần */}
            </div>
            <div className="header-user-info">
                {adminUser ? (
                    <>
                        <img
                            src={adminUser.image_profile || '/default-avatar.png'} // Sử dụng ảnh mặc định nếu chưa có
                            alt="Ảnh đại diện Admin"
                            className="user-avatar" // Class cho avatar
                        />
                        <span className="user-name">Chào, {adminUser.ho_ten}</span> {/* Class cho tên */}
                        <button
                            onClick={handleLogout}
                            className="logout-button" // Class cho nút đăng xuất
                         >
                            Đăng xuất
                         </button>
                    </>
                ) : (
                    <span>Đang tải...</span> // Hiển thị trong khi chờ dữ liệu người dùng
                )}
            </div>
        </header>
    );
};

export default AdminHeader;