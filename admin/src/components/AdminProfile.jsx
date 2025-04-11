// src/components/admin/AdminProfile.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaCamera, FaSpinner, FaUserCircle } from 'react-icons/fa';
import './AdminProfile.css'; // Đảm bảo bạn có file CSS này

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000'; // URL Backend của bạn

// --- Helper: Lấy ID admin hiện tại từ localStorage ---
const getCurrentAdminId = () => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
        try { return JSON.parse(storedUser).id; } catch (e) { return null; }
    }
    return null;
};

// --- Component Chính ---
const AdminProfile = ({ initialAdminUser, onProfileUpdate }) => {
    // State cho dữ liệu profile, khởi tạo từ prop hoặc null
    const [profileData, setProfileData] = useState(initialAdminUser || null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(!initialAdminUser);

    // State cho việc cập nhật ảnh
    const [newImageFile, setNewImageFile] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // State cho tên Khoa/Lop và UI
    const [khoaName, setKhoaName] = useState('');
    const [lopName, setLopName] = useState('');
    const [isLoadingNames, setIsLoadingNames] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fileInputRef = useRef(null);
    const adminId = getCurrentAdminId();

    // --- Fetch Profile Data nếu chưa có hoặc cần làm mới ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!adminId) {
                setError("Không thể xác định ID người dùng.");
                setIsLoadingProfile(false); return;
            }
            if (!profileData) { // Chỉ fetch nếu chưa có dữ liệu
                setIsLoadingProfile(true); setError('');
                try {
                    // Gọi API GET /api/admin/profile/:id (đã có JOIN)
                    const response = await axios.get(`${API_BASE_URL}/admin/profile/${adminId}`);
                    if (response.data.success) {
                        setProfileData(response.data.user);
                        // Thông báo cho parent component về dữ liệu mới (nếu cần)
                        if (onProfileUpdate) onProfileUpdate(response.data.user);
                    } else {
                        setError(response.data.message || "Lỗi tải thông tin cá nhân.");
                    }
                } catch (err) {
                    setError("Lỗi kết nối hoặc lỗi không xác định khi tải thông tin.");
                    console.error("Fetch Profile error:", err);
                } finally {
                    setIsLoadingProfile(false);
                }
            } else {
                setIsLoadingProfile(false); // Đã có dữ liệu từ prop
            }
        };
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminId]); // Phụ thuộc vào adminId

    useEffect(() => {
        if (profileData) {
            setKhoaName(profileData.ten_khoa || 'Không xác định'); // Lấy tên khoa từ dữ liệu profile
            setLopName(profileData.ten_lop || 'Không có');       // Lấy tên lớp từ dữ liệu profile
        }
    }, [profileData]); // Chạy khi profileData thay đổi

    // --- Xử lý chọn ảnh (Tương tự code trước) ---
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setError(''); setSuccessMessage('');
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) { setError("Ảnh quá lớn (tối đa 5MB)."); resetFileInput(); return; }
            setNewImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setNewImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else { resetFileInput(); if (file) setError("Vui lòng chọn ảnh (JPEG, PNG, GIF)."); }
    };

    // --- Reset input ảnh (Tương tự code trước) ---
    const resetFileInput = () => {
        setNewImageFile(null); setNewImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    // --- Kích hoạt input ẩn (Tương tự code trước) ---
    const triggerFileInput = () => { fileInputRef.current?.click(); };

    // --- Xử lý Upload Ảnh ---
    const handleImageUpload = async () => {
        if (!newImageFile || !adminId) { setError("Vui lòng chọn ảnh mới."); return; }

        setIsUploading(true); setError(''); setSuccessMessage('');
        const formData = new FormData();
        formData.append('profileImage', newImageFile);
        // --- QUAN TRỌNG: Đảm bảo backend biết user nào cần update ---
        // Cách 1: Nếu backend xác thực qua session/token và tự biết user ID
        // Cách 2: Gửi kèm userId (NHƯNG CẦN BẢO MẬT phía backend)
        formData.append('userId', adminId); // Ví dụ gửi kèm ID (Backend cần xử lý an toàn)

        try {
            // Gọi API PUT /api/admin/profile/image
            const response = await axios.put(
                `${API_BASE_URL}/admin/profile/image`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' /*, Authorization: `Bearer ...` */ } }
            );

            if (response.data.success && response.data.user) {
                setSuccessMessage("Cập nhật ảnh đại diện thành công!");
                const updatedUser = response.data.user;
                // Cập nhật state local và state ở parent
                setProfileData(updatedUser);
                if (onProfileUpdate) onProfileUpdate(updatedUser);
                resetFileInput();
            } else {
                setError(response.data.message || "Cập nhật ảnh thất bại.");
            }
        } catch (err) {
            console.error("Profile image upload error:", err);
            if (err.response?.data?.message) setError(err.response.data.message);
            else setError('Lỗi kết nối hoặc lỗi không xác định khi tải ảnh.');
        } finally {
            setIsUploading(false);
        }
    };

    // --- Render ---
    if (isLoadingProfile) {
        return <div className="loading-indicator">Đang tải thông tin cá nhân...</div>;
    }
    if (!profileData) {
        return <div className="message-box error-message"><span>{error || "Không thể tải thông tin cá nhân."}</span></div>;
    }

    const displayImage = newImagePreview || profileData.image_profile || '/default-avatar.png';

    return (
        <div className="admin-profile-container">
            <h2>Thông tin Cá nhân Cán bộ</h2>

            {error && <div className="message-box error-message"><span>{error}</span><button onClick={() => setError('')}>X</button></div>}
            {successMessage && <div className="message-box success-message"><span>{successMessage}</span><button onClick={() => setSuccessMessage('')}>X</button></div>}

            <div className="profile-layout">
                {/* --- Khu vực Ảnh --- */}
                <div className="profile-image-area">
                    <img src={displayImage} alt="Ảnh đại diện" className="profile-image-display" onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}/>
                    <button type="button" onClick={triggerFileInput} className="image-select-button" disabled={isUploading}>
                        <FaCamera style={{ marginRight: '8px' }} /> Đổi ảnh
                    </button>
                    <input id="profileImageInputUpdate" ref={fileInputRef} name="profileImage" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} disabled={isUploading} />
                    {newImageFile && (
                        <div className="image-action-buttons">
                            <button onClick={handleImageUpload} className="image-upload-button" disabled={isUploading}>
                                {isUploading ? <><FaSpinner className="spinner" /> Đang lưu...</> : 'Lưu ảnh mới'}
                            </button>
                            <button onClick={resetFileInput} className="image-cancel-button" disabled={isUploading}> Hủy </button>
                        </div>
                    )}
                </div>

                {/* --- Khu vực Thông tin chi tiết --- */}
                <div className="profile-details-area">
                    <DetailItem label="Họ và tên" value={profileData.ho_ten} />
                    <DetailItem label="MSCB" value={profileData.mssv} />
                    <DetailItem label="Email" value={profileData.email} />
                    <DetailItem label="Chức vụ" value={profileData.chuc_vu} />
                    {/* Hiển thị tên Khoa/Lớp đã lấy từ profileData */}
                    <DetailItem label="Khoa" value={khoaName} isLoading={isLoadingNames}/>
                    <DetailItem label="Lớp phụ trách" value={lopName} isLoading={isLoadingNames} />
                    {/* Bạn có thể thêm các thông tin khác nếu cần */}
                </div>
            </div>
        </div>
    );
};

// Component phụ để hiển thị từng dòng chi tiết, có xử lý loading
const DetailItem = ({ label, value, isLoading = false }) => (
    <div className="detail-item">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">
            {isLoading ? 'Đang tải...' : (value || <span className="not-available">Chưa có</span>)}
        </span>
    </div>
);


export default AdminProfile;