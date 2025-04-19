// src/components/StudentInfoSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './StudentInfoSection.css'; // Đảm bảo bạn đã tạo và style file CSS này
import { FaCamera } from 'react-icons/fa';
// Cài đặt: npm install react-spinners
import { ClipLoader } from 'react-spinners';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000'; // Thay đổi nếu cần
const DEFAULT_AVATAR = '/default-avatar.png'; // Đường dẫn tới ảnh đại diện mặc định trong thư mục public

const StudentInfoSection = () => {
  // --- State Variables ---
  const [studentData, setStudentData] = useState(null); // Dữ liệu sinh viên, null ban đầu
  const [isLoading, setIsLoading] = useState(true);    // Trạng thái tải dữ liệu ban đầu
  const [isUploading, setIsUploading] = useState(false); // Trạng thái tải ảnh đại diện
  const [error, setError] = useState('');               // Thông báo lỗi
  const fileInputRef = useRef(null); // Tham chiếu đến input file ẩn

  // --- Fetch Dữ Liệu Sinh Viên Khi Component Mount ---
  useEffect(() => {
    console.log("[StudentInfoSection] Component Mounted. Attempting to fetch profile.");

    const fetchStudentProfile = async () => {
      setIsLoading(true);
      setError('');
      let token = null; // Khởi tạo token là null

      try {
        // --- Bước 1: Lấy Token từ localStorage ---
        token = localStorage.getItem('authToken'); // Sử dụng đúng key 'authToken'
        console.log("[StudentInfoSection] Token retrieved from localStorage:", token);

        // --- Bước 2: Kiểm tra Token ---
        if (!token) {
          console.error("[StudentInfoSection] No authToken found in localStorage.");
          setError("Vui lòng đăng nhập để xem thông tin."); // Đặt lỗi và dừng
          setIsLoading(false);
          return; // Thoát khỏi hàm
        }

        // --- Bước 3: Gọi API lấy Profile ---
        console.log("[StudentInfoSection] Fetching profile with token...");
        // **QUAN TRỌNG: Đảm bảo URL endpoint này chính xác theo backend của bạn**
        // Ví dụ: '/sinhvien/profile' hoặc '/api/auth/profile'
        const profileApiUrl = `${API_BASE_URL}/sinhvien/profile`;

        const response = await axios.get(profileApiUrl, {
          headers: {
            // Gửi token trong header Authorization
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("[StudentInfoSection] Profile API Response:", response.data);

        // --- Bước 4: Xử lý Response ---
        if (response.data?.success && response.data?.student) {
          const fetchedData = response.data.student;

          // Xử lý URL ảnh đại diện
          let avatarFinalUrl = DEFAULT_AVATAR;
          if (fetchedData.image_profile) {
            // Nếu là URL đầy đủ (ví dụ từ Cloudinary) thì dùng luôn
            if (fetchedData.image_profile.startsWith('http')) {
              avatarFinalUrl = fetchedData.image_profile;
            } else {
              // Nếu là đường dẫn tương đối, ghép với API_BASE_URL
              // Đảm bảo thay thế dấu \ bằng / nếu cần (cho Windows paths)
              avatarFinalUrl = `${API_BASE_URL}/${fetchedData.image_profile.replace(/\\/g, '/')}`;
            }
          }

          // Cập nhật state với dữ liệu lấy được
          setStudentData({
            id: fetchedData.id,
            avatarUrl: avatarFinalUrl,
            name: fetchedData.ho_ten, // Dùng đúng tên cột từ backend
            studentId: fetchedData.mssv,
            // Truy cập tên lớp/khoa từ object lồng nhau (nếu backend trả về như vậy)
            className: fetchedData.lop?.ten_lop || 'N/A',
            faculty: fetchedData.khoa?.ten_khoa || 'N/A',
          });
          console.log("[StudentInfoSection] Student data state updated.");
        } else {
          // Backend báo lỗi hoặc cấu trúc dữ liệu sai
          console.error("[StudentInfoSection] API response indicates failure or invalid data structure.");
          throw new Error(response.data?.message || "Không thể tải thông tin sinh viên (phản hồi không hợp lệ).");
        }
      } catch (err) { // --- Bước 5: Xử lý Lỗi ---
        console.error("[StudentInfoSection] Fetch Profile Error:", err);
        if (err.response) {
          // Lỗi có response từ server (4xx, 5xx)
          console.error("-> Error Status:", err.response.status);
          console.error("-> Error Data:", err.response.data);
          if (err.response.status === 401 || err.response.status === 403) {
            setError("Phiên đăng nhập hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại.");
            // Cân nhắc xóa localStorage và chuyển hướng về login
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userData');
            // setTimeout(() => { window.location.href = '/login'; }, 2000);
          } else {
            // Các lỗi khác từ server
            setError(`Lỗi ${err.response.status}: ${err.response.data?.message || 'Lỗi từ máy chủ.'}`);
          }
        } else if (err.request) {
          // Lỗi không nhận được phản hồi (lỗi mạng)
          console.error("-> No response received:", err.request);
          setError("Lỗi kết nối: Không thể kết nối đến máy chủ.");
        } else {
          // Lỗi khác (lỗi code frontend, lỗi khi throw Error ở trên)
          console.error("-> Other Error:", err.message);
          setError(err.message || "Lỗi không xác định khi tải thông tin.");
        }
        setStudentData(null); // Reset data nếu có lỗi
      } finally {
        console.log("[StudentInfoSection] Fetch process finished.");
        setIsLoading(false); // Luôn dừng loading
      }
    };

    fetchStudentProfile(); // Gọi hàm fetch khi component mount
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy 1 lần

  // --- Hàm Kích Hoạt Input File ---
  const triggerFileInput = () => {
    if (!isUploading) { // Chỉ kích hoạt nếu không đang tải lên
        fileInputRef.current?.click();
    }
  };

  // --- Hàm Reset Input File ---
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // --- Hàm Xử Lý Chọn và Tải Ảnh Đại Diện ---
  const handleAvatarFileChange = async (event) => {
    const file = event.target.files[0];
    setError(''); // Xóa lỗi cũ

    if (!file) return; // Không có file nào được chọn

    // Kiểm tra file phía client
    if (!file.type.startsWith('image/')) { setError("Vui lòng chọn tệp hình ảnh."); resetFileInput(); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Kích thước ảnh quá lớn (tối đa 5MB)."); resetFileInput(); return; }

    setIsUploading(true); // Bắt đầu trạng thái đang tải lên
    const formData = new FormData();
    formData.append('profileImage', file); // Key 'profileImage' phải khớp với backend (multer)

    try {
        // Lấy token để xác thực
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Hiếm khi xảy ra nếu đã vào được đây, nhưng vẫn kiểm tra
            throw new Error("Vui lòng đăng nhập lại để cập nhật ảnh.");
        }

      console.log("Uploading new avatar...");
      // **QUAN TRỌNG: Đảm bảo URL endpoint này chính xác theo backend của bạn**
      // Ví dụ: '/sinhvien/avatar' hoặc '/api/auth/avatar'
      const avatarApiUrl = `${API_BASE_URL}/sinhvien/avatar`;

      // Gọi API để tải ảnh lên
      const response = await axios.post(avatarApiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Cần thiết cho việc tải file
          'Authorization': `Bearer ${token}`      // Gửi token để xác thực
        }
      });

      console.log("Avatar Upload Response:", response.data);

      // Xử lý kết quả thành công
      if (response.data?.success && response.data?.newAvatarUrl) {
        // Cập nhật state ngay lập tức với URL mới trả về từ backend (Cloudinary URL)
        setStudentData(prevData => ({
          ...prevData,
          avatarUrl: response.data.newAvatarUrl
        }));
        alert("Cập nhật ảnh đại diện thành công!"); // Hoặc dùng success message state
      } else {
         // Backend báo lỗi khi tải lên
        throw new Error(response.data?.message || "Không thể cập nhật ảnh đại diện.");
      }
    } catch (err) { // Xử lý lỗi khi tải ảnh
      console.error("Avatar Upload Error:", err);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setError("Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
       } else {
        // Hiển thị lỗi cụ thể từ backend hoặc lỗi chung
        setError(err.response?.data?.message || err.message || "Lỗi trong quá trình tải lên.");
       }
    } finally {
      setIsUploading(false); // Kết thúc trạng thái đang tải lên
      resetFileInput();    // Reset input file để có thể chọn lại file tương tự
    }
  };

  // --- Phần Render Giao Diện ---

  // Hiển thị trạng thái đang tải dữ liệu ban đầu
  if (isLoading) {
    return (
      <section className="student-info-section loading">
        <ClipLoader color={"#3f4096"} loading={isLoading} size={50} />
        <p>Đang tải thông tin...</p>
      </section>
    );
  }

  // Hiển thị lỗi nếu không tải được dữ liệu ban đầu
  if (error && !studentData) {
    return (
      <section className="student-info-section error">
        <p className="error-text">Lỗi: {error}</p>
        {/* Có thể thêm nút Thử lại hoặc Đăng nhập lại */}
      </section>
    );
  }

  // Dùng dữ liệu mặc định nếu studentData vẫn là null sau khi tải (phòng trường hợp hiếm)
  const data = studentData || { avatarUrl: DEFAULT_AVATAR, name: 'N/A', studentId: 'N/A', className: 'N/A', faculty: 'N/A' };

  // Giao diện chính khi có dữ liệu hoặc có lỗi nhưng vẫn hiển thị được data cũ
  return (
    <section className="student-info-section">
       {/* Hiển thị lỗi tải ảnh (nếu có) mà không che mất thông tin khác */}
       {error && studentData && <p className="error-text inline-error">{error}</p>}

      <div className="avatar-container">
        {/* Lớp phủ loading khi đang tải ảnh lên */}
        {isUploading && (
          <div className="avatar-upload-overlay">
            <ClipLoader color={"#ffffff"} loading={isUploading} size={30} />
          </div>
        )}
        {/* Ảnh đại diện */}
        <img
          src={data.avatarUrl || DEFAULT_AVATAR} // Luôn có fallback
          alt={`Ảnh đại diện của ${data.name}`}
          className="student-avatar"
          // Xử lý lỗi nếu URL ảnh bị hỏng
          onError={(e) => {
            if (e.target.src !== DEFAULT_AVATAR) {
                 console.warn(`Lỗi tải ảnh ${e.target.src}, sử dụng ảnh mặc định.`);
                 e.target.onerror = null; // Ngăn lặp vô hạn nếu ảnh mặc định cũng lỗi
                 e.target.src = DEFAULT_AVATAR;
            }
           }}
        />
        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileChange}
          accept="image/png, image/jpeg, image/gif" // Chỉ định rõ các loại ảnh chấp nhận
          style={{ display: 'none' }} // Luôn ẩn
          disabled={isUploading} // Vô hiệu hóa khi đang tải lên
        />
         {/* Nút bấm để mở cửa sổ chọn file */}
        <button
          className="change-avatar-button"
          onClick={triggerFileInput} // Gọi hàm kích hoạt input ẩn
          aria-label="Thay đổi ảnh đại diện"
          title="Thay đổi ảnh đại diện"
          disabled={isUploading} // Vô hiệu hóa khi đang tải lên
        >
          <FaCamera /> {/* Icon camera */}
        </button>
      </div>

      {/* Chi tiết thông tin sinh viên */}
      <div className="student-details">
        <h3>{data.name}</h3>
        <p><strong>MSSV:</strong> {data.studentId}</p>
        <p><strong>Lớp:</strong> {data.className}</p>
        <p><strong>Khoa:</strong> {data.faculty}</p>
      </div>
    </section>
  );
};

export default StudentInfoSection;