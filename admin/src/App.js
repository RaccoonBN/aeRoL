// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Import các trang ---
import AdminLoginPage from './pages/LoginPage';     // Trang đăng nhập Admin
import AdminRegisterPage from './pages/RegisterPage'; // Trang đăng ký Admin
import AdminHomepage from './pages/HomePage';   // Trang dashboard/homepage Admin

import './App.css'; // CSS chung cho App

const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminUser');
};


const AdminProtectedRoute = () => {
  const isAuthenticated = isAdminAuthenticated();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};


const AdminPublicRoute = () => {
    const isAuthenticated = isAdminAuthenticated();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/admin/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AdminPublicRoute />}> {/* Áp dụng logic cho nhóm route này */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
        </Route>

        <Route path="/admin" element={<AdminProtectedRoute />}> {/* Áp dụng bảo vệ cho nhóm route này */}
          <Route path="dashboard" element={<AdminHomepage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route
          path="*"
          element={
            // Kiểm tra lần cuối, nếu đã đăng nhập thì vào admin dashboard, nếu không thì về admin login
            isAdminAuthenticated()
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/admin/login" replace />
          }
        />
        {/* Bạn có thể thay đổi route mặc định này thành trang chủ công khai nếu có */}
        {/* Ví dụ: <Route path="/" element={<PublicLandingPage />} /> */}

      </Routes>
    </Router>
  );
}

export default App;