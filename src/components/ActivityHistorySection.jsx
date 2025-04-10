// src/components/ActivityHistorySection.jsx
import React from 'react';
// Import CSS riêng cho component này
import './ActivityHistorySection.css'; // << Tạo file này hoặc đổi đường dẫn

// --- Dữ liệu giả lập (Đặt trong component) ---
const mockActivityHistory = [
  { id: 1, date: '12/03/2025', status: 'attended', eventName: 'Hội thảo Kỹ năng mềm A' },
  { id: 2, date: '01/03/2025', status: 'absent', eventName: 'Ngày hội Việc làm B' },
  { id: 3, date: '15/02/2025', status: 'attended', eventName: 'Tập huấn Cán bộ Đoàn C' },
  { id: 4, date: '10/02/2025', status: 'attended', eventName: 'Hiến máu nhân đạo D' },
];
// --- Kết thúc dữ liệu giả lập ---

const ActivityHistorySection = ({ historyData = mockActivityHistory }) => { // Sử dụng mock data làm default prop

  // Hàm trợ giúp để lấy class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'attended':
        return 'status-attended';
      case 'absent':
        return 'status-absent';
      // Thêm các trạng thái khác nếu có (e.g., pending, registered)
      default:
        return 'status-unknown';
    }
  };

  // Hàm trợ giúp để lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'attended':
        return 'Đã tham gia';
      case 'absent':
        return 'Vắng mặt';
      default:
        return 'Không rõ';
    }
  };

  // Đảm bảo data không bị null/undefined và là mảng
  const data = Array.isArray(historyData) ? historyData : mockActivityHistory;

  return (
    <section className="activity-history-section">
      <h3>Lịch sử hoạt động</h3>
      {data.length === 0 ? (
        <p className="no-history-message">Chưa có lịch sử hoạt động nào.</p>
      ) : (
        <ul className="history-list">
          {data.map((item) => (
            <li key={item.id} className="history-item">
              <span className="history-date">{item.date}</span>
              {/* Thẻ span trạng thái với class động */}
              <span className={`history-status ${getStatusClass(item.status)}`}>
                {getStatusText(item.status)}
              </span>
              {/* Tên sự kiện */}
              <span className="history-event-name">{item.eventName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ActivityHistorySection;