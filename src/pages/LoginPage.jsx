// src/LoginPage.js
import React, { useState, useEffect } from 'react';
import './LoginPage.css'; // Import CSS cho trang Login

// --- Configuration (Simulated) ---
const VAA_EMAIL_DOMAIN = 'vaa.edu.vn';
const SIMULATED_DELAY = 1000;

// --- Simulated Data (Cho form hoàn thành hồ sơ) ---
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

const LoginPage = () => {
    // State cho các view và dữ liệu form
    const [view, setView] = useState('login'); // 'login', 'verify', 'completeProfile'
    const [emailOrMssv, setEmailOrMssv] = useState('');
    const [password, setPassword] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [mssv, setMssv] = useState('');
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [selectedLop, setSelectedLop] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailForProcess, setEmailForProcess] = useState(''); // Email đang được xử lý (VAA hoặc Google VAA)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Dropdown logic ---
    const availableLop = selectedKhoa ? (classByFaculty[selectedKhoa] || []) : [];
    useEffect(() => {
        if (view === 'completeProfile') {
            setSelectedLop('');
        }
    }, [selectedKhoa, view]);

    // --- Helper Functions ---
    const clearForm = (clearIdentifier = false) => {
        if (clearIdentifier) setEmailOrMssv('');
        setPassword('');
        setHoTen('');
        setMssv('');
        setSelectedKhoa('');
        setSelectedLop('');
        setVerificationCode('');
        setError('');
        setSuccessMessage('');
        setEmailForProcess(''); // Xóa email đang xử lý
    };

    // --- Event Handlers ---

    // Xử lý Submit cho form Login (AeroRL hoặc VAA Email)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrMssv) { setError('Vui lòng nhập Email hoặc MSSV.'); return; }

        const isVaaEmail = typeof emailOrMssv === 'string' && emailOrMssv.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`);

        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (isVaaEmail) {
            // --- Xử lý VAA Email ---
            await simulateApiCall(() => {
                setSuccessMessage(`Mã xác thực đã được gửi đến ${emailOrMssv} (Mô phỏng).`);
                setEmailForProcess(emailOrMssv); // Lưu email VAA để xác thực
                // Không clear form, chỉ clear password nếu có
                setPassword('');
                setVerificationCode('');
                setView('verify');
            });
        } else {
            // --- Xử lý AeroRL (Email thường / MSSV + Password) ---
            if (!password) {
                 setError('Vui lòng nhập mật khẩu.');
                 setLoading(false); // Dừng loading sớm
                 return;
            }
            await simulateApiCall(() => {
                const identifier = emailOrMssv;
                // Giả lập đăng nhập thành công
                if ((identifier === 'test@user.com' || identifier === '1951060001') && password === 'password') {
                    setSuccessMessage('Đăng nhập bằng tài khoản AeroRL thành công! (Mô phỏng)');
                    clearForm(true);
                    // Giữ view 'login' để hiển thị thông báo
                } else {
                    setError('Email/MSSV hoặc mật khẩu không đúng (Mô phỏng).');
                }
            });
        }
        setLoading(false);
    };

    // Xử lý xác thực (Chỉ dùng sau khi nhập VAA email)
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        if (!verificationCode || verificationCode.length !== 6) { setError('Mã xác thực phải gồm 6 chữ số.'); return; }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        await simulateApiCall(() => {
            if (verificationCode === '123456') { // Giả lập mã đúng
                // Giả lập kiểm tra hồ sơ VAA email này
                const profileNeedsCompletion = emailForProcess.startsWith('vaa.incomplete'); // Ví dụ mô phỏng

                if (profileNeedsCompletion) {
                    setSuccessMessage('Xác thực thành công! Vui lòng hoàn thành hồ sơ.');
                    setVerificationCode(''); // Xóa mã
                    setView('completeProfile'); // Chuyển sang hoàn thành hồ sơ
                    // Giữ lại emailForProcess
                } else {
                    setSuccessMessage('Xác thực thành công! Đăng nhập bằng email VAA thành công! (Mô phỏng)');
                    clearForm(true); // Xóa hết
                    setView('login'); // Quay về màn hình login
                }
            } else {
                setError('Mã xác thực không đúng (Mô phỏng).');
            }
        });
        setLoading(false);
    };

     // Xử lý hoàn thành hồ sơ (Sau VAA verify hoặc Google VAA login)
    const handleProfileCompletionSubmit = async (e) => {
         e.preventDefault();
         if (!hoTen || !mssv || !selectedKhoa || !selectedLop) { setError('Vui lòng điền đầy đủ thông tin hồ sơ.'); return; }

         setLoading(true);
         setError('');
         setSuccessMessage('');

         await simulateApiCall(() => {
             setSuccessMessage(`Hoàn thành hồ sơ cho ${emailForProcess} thành công! Đăng nhập thành công! (Mô phỏng).`);
             clearForm(true); // Xóa hết
             setView('login'); // Quay về màn hình login
         });
         setLoading(false);
     };

    // Gửi lại mã (Chỉ dùng sau khi nhập VAA email)
    const handleResendCode = async () => {
         if (!emailForProcess) { setError("Không tìm thấy email để gửi lại mã."); return; }

         setLoading(true);
         setError('');
         setSuccessMessage('');

         await simulateApiCall(() => {
             setSuccessMessage(`Đã gửi lại mã xác thực đến ${emailForProcess} (Mô phỏng).`);
         }, 500);
         setLoading(false);
     };

    // Chuyển view nội bộ hoặc reset về login
    const switchInternalView = (newView) => {
        setView(newView);
        if (newView === 'login') {
            clearForm(true);
        } else {
            setError('');
            setSuccessMessage('');
            // Giữ lại emailForProcess nếu chuyển sang completeProfile
            if(newView !== 'completeProfile') {
                setVerificationCode(''); // Xóa code nếu quay lại từ verify
            }
        }
    };

    // Handler mô phỏng cho Google Login (Đã sửa logic)
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        console.log('Simulating Google Login...');

        await simulateApiCall(() => {
            // --- Giả lập kết quả từ Google ---
            const simulatedGoogleEmail = 'student.needs.profile@vaa.edu.vn'; // VAA cần hồ sơ
            // const simulatedGoogleEmail = 'student.complete@vaa.edu.vn'; // VAA đủ hồ sơ
            // const simulatedGoogleEmail = 'not.vaa@gmail.com'; // Không phải VAA

            console.log('Simulated Google Email:', simulatedGoogleEmail);

            if (simulatedGoogleEmail && simulatedGoogleEmail.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) {
                // --- Email VAA hợp lệ, kiểm tra hồ sơ (mô phỏng) ---
                const profileNeedsCompletion = simulatedGoogleEmail.includes('needs.profile'); // Ví dụ mô phỏng

                if (profileNeedsCompletion) {
                     setSuccessMessage(`Đăng nhập Google (${simulatedGoogleEmail}) thành công! Vui lòng hoàn thành hồ sơ.`);
                     setEmailForProcess(simulatedGoogleEmail); // Lưu email để hoàn thành hồ sơ
                     // Clear các trường không cần thiết cho complete profile
                     setEmailOrMssv('');
                     setPassword('');
                     setVerificationCode('');
                     setView('completeProfile'); // Chuyển sang hoàn thành hồ sơ
                } else {
                     setSuccessMessage(`Đăng nhập bằng Google (${simulatedGoogleEmail}) thành công! (Mô phỏng)`);
                     clearForm(true); // Xóa hết khi đăng nhập thành công
                     setView('login'); // Ở lại trang login để xem thông báo
                }
            } else {
                 setError(`Đăng nhập bằng Google yêu cầu tài khoản có đuôi @${VAA_EMAIL_DOMAIN} (Mô phỏng).`);
            }
        });
        setLoading(false);
    };

    // --- Render Logic ---
    const renderContent = () => {
        switch (view) {
            case 'verify': // Chỉ sau khi nhập VAA email
                 return ( /* ... JSX cho form verify giữ nguyên như trước ... */
                     <form onSubmit={handleVerificationSubmit}>
                         <h2>Xác thực Email VAA</h2>
                         <p>Mã xác thực (giả lập là <strong>123456</strong>) đã được gửi đến <strong>{emailForProcess}</strong>.</p>
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
                             {loading ? 'Đang xác thực...' : 'Xác thực'}
                         </button>
                          <div className="button-group">
                              <button type="button" onClick={handleResendCode} disabled={loading} className="link-button">Gửi lại mã (Mô phỏng)</button>
                              <button type="button" onClick={() => switchInternalView('login')} disabled={loading} className="link-button cancel-button">Hủy bỏ</button>
                          </div>
                     </form>
                 );
            case 'completeProfile': // Sau VAA verify hoặc Google VAA login
                 return ( /* ... JSX cho form completeProfile giữ nguyên như trước, KHÔNG có email/password ... */
                      <form onSubmit={handleProfileCompletionSubmit}>
                         <h2>Hoàn thành Hồ sơ (VAA)</h2>
                         <p>Vui lòng cung cấp thông tin còn thiếu cho tài khoản <strong>{emailForProcess}</strong>.</p>
                         <input name="hoTen" type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                         <input name="mssv" type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} required />
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
                             {loading ? 'Đang lưu...' : 'Hoàn thành & Đăng nhập'}
                         </button>
                          <button type="button" onClick={() => switchInternalView('login')} disabled={loading} className="link-button cancel-button" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>Hủy bỏ</button>
                     </form>
                 );
            case 'login':
            default:
                const isVaaEmailTyping = typeof emailOrMssv === 'string' && emailOrMssv.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`);
                return (
                    <form onSubmit={handleLoginSubmit}>
                        <h2>Đăng nhập aeRoL+</h2>
                        <p>Sử dụng tài khoản aeRoL+</p>
                        <input
                            name="emailOrMssv"
                            type="text"
                            placeholder={`Email (@${VAA_EMAIL_DOMAIN} / thường) hoặc MSSV`}
                            value={emailOrMssv}
                            onChange={(e) => setEmailOrMssv(e.target.value)}
                            required
                        />
                        {!isVaaEmailTyping && (
                             <input
                                name="password"
                                type="password"
                                placeholder="Mật khẩu (cho Email thường/MSSV)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                // Bỏ required ở đây, logic submit sẽ kiểm tra
                            />
                        )}
                        {isVaaEmailTyping && (
                            <p className="info-text">Đăng nhập bằng email VAA không cần mật khẩu. Hệ thống sẽ gửi mã xác thực (Mô phỏng).</p>
                        )}
                        <button type="submit" disabled={loading}>
                             {loading ? 'Đang xử lý...' : (isVaaEmailTyping ? 'Nhận mã xác thực' : 'Đăng nhập')}
                        </button>

                        <div className="divider">HOẶC</div>

                        <button type="button" onClick={handleGoogleLogin} className="google-login-button" disabled={loading}>
                           <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                            Đăng nhập bằng Google (chỉ @{VAA_EMAIL_DOMAIN})
                        </button>

                        <p className="toggle-view">
                            Chưa có tài khoản aeRoL+?{' '}
                            <a href="/register" className="link-button">Đăng ký tại đây</a>
                        </p>
                    </form>
                );
        }
    };

     return ( // JSX phần return giữ nguyên cấu trúc với message box và renderContent
        <div className="auth-container">
            <div className="auth-box">
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

export default LoginPage;