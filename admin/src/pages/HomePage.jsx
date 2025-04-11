// src/pages/AdminHomepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Components
import AdminHeader from '../components/Header';
import AdminSidebar from '../components/Sidebar';
import AdminProfile from '../components/AdminProfile';
import EventManagement from '../components/EventManagement'; 
import KhoaManagement from '../components/KhoaManagement'; 
import LopManagement from '../components/LopManagement'; 
import FeedbackManagement from '../components/FeedbackManagement'; 
import StudentLookup from '../components/StudentLookup'; 
import './HomePage.css';

const AdminHomepage = () => {
    const [adminUser, setAdminUser] = useState(null);
    const [activeSection, setActiveSection] = useState('profile'); // Mục mặc định khi tải trang
    const [isLoadingUser, setIsLoadingUser] = useState(true); // Theo dõi trạng thái tải dữ liệu người dùng
    const navigate = useNavigate();

    useEffect(() => {
        // Tải dữ liệu người dùng admin từ localStorage
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            try {
                setAdminUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Lỗi phân tích dữ liệu admin từ localStorage:", error);
                localStorage.removeItem('adminUser');
                navigate('/admin/login'); // Chuyển hướng nếu dữ liệu bị lỗi
            }
        } else {
            // Nếu không có dữ liệu người dùng, chuyển hướng ngay lập tức
            console.log("Không tìm thấy admin user, chuyển hướng đến trang đăng nhập.");
            navigate('/admin/login');
        }
        setIsLoadingUser(false); // Đã hoàn tất việc tải/kiểm tra dữ liệu người dùng
    }, [navigate]);

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    // Hàm cho phép component con (ví dụ: AdminProfile) cập nhật dữ liệu người dùng
    const handleProfileUpdate = (updatedUserData) => {
        setAdminUser(updatedUserData);
        localStorage.setItem('adminUser', JSON.stringify(updatedUserData)); // Cập nhật cả localStorage
    };

    // Render component tương ứng dựa trên activeSection
    const renderMainContent = () => {
        // Hiển thị chỉ báo tải nếu đang chờ dữ liệu người dùng
        if (isLoadingUser) {
            // Sử dụng class từ CSS nếu muốn tùy chỉnh spinner/loading text
            return <div className="loading-indicator">Đang tải dữ liệu...</div>;
        }
        // Nếu đã tải xong nhưng không có user (đã bị redirect), không render gì thêm
        if (!adminUser) {
            return null;
        }

        switch (activeSection) {
            case 'profile':
                // Truyền prop onProfileUpdate xuống AdminProfile
                return <AdminProfile adminUser={adminUser} onProfileUpdate={handleProfileUpdate} />;
            case 'events':
                return <EventManagement />;
            case 'khoa':
                return <KhoaManagement />;
            case 'lop':
                return <LopManagement />;
            case 'feedback':
                return <FeedbackManagement />;
            case 'students':
                return <StudentLookup />;
            default:
                // Mặc định quay về trang profile nếu section không hợp lệ
                return <AdminProfile adminUser={adminUser} onProfileUpdate={handleProfileUpdate} />;
        }
    };

    // Không render layout chính cho đến khi biết chắc chắn về trạng thái đăng nhập
    // (isLoadingUser đã thành false)
    if (isLoadingUser) {
        // Có thể hiển thị một màn hình loading toàn trang ở đây nếu muốn
        return <div className="loading-indicator">Đang tải...</div>;
    }

    // Nếu sau khi tải, vẫn không có user (do bị redirect trong useEffect), không render gì
    if (!adminUser) {
        return null;
    }

    return (
        // Sử dụng class từ file CSS
        <div className="admin-homepage-container">
            <AdminHeader adminUser={adminUser} />
            <div className="admin-body">
                <AdminSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
                <main className="admin-main-content">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminHomepage;