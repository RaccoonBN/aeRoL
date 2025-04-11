// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { FaUserAlt, FaCalendarAlt, FaBook, FaChalkboard, FaComments, FaSearch } from 'react-icons/fa';
import './Sidebar.css';

// Nhận thêm props: isExpanded, onMouseEnter, onMouseLeave
const AdminSidebar = ({ activeSection, onSectionChange, isExpanded, onMouseEnter, onMouseLeave }) => {
  const menuItems = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: <FaUserAlt /> },
    { key: 'events', label: 'Quản lý Sự kiện', icon: <FaCalendarAlt /> },
    { key: 'khoa', label: 'Quản lý Khoa', icon: <FaBook /> },
    { key: 'lop', label: 'Quản lý Lớp', icon: <FaChalkboard /> },
    { key: 'feedback', label: 'Quản lý Góp ý', icon: <FaComments /> },
    { key: 'students', label: 'Tra cứu Sinh viên', icon: <FaSearch /> },
  ];

  return (
    // Thêm class 'expanded' dựa vào prop isExpanded
    // Gắn event handlers vào thẻ nav
    <nav
        className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
      <ul>
        {menuItems.map(item => (
          <li key={item.key} className={activeSection === item.key ? 'active' : ''} title={item.label}>
            <button onClick={() => onSectionChange(item.key)}>
              {item.icon && <span className="menu-icon">{item.icon}</span>}
              <span className="menu-text">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminSidebar;