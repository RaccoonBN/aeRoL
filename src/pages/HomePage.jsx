// src/pages/HomePage/HomePage.js
import React from 'react';
// Đường dẫn đúng nếu các component nằm trong src/components
import StudentInfoSection from '../components/StudentInfoSection';
import ActivitySummarySection from '../components/ActivitySummarySection';
import ActivityHistorySection from '../components/ActivityHistorySection';
import './HomePage.css'; // CSS cho layout của HomePage

// Dữ liệu không cần định nghĩa lại ở đây nữa vì đã có trong component con

const HomePage = () => {
  return (
    <div className="home-page-container">
      {/* Truyền props nếu cần lấy data từ API, bỏ trống để dùng mock data */}
      <StudentInfoSection /* studentData={dataFromApi} */ />
      <ActivitySummarySection /* summaryData={summaryFromApi} */ />
      <ActivityHistorySection /* historyData={historyFromApi} */ />
    </div>
  );
};

export default HomePage;