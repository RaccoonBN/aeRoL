// src/components/Header/NotificationPopup.jsx
import React from 'react';


const NotificationPopup = ({ notifications = [], onMarkAllRead, onViewNotification }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  // Lưu ý: div bao ngoài cùng với class động 'open' sẽ nằm ở component cha (Header.jsx)
  // Component này chỉ render nội dung bên trong popup.
  return (
    <> {/* Sử dụng Fragment để không thêm thẻ div thừa */}
      <div className="notification-popup-header">
        <span>Thông báo {unreadCount > 0 ? `(${unreadCount} mới)` : ''}</span>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead}>Đánh dấu tất cả đã đọc</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#6c757d' }}>
          Không có thông báo mới.
        </p>
      ) : (
        <ul className="notification-list">
          {notifications.map((noti) => (
            <li
              key={noti.id}
              className={`notification-item ${!noti.read ? 'unread' : ''} ${noti.type || ''}`}
              onClick={() => onViewNotification(noti.id)}
            >
              <p className="notification-message">{noti.message}</p>
              <span className="notification-date">{noti.date}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default NotificationPopup;