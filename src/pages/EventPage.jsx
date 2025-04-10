// src/pages/EventPage/EventPage.js
import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard'; // Import EventCard
import './EventPage.css';

// --- Dữ liệu giả lập cho Sự kiện (Đặt trực tiếp trong file) ---
const mockEvents = [
  {
    id: 'evt1',
    imageUrl: '/event.png', // Đảm bảo ảnh này có trong /public
    name: 'Ngày hội Tuyển dụng VAA 2025',
    eventDateTime: 'Thứ Bảy, 15/04/2025 - 07:30 đến 16:30',
    registrationOpen: '01/04/2025 - 08:00',
    registrationClose: '10/04/2025 - 17:00',
    maxParticipants: 500,
    location: 'Sân vận động Học viện Hàng không VN',
  },
  {
    id: 'evt2',
    imageUrl: '/event.png', // Đảm bảo ảnh này có trong /public
    name: 'Talkshow: Chinh phục Nhà tuyển dụng ngành Logistics',
    eventDateTime: 'Thứ Tư, 05/04/2025 - 18:00 đến 20:00',
    registrationOpen: '25/03/2025 - 10:00',
    registrationClose: '03/04/2025 - 23:59',
    maxParticipants: 100,
    location: 'Hội trường C, VAA',
  },
  {
    id: 'evt3',
    imageUrl: '/event.png', // Đảm bảo ảnh này có trong /public
    name: 'Cuộc thi Thiết kế Mô hình Máy bay AeroDesign 2025',
    eventDateTime: 'Chủ Nhật, 30/04/2025 - Cả ngày',
    registrationOpen: '10/04/2025 - 00:00',
    registrationClose: '25/04/2025 - 17:00',
    maxParticipants: 50, // Theo đội
    location: 'Khu thực hành Khoa Kỹ thuật Hàng không',
  },
   {
    id: 'evt4',
    imageUrl: '/event.png', // Đảm bảo ảnh này có trong /public
    name: 'Lễ ra quân Mùa hè xanh 2025',
    eventDateTime: 'Thứ Bảy, 01/07/2025 - 07:00',
    registrationOpen: '15/06/2025 - 09:00',
    registrationClose: '25/06/2025 - 17:00',
    maxParticipants: 200,
    location: 'Sảnh chính VAA',
  },
];
// --- Kết thúc dữ liệu giả lập ---


const EventPage = () => {
  // State để lưu danh sách sự kiện
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // State cho trạng thái loading
  const [error, setError] = useState(null);     // State cho lỗi

  // Giả lập fetch dữ liệu khi component mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Sử dụng dữ liệu giả lập đã định nghĩa ở trên
        setEvents(mockEvents);
        setLoading(false);
      } catch (err) {
        // Trong trường hợp dùng dữ liệu cứng thì lỗi này ít khi xảy ra
        console.error("Error setting mock events:", err);
        setError("Đã xảy ra lỗi khi hiển thị sự kiện.");
        setLoading(false);
      }
    }, 500); // Giảm thời gian giả lập loading vì không gọi API thật

    // Cleanup timer khi component unmount
    return () => clearTimeout(timer);
  }, []); // Chạy 1 lần khi component mount

  // Hàm xử lý khi nhấn nút "Xem chi tiết"
  const handleViewDetails = (eventId) => {
    console.log("View details for event:", eventId);
    // Điều hướng đến trang chi tiết sự kiện, ví dụ: /events/{eventId}
    // navigate(`/events/${eventId}`); // Nếu dùng react-router-dom
  };

  // Render loading state
  if (loading) {
    return <div className="loading-message">Đang tải danh sách sự kiện...</div>;
  }

  // Render error state
  if (error) {
    return <div className="error-message-page">{error}</div>;
  }

  // Render danh sách sự kiện
  return (
    <div className="event-page-container">
      <h2 className="event-page-title">Danh sách Sự kiện</h2>
      {events.length === 0 && !loading ? ( // Kiểm tra thêm !loading để chắc chắn
         <p className="loading-message">Hiện tại không có sự kiện nào.</p>
      ) : (
        <div className="event-list-container">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPage;