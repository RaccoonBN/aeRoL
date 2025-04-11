// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../src/components/Header'; 
import LoginPage from '../src/pages/LoginPage';       
import RegisterPage from '../src/pages/RegisterPage'; 
import HomePage from '../src/pages/HomePage'; 
import EventPage from '../src/pages/EventPage';


function App() {
  // Giả lập trạng thái đăng nhập (sau này sẽ lấy từ context/redux/localStorage)
  const isLoggedIn = false; // Đặt là true để thấy trang Home

  return (
    <Router>
      {isLoggedIn && <Header />} 
      <main> {/* Bọc nội dung trang trong thẻ main */}
        <Routes>
          {/* Nếu chưa đăng nhập, hiển thị trang Login/Register */}
          {!isLoggedIn && (
            <>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Có thể thêm route mặc định để redirect về login */}
               <Route path="*" element={<LoginPage />} />
            </>
          )}

          {isLoggedIn && (
             <>
               <Route path="/" element={<HomePage />} />
               <Route path="/events" element={<EventPage />} />
               <Route path="*" element={<HomePage />} />
            </>
          )}
        </Routes>
      </main>
    </Router>
  );
}



export default App;