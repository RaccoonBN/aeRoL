// src/pages/AdminRegisterPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css'; // Sử dụng file CSS riêng hoặc sửa RegisterPage.css
import { FaEnvelope, FaLock, FaIdCard, FaUser, FaBriefcase, FaSchool, FaChalkboardTeacher, FaCamera } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000'; // URL Backend của bạn

const AdminRegisterPage = () => {
    // --- State Variables (Tương tự code trước) ---
    const [mssv, setMssv] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [chucVu, setChucVu] = useState('');
    const [selectedKhoaId, setSelectedKhoaId] = useState('');
    const [selectedLopId, setSelectedLopId] = useState('');
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null); // URL xem trước

    const [khoaOptions, setKhoaOptions] = useState([]);
    const [lopOptions, setLopOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref để truy cập input file ẩn

    // --- Fetch Khoa/Lớp (Tương tự code trước) ---
    useEffect(() => {
        const fetchKhoa = async () => { setLoadingOptions(true); try { /* ... */ } catch (err) { /* ... */ } finally { setLoadingOptions(false); } };
        fetchKhoa();
    }, []);
    useEffect(() => {
        const fetchLop = async () => { if (!selectedKhoaId) { /* ... */ return; } setLoadingOptions(true); try { /* ... */ } catch (err) { /* ... */ } finally { setLoadingOptions(false); } };
        fetchLop();
    }, [selectedKhoaId]);
     // --- Code fetch API giữ nguyên như trước ---
     useEffect(() => {
        const fetchKhoa = async () => {
            setLoadingOptions(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/common/khoa`);
                if (response.data.success) setKhoaOptions(response.data.khoaList);
                else setError('Lỗi: Không thể tải danh sách Khoa.');
            } catch (err) { setError('Lỗi kết nối khi tải danh sách Khoa.'); console.error(err); }
            finally { setLoadingOptions(false); }
        };
        fetchKhoa();
    }, []);

    useEffect(() => {
        const fetchLop = async () => {
            if (!selectedKhoaId) { setLopOptions([]); setSelectedLopId(''); return; }
            setLoadingOptions(true); setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/common/lop?khoaId=${selectedKhoaId}`);
                if (response.data.success) { setLopOptions(response.data.lopList); setSelectedLopId('');}
                else { setError('Lỗi: Không thể tải danh sách Lớp.'); setLopOptions([]); }
            } catch (err) { setError('Lỗi kết nối khi tải danh sách Lớp.'); setLopOptions([]); console.error(err); }
            finally { setLoadingOptions(false); }
        };
        fetchLop();
    }, [selectedKhoaId]);


    // --- Xử lý thay đổi ảnh ---
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setError(''); // Xóa lỗi cũ khi chọn file mới
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB (ví dụ)
                 setError("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                 setProfileImageFile(null);
                 setProfileImagePreview(null);
                 fileInputRef.current.value = null; // Reset input file
                 return;
            }
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setProfileImageFile(null);
            setProfileImagePreview(null);
            if (file) setError("Vui lòng chọn một tệp hình ảnh hợp lệ (JPEG, PNG, GIF).");
        }
    };

    // --- Hàm kích hoạt input file ẩn ---
    const triggerFileInput = () => {
        fileInputRef.current?.click(); // Dấu ? để tránh lỗi nếu ref chưa sẵn sàng
    };

    // --- Xử lý Submit Form (Logic API giữ nguyên) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        // --- Validation (Giữ nguyên) ---
         if (!mssv || !email || !password || !confirmPassword || !hoTen || !selectedKhoaId || !selectedLopId || !chucVu) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.'); return;
        }
        if (password !== confirmPassword) { setError('Mật khẩu không khớp.'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { setError('Email không hợp lệ.'); return; }

        setLoading(true); setError(''); setSuccessMessage('');

        const formData = new FormData();
        // --- Append dữ liệu (Giữ nguyên) ---
         formData.append('mssv', mssv);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        formData.append('hoTen', hoTen);
        formData.append('selectedKhoaId', selectedKhoaId);
        formData.append('selectedLopId', selectedLopId);
        formData.append('chucVu', chucVu);
        if (profileImageFile) formData.append('profileImage', profileImageFile);


        try {
             // --- Gọi API (Giữ nguyên) ---
            const response = await axios.post(`${API_BASE_URL}/admin/register`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

             if (response.data.success) {
                setSuccessMessage(response.data.message + " Đang chuyển hướng...");
                setTimeout(() => navigate('/admin/login'), 2500);
            } else {
                setError(response.data.message || 'Đăng ký thất bại.');
            }
        } catch (err) {
             // --- Xử lý lỗi (Giữ nguyên) ---
              if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.request) { setError('Không thể kết nối máy chủ.'); }
            else { setError('Lỗi không mong muốn khi đăng ký.'); }
            console.error("Admin Register API error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---
    return (
        <div className="auth-container register-page admin-register">
            <div className="auth-box">
                <div className="logo-placeholder">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="logo-image" />
                </div>
                <h2>Đăng ký tài khoản Cán bộ</h2>

                {/* Messages */}
                {error && <div className="message-box error-message"><span>{error}</span><button onClick={() => setError('')}>X</button></div>}
                {successMessage && !error && <div className="message-box success-message"><span>{successMessage}</span></div>}

                <form onSubmit={handleRegisterSubmit}>
                    {/* ---- Bố cục 2 cột ---- */}
                    <div className="form-columns-container">
                        {/* ---- Cột 1: Thông tin cá nhân & Đăng nhập ---- */}
                        <div className="form-column">
                            <div className="input-with-icon">
                                <FaIdCard className="input-icon" />
                                <input name="mssv" type="text" placeholder="Mã số sinh viên" value={mssv} onChange={(e) => setMssv(e.target.value)} required disabled={loading} />
                            </div>
                            <div className="input-with-icon">
                                <FaUser className="input-icon" />
                                <input name="hoTen" type="text" placeholder="Họ và tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required disabled={loading} />
                            </div>
                             <div className="input-with-icon">
                                <FaEnvelope className="input-icon" />
                                <input name="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                             </div>
                            <div className="input-with-icon">
                                <FaLock className="input-icon" />
                                <input name="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                             </div>
                            <div className="input-with-icon">
                                <FaLock className="input-icon" />
                                <input name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                            </div>
                        </div>

                        {/* ---- Cột 2: Thông tin công tác & Ảnh ---- */}
                        <div className="form-column">
                            <div className="input-with-icon">
                                <FaBriefcase className="input-icon" />
                                <input name="chucVu" type="text" placeholder="Chức vụ" value={chucVu} onChange={(e) => setChucVu(e.target.value)} required disabled={loading} />
                             </div>
                             <div className="input-with-icon">
                                <FaSchool className="input-icon" />
                                <select name="khoa" value={selectedKhoaId} onChange={(e) => setSelectedKhoaId(e.target.value)} required disabled={loading || loadingOptions}>
                                    <option value="">-- {loadingOptions ? 'Đang tải Khoa...' : 'Chọn Khoa'} --</option>
                                    {khoaOptions.map(khoa => <option key={khoa.id} value={khoa.id}>{khoa.ten_khoa}</option>)}
                                </select>
                             </div>
                             <div className="input-with-icon">
                                <FaChalkboardTeacher className="input-icon" />
                                <select name="lop" value={selectedLopId} onChange={(e) => setSelectedLopId(e.target.value)} required disabled={!selectedKhoaId || loading || loadingOptions || lopOptions.length === 0}>
                                    <option value="">-- {loadingOptions ? 'Đang tải Lớp...' : (lopOptions.length === 0 && selectedKhoaId ? 'Không có Lớp' : 'Chọn Lớp Phụ Trách')} --</option>
                                    {lopOptions.map(lop => <option key={lop.id} value={lop.id}>{lop.ten_lop}</option>)}
                                </select>
                             </div>
                              {!selectedKhoaId && <p className="helper-text form-column-helper">Vui lòng chọn Khoa để hiển thị Lớp.</p>}

                             {/* ---- Khu vực chọn ảnh đại diện ---- */}
                             <div className="profile-image-section">
                                 <img
                                     src={profileImagePreview || '/default-avatar.jpg'} // Hiển thị ảnh xem trước hoặc ảnh mặc định
                                     alt="Ảnh đại diện"
                                     className="profile-image-preview-circle"
                                     onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} // Fallback nếu ảnh lỗi
                                 />
                                 <div className='profile-image-controls'>
                                     <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="profile-image-button"
                                        disabled={loading}
                                    >
                                        <FaCamera style={{ marginRight: '5px' }} /> Chọn ảnh
                                    </button>
                                    <p className="profile-image-hint">Ảnh PNG, JPG, GIF (dưới 5MB)</p>
                                 </div>

                                 {/* Input file ẩn */}
                                 <input
                                    id="profileImageInput"
                                    ref={fileInputRef}
                                    name="profileImage"
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                             </div>
                        </div>
                    </div> {/* Kết thúc form-columns-container */}

                    {/* --- Nút Submit và Link Đăng nhập --- */}
                    <button type="submit" className="submit-button" disabled={loading || loadingOptions}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                    <p className="toggle-view">
                        Đã có tài khoản?{' '}
                        <Link to="/admin/login" className="link-button">Đăng nhập tại đây</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminRegisterPage;