// src/components/ActivitySummarySection.jsx
import React from 'react';
// Import CSS riêng cho component này
import './ActivitySummarySection.css'; // << Tạo file này hoặc đổi đường dẫn

// --- Dữ liệu giả lập (Đặt trong component) ---
const mockActivitySummary = {
  trainingDays: 15,
  volunteerDays: 8,
};
// --- Kết thúc dữ liệu giả lập ---

const ActivitySummarySection = ({ summaryData = mockActivitySummary }) => { // Sử dụng mock data làm default prop

    // Đảm bảo data không bị null/undefined
    const data = summaryData || mockActivitySummary;

    return (
        <section className="activity-summary-section">
            {/* <h3>Tổng kết hoạt động</h3> */}
            <div className="summary-cards-container">
                {/* Card Ngày rèn luyện */}
                <div className="summary-card training-card"> {/* Thêm class riêng nếu cần style khác */}
                    <div className="count">{data.trainingDays}</div>
                    <div className="label">Ngày rèn luyện</div>
                </div>
                {/* Card Ngày tình nguyện */}
                <div className="summary-card volunteer-card"> {/* Thêm class riêng nếu cần style khác */}
                    <div className="count">{data.volunteerDays}</div>
                    <div className="label">Ngày tình nguyện</div>
                </div>
            </div>
        </section>
    );
};

export default ActivitySummarySection;