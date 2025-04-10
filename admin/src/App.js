// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Import các trang ---
import AdminLoginPage from '../src/pages/LoginPage'; 
import HomePage from '../src/pages/HomePage'; 

import './App.css'; 

// --- Component Admin Dashboard (Ví dụ đơn giản) ---
// Đây là nội dung sẽ hiển thị bên trong AdminLayout nếu bạn dùng Layout
const AdminDashboardContent = ({ onLogout }) => (
  <div>
    <h2>Chào mừng Admin!</h2>
    <p>Đây là khu vực quản trị.</p>
    <button onClick={onLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>Đăng xuất</button>
  </div>
);


function App() {
  // --- State giả lập trạng thái đăng nhập Admin ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // Ban đầu là chưa đăng nhập

  // --- Hàm xử lý đăng nhập thành công (sẽ được gọi từ AdminLoginPage) ---
  const handleAdminLoginSuccess = () => {
    console.log("Admin login successful!");
    setIsAdminLoggedIn(true);
    // Trong thực tế: lưu token vào localStorage/sessionStorage
  };

  // --- Hàm xử lý đăng xuất ---
  const handleAdminLogout = () => {
    console.log("Admin logging out!");
    setIsAdminLoggedIn(false);
  };
  // --- Kết thúc xử lý state ---


  return (
    <Router>
      <Routes>
        {/* Route cho trang đăng nhập Admin */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn
              ? <Navigate to="/admin/dashboard" replace />
              : <AdminLoginPage onAdminLoginSuccess={handleAdminLoginSuccess} />
          }
        />

        <Route
          path="/admin/dashboard" // Hoặc path khác tùy bạn chọn
          element={
            !isAdminLoggedIn
              ? <Navigate to="/admin/login" replace />
               : <AdminDashboardContent onLogout={handleAdminLogout}/>
             
          }
        />

        {/* === Route Mặc định === */}
        {/* Nếu truy cập vào root "/" hoặc path không xác định */}
        <Route
            path="*" // Bắt tất cả các path khác
            element={
                isAdminLoggedIn
                    ? <Navigate to="/admin/dashboard" replace /> // Đã login -> về dashboard admin
                    : <Navigate to="/admin/login" replace /> // Chưa login -> về login admin
            }
        />

      </Routes>
    </Router>
  );
}

export default App;