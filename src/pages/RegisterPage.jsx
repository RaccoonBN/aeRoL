// src/RegisterPage.js
import React, { useState, useEffect } from 'react';
import './RegisterPage.css'; // Tạo file CSS riêng cho trang Register (hoặc dùng chung nếu giống hệt)

// --- Configuration (Simulated) ---
const VAA_EMAIL_DOMAIN = 'vaa.edu.vn';
const SIMULATED_DELAY = 1000;

// --- Simulated Data ---
const faculties = ['Công nghệ Thông tin', 'Quản lý Hoạt động Bay', 'Kỹ thuật Hàng không', 'Kinh tế Vận tải'];
const classByFaculty = {
    'Công nghệ Thông tin': ['CNTT K19', 'CNTT K20', 'CNTT K21'],
    'Quản lý Hoạt động Bay': ['AT K19', 'AT K20', 'AT K21'],
    'Kỹ thuật Hàng không': ['KTHK K20', 'KTHK K21A', 'KTHK K21B'],
    'Kinh tế Vận tải': ['KTVT K21A', 'KTVT K21B', 'KTVT K22'],
};

// --- Simulated Backend Logic Helpers ---
const simulateApiCall = (callback, delay = SIMULATED_DELAY) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(callback());
        }, delay);
    });
};

