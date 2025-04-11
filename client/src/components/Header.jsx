// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Header.css'; // Import CSS chung
import { FaUserCircle, FaBell, FaSignOutAlt, FaEdit, FaCommentDots } from 'react-icons/fa';
import NotificationPopup from './NotificationPopup'; // <<< Import component mới

// --- Component User Dropdown (Giữ nguyên định nghĩa inline) ---
const UserDropdown = ({ onLogout, onNavigate }) => {
  return (
    // div này sẽ được bọc trong div có class .open động ở dưới
    <>
      <ul>
        <li>
          <button onClick={() => onNavigate('/profile/edit')}>
            <FaEdit style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Chỉnh sửa thông tin
          </button>
        </li>
        <li>
          <button onClick={() => onNavigate('/feedback')}>
            <FaCommentDots style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Gửi yêu cầu - góp ý
          </button>
        </li>
        <li>
          <button onClick={onLogout}>
            <FaSignOutAlt style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Đăng xuất
          </button>
        </li>
      </ul>
    </>
  );
};

// --- KHÔNG còn định nghĩa NotificationPopup inline ở đây ---


// == Component Header Chính ==
const Header = ({ appName = "aeRoL+" }) => {
  // --- Dữ liệu giả lập cho Notifications (Giữ nguyên) ---
  const initialNotifications = [
    { id: 'n1', date: '13/01/2025', message: 'Đã điểm danh thành công sự kiện A.', type:'attendance', read: false },
    { id: 'n2', date: '12/01/2025', message: 'Bạn đã vắng mặt tại sự kiện B.', type:'attendance', read: false },
    { id: 'n3', date: '02/03/2025', message: 'Đoàn Thanh niên - Hội Sinh viên đã phản hồi góp ý của bạn.', type:'feedback', read: true },
    { id: 'n4', date: '01/03/2025', message: 'Đã gửi yêu cầu/góp ý thành công.', type:'feedback', read: true },
    { id: 'n5', date: '13/01/2025', message: 'Bạn đã bị khóa đăng ký sự kiện trong HK2 năm học 2024-2025 vì vắng mặt quá 3 lần.', type:'warning', read: false },
  ];
  // --- Kết thúc dữ liệu giả lập ---

  // State, Refs, useEffect, Handlers (Giữ nguyên)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
  const [currentNotifications, setCurrentNotifications] = useState(initialNotifications);
  const userIconContainerRef = useRef(null);
  const notifIconContainerRef = useRef(null);
  const hasUnreadNotifications = currentNotifications.some(n => !n.read);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userIconContainerRef.current && !userIconContainerRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (notifIconContainerRef.current && !notifIconContainerRef.current.contains(event.target)) {
        setIsNotificationPopupOpen(false);
      }
    };
    if (isUserDropdownOpen || isNotificationPopupOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen, isNotificationPopupOpen]);

  const handleLogout = () => { /* ... Giữ nguyên ... */
    console.log("Simulating Logout...");
    setIsUserDropdownOpen(false);
  };
  const handleNavigate = (path) => { /* ... Giữ nguyên ... */
     console.log("Navigate to:", path);
     setIsUserDropdownOpen(false);
  };
  const handleMarkAllRead = () => { /* ... Giữ nguyên ... */
    console.log("Marking all notifications as read (simulated)...");
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    setCurrentNotifications(updatedNotifications);
  };
  const handleViewNotification = (id) => { /* ... Giữ nguyên ... */
     console.log("Viewing notification:", id);
     const updatedNotifications = currentNotifications.map(n =>
        n.id === id ? { ...n, read: true } : n
     );
     setCurrentNotifications(updatedNotifications);
     setIsNotificationPopupOpen(false);
  };

  // --- Render Top Bar (Hàm nội bộ - Đảm bảo render đúng) ---
    const renderTopBar = () => (
        <div className="header-top-bar">
           {/* Logo */}
           <div className="header-logo-section">
               <img src="/logo.svg" alt="Logo" className="header-logo" />
           </div>
           {/* Tên App */}
           <span className="header-app-name">{appName}</span>
           {/* Icons */}
           <div className="header-icons-section">
               {/* Notification */}
               <div ref={notifIconContainerRef} style={{ position: 'relative' }}>
                   <button
                       className="icon-button"
                       onClick={() => {
                            setIsNotificationPopupOpen(!isNotificationPopupOpen);
                            setIsUserDropdownOpen(false);
                        }}
                       aria-label="Thông báo"
                   >
                       <FaBell />
                       {hasUnreadNotifications && <span className="notification-indicator"></span>}
                   </button>
                   {/* Div bao ngoài với class động 'open' */}
                   <div className={`notification-popup ${isNotificationPopupOpen ? 'open' : ''}`}>
                       {/* Sử dụng component NotificationPopup đã import */}
                       <NotificationPopup
                           notifications={currentNotifications}
                           onMarkAllRead={handleMarkAllRead}
                           onViewNotification={handleViewNotification}
                       />
                   </div>
               </div>

               {/* User */}
               <div ref={userIconContainerRef} style={{ position: 'relative' }}>
                   <button
                       className="icon-button"
                       onClick={() => {
                            setIsUserDropdownOpen(!isUserDropdownOpen);
                            setIsNotificationPopupOpen(false);
                        }}
                       aria-label="Tài khoản người dùng"
                   >
                       <FaUserCircle />
                   </button>
                    {/* Div bao ngoài với class động 'open' */}
                    <div className={`user-dropdown ${isUserDropdownOpen ? 'open' : ''}`}>
                       {/* Sử dụng component UserDropdown inline */}
                       <UserDropdown onLogout={handleLogout} onNavigate={handleNavigate} />
                    </div>
               </div>
           </div>
        </div>
     );


  // --- Render Nav Bar (Hàm nội bộ - Giữ nguyên hoặc dùng NavLink) ---
  const renderNavBar = () => {
      const currentPath = window.location.pathname; // Hoặc dùng useLocation

      return (
        <nav className="header-nav-bar">
            <a href="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
                Trang chủ
            </a>
            <a href="/events" className={`nav-link ${currentPath === '/events' ? 'active' : ''}`}>
                Sự kiện
            </a>
        </nav>
      );
  }

  // --- Render Header chính ---
  return (
    <header className="header-container">
      {renderTopBar()}
      {renderNavBar()}
    </header>
  );
};

export default Header;