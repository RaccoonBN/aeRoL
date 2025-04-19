// src/App.js
import React, { useState, useEffect } from 'react'; // Import useState và useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import Header from '../src/components/Header';
import LoginPage from '../src/pages/LoginPage';
import RegisterPage from '../src/pages/RegisterPage';
import HomePage from '../src/pages/HomePage';
import EventPage from '../src/pages/EventPage';

function App() {
  // --- Sử dụng State để quản lý trạng thái đăng nhập ---
  // Hàm kiểm tra trạng thái đăng nhập ban đầu từ localStorage
  const checkInitialLoginState = () => {
    // Kiểm tra xem có token hoặc dữ liệu người dùng trong localStorage không
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    // !!token chuyển đổi giá trị (chuỗi hoặc null) thành boolean (true/false)
    return !!token || !!userData; // Chỉ cần một trong hai tồn tại là coi như đã đăng nhập
  };

  const [isLoggedIn, setIsLoggedIn] = useState(checkInitialLoginState()); // Khởi tạo state

  // --- Cập nhật lại State nếu localStorage thay đổi (hiếm khi cần thiết, nhưng để đảm bảo) ---
  // Lưu ý: Cách tốt hơn là dùng Context hoặc Redux để LoginPage cập nhật trực tiếp state này
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(checkInitialLoginState());
    };
    // Lắng nghe sự kiện thay đổi storage từ các tab khác (ít dùng)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener khi component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Chạy một lần khi mount



  return (
    <Router>
      {/* Header chỉ hiển thị khi đã đăng nhập */}
      {isLoggedIn && <Header />}
      <main>
        <Routes>
          {/* Route cho người dùng chưa đăng nhập */}
          {!isLoggedIn && (
            <>
              <Route path="/login" element={<LoginPage /* onLoginSuccess={handleLoginSuccess} */ />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Nếu truy cập trang chủ hoặc bất kỳ route nào khác mà chưa login -> về trang login */}
              <Route path="*" element={<Navigate replace to="/login" />} />
            </>
          )}

          {/* Route cho người dùng đã đăng nhập */}
          {isLoggedIn && (
             <>
               <Route path="/" element={<HomePage />} />
               <Route path="/events" element={<EventPage />} />
               {/* Các route khác cho người dùng đã đăng nhập */}

               {/* Nếu truy cập /login hoặc /register khi đã login -> về trang chủ */}
               <Route path="/login" element={<Navigate replace to="/" />} />
               <Route path="/register" element={<Navigate replace to="/" />} />
               {/* Route mặc định khi đã login -> về trang chủ */}
               <Route path="*" element={<Navigate replace to="/" />} />
            </>
          )}
        </Routes>
      </main>
    </Router>
  );
}

export default App;