const RegisterPage = () => {
    // Chỉ chứa state cần thiết cho Đăng ký và Xác thực sau đăng ký
    const [view, setView] = useState('register'); // 'register', 'verify'
    const [email, setEmail] = useState(''); // Chỉ dùng email để đăng ký
    const [password, setPassword] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [mssv, setMssv] = useState('');
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailForVerification, setEmailForVerification] = useState(''); // Lưu email đã đăng ký
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Dropdown logic ---
    const availableLop = selectedKhoa ? (classByFaculty[selectedKhoa] || []) : [];
    useEffect(() => {
        setSelectedLop('');
    }, [selectedKhoa]);

    // --- Helper Functions ---
    const clearForm = () => {
        // Không xóa emailForVerification khi đang ở bước xác thực
        if (view === 'register') {
             setEmail('');
             setHoTen('');
             setMssv('');
             setSelectedKhoa('');
             setSelectedLop('');
        }
        setPassword('');
        setVerificationCode('');
        setError('');
        setSuccessMessage('');
    };

    // --- Event Handlers (Simulated Logic - Chỉ cho Register) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra email không phải VAA
        if (typeof email === 'string' && email.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) {
             setError(`Email @${VAA_EMAIL_DOMAIN} không dùng để đăng ký. Vui lòng sử dụng chức năng Đăng nhập.`);
             return;
        }
        // Kiểm tra các trường khác
        if (!hoTen || !mssv || !selectedKhoa || !selectedLop || !email || !password) {
            setError('Vui lòng điền đầy đủ thông tin đăng ký.');
            return;
        }
         // Kiểm tra định dạng email cơ bản
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
         }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        await simulateApiCall(() => {
             // Giả lập kiểm tra email tồn tại
             if (email === 'exists@user.com') {
                 setError('Email này đã được đăng ký (Mô phỏng).');
             } else {
                 // Giả lập đăng ký thành công -> chuyển sang xác thực
                 setSuccessMessage(`Đăng ký thành công! Mã xác thực đã gửi đến ${email} (Mô phỏng). Vui lòng kiểm tra email.`);
                 setEmailForVerification(email); // Lưu email vừa đăng ký
                 // Không clear form hoàn toàn, chỉ password và code
                 setPassword('');
                 setVerificationCode('');
                 setView('verify'); // Chuyển sang màn hình nhập mã
             }
        });
        setLoading(false);
     };

    // Xử lý xác thực (sau khi đăng ký)
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!verificationCode || verificationCode.length !== 6) { setError('Mã xác thực phải gồm 6 chữ số.'); return; }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        await simulateApiCall(() => {
            if (verificationCode === '123456') { // Giả lập mã đúng
                setSuccessMessage('Xác thực thành công! Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ. (Mô phỏng)');
                // Clear hết form sau khi thành công
                clearForm();
                setEmailForVerification(''); // Xóa cả email đã lưu
                // Có thể tự động chuyển hướng về trang login sau vài giây
                // Hoặc để người dùng tự click link quay lại
                setView('register'); // Quay lại view register để hiển thị thông báo thành công
            } else {
                setError('Mã xác thực không đúng (Mô phỏng).');
            }
        });
        setLoading(false);
    };

    // Gửi lại mã (sau khi đăng ký)
    const handleResendCode = async () => {
         if (!emailForVerification) { setError("Không tìm thấy email để gửi lại mã."); return; }

         setLoading(true);
         setError('');
         setSuccessMessage('');

         await simulateApiCall(() => {
             setSuccessMessage(`Đã gửi lại mã xác thực đến ${emailForVerification} (Mô phỏng).`);
         }, 500);
         setLoading(false);
     };

    // Chuyển view nội bộ (Verify) hoặc reset về register
    const switchInternalView = (newView) => {
        setView(newView);
        setError('');
        setSuccessMessage('');
        // Không cần clear form khi chuyển giữa register và verify
    };

    // --- Render Logic ---
    const renderContent = () => {
        switch (view) {
            case 'verify': // Sau khi đăng ký
                 return (
                     <form onSubmit={handleVerificationSubmit}>
                         <h2>Xác thực Email Đăng ký</h2>
                         <p>Mã xác thực (giả lập là <strong>123456</strong>) đã được gửi đến <strong>{emailForVerification}</strong>.</p>
                         <input
                             name="verificationCode"
                             type="text"
                             placeholder="Nhập mã xác thực (6 chữ số)"
                             value={verificationCode}
                             onChange={(e) => setVerificationCode(e.target.value)}
                             maxLength={6}
                             required
                         />
                         <button type="submit" disabled={loading}>
                             {loading ? 'Đang xác thực...' : 'Xác thực Đăng ký'}
                         </button>
                          <div className="button-group">
                              <button type="button" onClick={handleResendCode} disabled={loading} className="link-button">Gửi lại mã (Mô phỏng)</button>
                              {/* Nút quay lại form đăng ký ban đầu */}
                              <button type="button" onClick={() => switchInternalView('register')} disabled={loading} className="link-button cancel-button">Quay lại</button>
                          </div>
                          <p className="toggle-view" style={{marginTop: '1rem'}}>
                                Đã xác thực xong? <a href="/" className="link-button">Đến trang Đăng nhập</a>
                           </p>
                     </form>
                 );
            case 'register':
            default:
                return (
                    <form onSubmit={handleRegisterSubmit}>
                        <h2>Đăng ký tài khoản AeroRL+</h2>
                        <p>Chỉ dành cho email không có đuôi @{VAA_EMAIL_DOMAIN}.</p>
                        <input name="hoTen" type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                        <input name="mssv" type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} required />
                        <input name="email" type="email" placeholder="Email đăng ký" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input name="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <select name="khoa" value={selectedKhoa} onChange={(e) => setSelectedKhoa(e.target.value)} required>
                            <option value="">-- Chọn Khoa --</option>
                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select name="lop" value={selectedLop} onChange={(e) => setSelectedLop(e.target.value)} required disabled={!selectedKhoa || availableLop.length === 0}>
                            <option value="">-- Chọn Lớp --</option>
                            {availableLop.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {!selectedKhoa && availableLop.length === 0 && <p className="helper-text">Vui lòng chọn Khoa để hiển thị Lớp.</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký & Nhận mã'}
                        </button>
                        {/* Link quay về trang đăng nhập */}
                        <p className="toggle-view">
                            Đã có tài khoản?{' '}
                            {/* Giả sử trang login ở route / */}
                            <a href="/" className="link-button">Đăng nhập tại đây</a>
                        </p>
                    </form>
                );
        }
    };

     return (
        <div className="auth-container">
            <div className="auth-box">
                 {/* Logo riêng cho trang đăng ký nếu cần, hoặc dùng chung */}
                <div className="logo-placeholder">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="logo-image" />
                </div>

                {error && (
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                         <button className="close-button" onClick={() => setError('')} aria-label="Close">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                         </button>
                    </div>
                )}
                {successMessage && !error && (
                     <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                         <button className="close-button" onClick={() => setSuccessMessage('')} aria-label="Close">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                         </button>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default RegisterPage;