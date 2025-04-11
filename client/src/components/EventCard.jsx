// src/components/EventCard/EventCard.js
import React from 'react';
import './EventCard.css'; // Đảm bảo đã import file CSS tương ứng
// Ví dụ dùng react-icons (cần cài đặt: npm install react-icons)
import { FaCalendarAlt, FaClock, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';

const EventCard = ({ event, onViewDetails }) => {
  // Nếu không có dữ liệu sự kiện, không render gì cả hoặc render placeholder
  if (!event) {
    return null;
    // Hoặc: return <div className="event-card-placeholder">Đang tải...</div>;
  }

  // Hàm xử lý khi nút "Xem chi tiết" được click
  const handleViewDetailsClick = () => {
    // Gọi hàm onViewDetails được truyền từ component cha, kèm theo ID của sự kiện
    if (onViewDetails) {
      onViewDetails(event.id);
    }
  };

  // ---- RENDER ----
  return (
    <div className="event-card">
      {/* Phần hình ảnh của card */}
      <img
        // Sử dụng ảnh từ event.imageUrl, nếu không có thì dùng ảnh mặc định
        src={event.imageUrl || '/event-placeholder-900x600.png'}
        alt={event.name} // Alt text mô tả ảnh
        className="event-card-image"
        loading="lazy" // Thêm lazy loading cho ảnh
      />

      {/* Phần nội dung text của card */}
      <div className="event-card-content">
        {/* Tiêu đề sự kiện */}
        <h3 className="event-card-title" title={event.name}> {/* Thêm title để xem full khi bị cắt */}
          {event.name}
        </h3>

        {/* Khu vực chứa các chi tiết nhỏ */}
        <div className="event-card-details">
          {/* Thời gian diễn ra */}
          <p>
            <FaCalendarAlt className="detail-icon" aria-hidden="true" /> {/* aria-hidden cho icon trang trí */}
            {event.eventDateTime}
          </p>
          {/* Thời gian đăng ký */}
          <p>
            <FaClock className="detail-icon" aria-hidden="true" />
             ĐK: {event.registrationOpen} - {event.registrationClose}
          </p>
          {/* Số lượng */}
          <p>
            <FaUserFriends className="detail-icon" aria-hidden="true" />
            SL: {event.maxParticipants}
          </p>
          {/* Địa điểm */}
          <p>
            <FaMapMarkerAlt className="detail-icon" aria-hidden="true" />
            {event.location}
          </p>
        </div>

        {/* Nút xem chi tiết */}
        <button
          className="event-card-button"
          onClick={handleViewDetailsClick}
          aria-label={`Xem chi tiết sự kiện ${event.name}`} // Thêm aria-label cho accessibility
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default EventCard;