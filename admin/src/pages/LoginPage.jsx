// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css'; // Sử dụng file CSS cũ
import { FaEnvelope, FaLock, FaIdCard, FaUser, FaBriefcase, FaSchool, FaChalkboardTeacher } from 'react-icons/fa'; // Cập nhật icons

// --- Configuration (Simulated) ---
const SIMULATED_DELAY = 1000;

// --- Simulated "Database" ---
// Giả lập một vài tài khoản admin
const simulatedAdminDB = {
  'admin.test@vaa.edu.vn': { password: 'password123', profileComplete: true, name: 'Admin Chính' },
  'cb.doan@vaa.edu.vn': { password: 'securepassword', profileComplete: true, name: 'Cán bộ Đoàn' },
  'new.admin@vaa.edu.vn': { password: 'newadmin', profileComplete: false, name: null }, // Admin mới cần cập nhật
};
// --- End Simulated "Database" ---


// --- Simulated Backend Logic Helpers ---
const simulateApiCall = (callback, delay = SIMULATED_DELAY) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(callback());
        }, delay);
    });
};

const LoginPage = () => {
    // Views: login, completeProfile
    const [view, setView] = useState('login');
    // State cho form login
    const [email, setEmail] = useState(''); // Chỉ dùng email để login
    const [password, setPassword] = useState('');
    // State cho form hoàn thành hồ sơ
    const [profileEmail, setProfileEmail] = useState(''); // Email trong form hồ sơ
    const [staffId, setStaffId] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [chucVu, setChucVu] = useState('');
    const [khoaCongTac, setKhoaCongTac] = useState('');
    const [lopPhuTrach, setLopPhuTrach] = useState('');
    // State chung
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [emailForProfileProcess, setEmailForProfileProcess] = useState(''); // Lưu email đã login thành công để xử lý profile

    // --- Helper Functions ---
    const clearLoginForm = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMessage('');
    };
    const clearProfileForm = () => {
        setProfileEmail(''); // Xóa cả email trong form profile
        setStaffId('');
        setHoTen('');
        setChucVu('');
        setLopPhuTrach('');
        setKhoaCongTac('');
        setError(''); // Xóa lỗi của form profile
    };

    // --- Event Handlers ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        // Chỉ cần kiểm tra email và password
        if (!email || !password) {
            setError('Vui lòng nhập Email và Mật khẩu.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        await simulateApiCall(() => {
            // --- Logic kiểm tra "database" giả lập ---
            const adminAccount = simulatedAdminDB[email.toLowerCase()]; // Tìm tài khoản bằng email (chuyển về chữ thường để không phân biệt hoa thường)

            if (adminAccount && adminAccount.password === password) {
                // --- Đăng nhập thành công ---
                if (adminAccount.profileComplete) {
                    // Hồ sơ đã đầy đủ
                    setSuccessMessage(`Đăng nhập quản trị (${adminAccount.name || email}) thành công! (Mô phỏng)`);
                    clearLoginForm();
                    // Trong thực tế: lưu token, chuyển hướng admin dashboard
                    // Giữ view login để xem thông báo
                } else {
                    // Cần hoàn thành hồ sơ
                    setSuccessMessage('Đăng nhập lần đầu thành công! Vui lòng cập nhật hồ sơ của bạn.');
                    setEmailForProfileProcess(email); // Lưu email đang xử lý
                    setProfileEmail(email); // Điền sẵn email vào form profile
                    clearLoginForm(); // Xóa thông tin login
                    setView('completeProfile'); // Chuyển sang view cập nhật hồ sơ
                }
            } else {
                // --- Sai thông tin hoặc không tồn tại ---
                setError('Email hoặc mật khẩu quản trị không chính xác (Mô phỏng).');
            }
        });
        setLoading(false);
    };

    const handleProfileCompletionSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra các trường bắt buộc (bao gồm cả email trong form profile theo yêu cầu)
        if (!profileEmail || !staffId || !hoTen || !chucVu || !khoaCongTac) {
             setError('Vui lòng điền đầy đủ thông tin bắt buộc: Email, MSCB, Họ tên, Chức vụ, Khoa/Đơn vị.');
             return;
        }
        // Optional: Kiểm tra xem email trong form có khớp với email đã login không
        if (profileEmail.toLowerCase() !== emailForProfileProcess.toLowerCase()) {
            setError('Email trong hồ sơ không khớp với tài khoản đăng nhập.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        await simulateApiCall(() => {
            // Giả lập lưu thông tin thành công
            console.log('Simulating profile update for:', emailForProfileProcess);
            console.log({ profileEmail, staffId, hoTen, chucVu, lopPhuTrach, khoaCongTac });

            // --- Cập nhật trạng thái profileComplete trong DB giả lập (quan trọng cho lần login sau) ---
            if (simulatedAdminDB[emailForProfileProcess.toLowerCase()]) {
                simulatedAdminDB[emailForProfileProcess.toLowerCase()].profileComplete = true;
                simulatedAdminDB[emailForProfileProcess.toLowerCase()].name = hoTen; // Cập nhật tên để hiển thị lần sau
            }
             // --- Kết thúc cập nhật DB giả lập ---

            setSuccessMessage('Cập nhật hồ sơ thành công! Đăng nhập thành công! (Mô phỏng)');
            clearProfileForm(); // Xóa form profile
            setEmailForProfileProcess(''); // Xóa email đang xử lý
            // Trong thực tế: lưu token, chuyển hướng admin dashboard
            setView('login'); // Quay về view login để xem thông báo
        });
        setLoading(false);
    };

    // Chuyển về màn hình login
    const switchToLogin = () => {
        clearProfileForm();
        setEmailForProfileProcess('');
        setView('login');
    }


    // --- Render Logic ---
    const renderContent = () => {
        switch (view) {
            case 'completeProfile':
                return (
                     <form onSubmit={handleProfileCompletionSubmit}>
                        <h2>Cập nhật Hồ sơ Cán bộ</h2>
                        <p>Đây là lần đăng nhập đầu tiên, vui lòng cập nhật thông tin của bạn.</p>

                        {/* Input Email (theo yêu cầu) - Thường là readonly hoặc ẩn */}
                        <div className="input-with-icon">
                           <FaEnvelope className="input-icon" />
                           <input name="profileEmail" type="email" placeholder="Email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
                           {/* Có thể thêm thuộc tính readOnly={true} nếu không cho sửa */}
                        </div>
                        {/* Các input khác */}
                        <div className="input-with-icon">
                            <FaIdCard className="input-icon" />
                            <input name="staffId" type="text" placeholder="Mã số cán bộ (MSCB)" value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
                        </div>
                         <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input name="hoTen" type="text" placeholder="Họ và tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                        </div>
                         <div className="input-with-icon">
                            <FaBriefcase className="input-icon" />
                            <input name="chucVu" type="text" placeholder="Chức vụ" value={chucVu} onChange={(e) => setChucVu(e.target.value)} required />
                        </div>
                         <div className="input-with-icon">
                            <FaSchool className="input-icon" />
                            <input name="khoaCongTac" type="text" placeholder="Khoa / Đơn vị công tác" value={khoaCongTac} onChange={(e) => setKhoaCongTac(e.target.value)} required />
                        </div>
                         <div className="input-with-icon">
                             <FaChalkboardTeacher className="input-icon" />
                            <input name="lopPhuTrach" type="text" placeholder="Lớp phụ trách (nếu có)" value={lopPhuTrach} onChange={(e) => setLopPhuTrach(e.target.value)} />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu thông tin & Đăng nhập'}
                        </button>
                         <button type="button" onClick={switchToLogin} disabled={loading} className="link-button cancel-button" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>Hủy bỏ</button>
                    </form>
                );
            case 'login':
            default:
                return (
                    <form onSubmit={handleLoginSubmit}>
                        <h2>Đăng nhập Cán bộ - AeroRL+</h2>
                        <p>Sử dụng tài khoản Email và Mật khẩu được cấp.</p>
                        {/* Input Email */}
                        <div className="input-with-icon">
                            <FaEnvelope className="input-icon" />
                            <input
                                name="email"
                                type="email" // Đổi thành type="email"
                                placeholder="Email quản trị"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {/* Input Password */}
                         <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                name="password"
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                             {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                         {/* Link quay lại trang đăng nhập Sinh viên */}
                        <p className="toggle-view" style={{marginTop: '2rem'}}>
                            <a href="/" className="link-button">Quay lại trang Sinh viên</a>
                        </p>
                    </form>
                );
        }
    };


    return (
        // Sử dụng layout và class tương tự trang Login sinh viên
        <div className="auth-container admin-login">
            <div className="auth-box">
                {/* Logo */}
                <div className="logo-placeholder">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="logo-image" />
                </div>

                {/* Thông báo lỗi/thành công */}
                {error && ( /* ... JSX giữ nguyên ... */
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                         <button className="close-button" onClick={() => setError('')} aria-label="Close">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                         </button>
                    </div>
                )}
                {successMessage && !error && ( /* ... JSX giữ nguyên ... */
                     <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                         <button className="close-button" onClick={() => setSuccessMessage('')} aria-label="Close">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                         </button>
                    </div>
                )}

                {/* Render form tương ứng */}
                {renderContent()}

            </div>
        </div>
    );
};

export default LoginPage;