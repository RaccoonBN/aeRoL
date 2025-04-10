// src/components/StudentInfoSection.jsx
import React from 'react';
// Import CSS riêng cho component này (hoặc dùng CSS chung từ HomePage)
import './StudentInfoSection.css'; // << Tạo file này hoặc đổi đường dẫn
// Giả sử dùng react-icons
import { FaCamera } from 'react-icons/fa';

// --- Dữ liệu giả lập (Đặt trong component) ---
const mockStudentData = {
  avatarUrl: '/default-avatar.jpg', 
  name: 'Nguyễn Văn An',
  studentId: '1951060001',
  className: 'CNTT K19',
  faculty: 'Công nghệ Thông tin',
};
// --- Kết thúc dữ liệu giả lập ---

const StudentInfoSection = ({ studentData = mockStudentData }) => { // Sử dụng mock data làm default prop

  const handleAvatarChange = () => {
    console.log("Mở cửa sổ chọn ảnh đại diện mới (simulated)...");
    alert("Chức năng thay đổi avatar đang được phát triển!");
  };

  // Đảm bảo data không bị null/undefined
  const data = studentData || mockStudentData;

  return (
    <section className="student-info-section">
      <div className="avatar-container">
        <img
          src={data.avatarUrl}
          alt={`Ảnh đại diện của ${data.name}`}
          className="student-avatar"
          onError={(e) => {
            console.warn("Lỗi tải ảnh đại diện, sử dụng ảnh mặc định.");
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
        />
        <button
          className="change-avatar-button"
          onClick={handleAvatarChange}
          aria-label="Thay đổi ảnh đại diện"
          title="Thay đổi ảnh đại diện"
        >
          <FaCamera />
        </button>
      </div>
      <div className="student-details">
        <h3>{data.name}</h3>
        <p>
          <strong>MSSV:</strong> {data.studentId}
        </p>
        <p>
          <strong>Lớp:</strong> {data.className}
        </p>
        <p>
          <strong>Khoa:</strong> {data.faculty}
        </p>
      </div>
    </section>
  );
};

export default StudentInfoSection;