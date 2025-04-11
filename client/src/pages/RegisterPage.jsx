// src/RegisterPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import './RegisterPage.css';
import { FaUser, FaIdCard, FaEnvelope, FaLock, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api'; // Địa chỉ backend
const VAA_EMAIL_DOMAIN = 'vaa.edu.vn';

// --- Simulated Data (NÊN LẤY TỪ API) ---
const faculties = ['Công nghệ Thông tin', 'Quản lý Hoạt động Bay', 'Kỹ thuật Hàng không', 'Kinh tế Vận tải'];
const classByFaculty = {
    'Công nghệ Thông tin': ['CNTT K19', 'CNTT K20', 'CNTT K21'],
    'Quản lý Hoạt động Bay': ['AT K19', 'AT K20', 'AT K21'],
    'Kỹ thuật Hàng không': ['KTHK K20', 'KTHK K21A', 'KTHK K21B'],
    'Kinh tế Vận tải': ['KTVT K21A', 'KTVT K21B', 'KTVT K22'],
};
// --- Kết thúc Simulated Data ---

const RegisterPage = () => {
    // Chỉ còn view 'register'
    // State cho form đăng ký
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [mssv, setMssv] = useState('');
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');ng
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    // --- Dropdown logic (giữ nguyên) ---
    const availableLop = selectedKhoa ? (classByFaculty[selectedKhoa] || []) : [];
    useEffect(() => {
        setSelectedLop('');
    }, [selectedKhoa]);

    // --- Helper Function ---
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setHoTen('');
        setMssv('');
        setSelectedKhoa('');
        setSelectedLop('');
        setError('');
        // Giữ success message
    };

    // --- Event Handlers ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        // Frontend validation (giữ nguyên)
        if (typeof email === 'string' && email.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) {
            setError(`Email @${VAA_EMAIL_DOMAIN} không dùng để đăng ký.`); return;
        }
        if (!hoTen || !mssv || !selectedKhoa || !selectedLop || !email || !password) {
            setError('Vui lòng điền đầy đủ thông tin đăng ký.'); return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.'); return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await axios.post(`${API_BASE_URL}/student/register`, {
                email,
                password,
                hoTen,
                mssv,
                selectedKhoa,
                selectedLop
            });

            const data = response.data;
            if (data.success) {
                setSuccessMessage(data.message + " Hãy quay lại trang đăng nhập.");
                clearForm(); // Xóa form sau khi thành công
                setTimeout(() => { window.location.href = '/'; }, 3000); // Ví dụ chuyển hướng sau 3s
            }
            // Lỗi 400, 409 đã được xử lý trong catch

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Lỗi kết nối hoặc đăng ký thất bại.');
            }
            console.error("Register API error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic (Chỉ còn form đăng ký) ---
    const renderContent = () => {
        return (
            <form onSubmit={handleRegisterSubmit}>
                <h2>Đăng ký tài khoản Sinh viên</h2>
                <p>Sử dụng email cá nhân (không phải @{VAA_EMAIL_DOMAIN}).</p>
                <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input name="hoTen" type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                </div>
                <div className="input-with-icon">
                    <FaIdCard className="input-icon" />
                    <input name="mssv" type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} required />
                </div>
                <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input name="email" type="email" placeholder="Email đăng ký" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input name="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="input-with-icon">
                    <FaSchool className="input-icon" />
                    <select name="khoa" value={selectedKhoa} onChange={(e) => setSelectedKhoa(e.target.value)} required>
                        <option value="">-- Chọn Khoa --</option>
                        {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="input-with-icon">
                    <FaChalkboardTeacher className="input-icon" />
                    <select name="lop" value={selectedLop} onChange={(e) => setSelectedLop(e.target.value)} required disabled={!selectedKhoa || availableLop.length === 0}>
                        <option value="">-- Chọn Lớp --</option>
                        {availableLop.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {!selectedKhoa && availableLop.length === 0 && <p className="helper-text">Vui lòng chọn Khoa để hiển thị Lớp.</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
                <p className="toggle-view">
                    Đã có tài khoản?{' '}
                    <a href="/" className="link-button">Đăng nhập tại đây</a> {/* Giả sử trang login ở / */}
                </p>
            </form>
        );
    };

     // --- Main Render (Giữ nguyên cấu trúc nhưng chỉ gọi renderContent) ---
     return (
         <div className="auth-container register-page">
            <div className="auth-box">
                 {/* Logo */}
                 <div className="logo-placeholder">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="logo-image" />
                </div>

                {error && (
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                         <button className="close-button" onClick={() => setError('')} aria-label="Close">X</button>
                    </div>
                 )}
                {successMessage && !error && (
                     <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                       
                    </div>
                )}

                {/* Form Content */}
                {renderContent()}
            </div>
        </div>
    );
};

export default RegisterPage;