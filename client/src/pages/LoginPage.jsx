// src/LoginPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { FaUser, FaLock, FaSchool, FaChalkboardTeacher, FaIdCard, FaEnvelope } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000';
const VAA_EMAIL_DOMAIN = 'vaa.edu.vn';

// --- Simulation Helper (Keep for flows not yet using API) ---
const simulateApiCall = (callback, delay = 500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(callback());
        }, delay);
    });
};

const LoginPage = () => {
    // --- State Variables ---
    const [view, setView] = useState('login'); // 'login', 'completeProfile'
    const [emailOrMssv, setEmailOrMssv] = useState('');
    const [password, setPassword] = useState('');
    // State for profile completion
    const [hoTen, setHoTen] = useState('');
    const [mssv, setMssv] = useState('');
    const [selectedKhoaId, setSelectedKhoaId] = useState(''); // ** Use ID **
    const [selectedLopId, setSelectedLopId] = useState('');   // ** Use ID **
    const [khoaOptions, setKhoaOptions] = useState([]);       // ** API Data **
    const [lopOptions, setLopOptions] = useState([]);         // ** API Data **
    // State for which VAA email needs profile completion
    const [emailForProcess, setEmailForProcess] = useState('');
    // UI State
    const [loading, setLoading] = useState(false); // General loading
    const [loadingOptions, setLoadingOptions] = useState(false); // ** Khoa/Lop Loading **
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Fetch Khoa API (Runs only when needed for completeProfile view) ---
    useEffect(() => {
        let isMounted = true;
        const fetchKhoa = async () => {
            if (view === 'completeProfile' && khoaOptions.length === 0) {
                setLoadingOptions(true);
                setError(''); // Clear option-related errors
                console.log("Fetching Khoa for profile completion...");
                try {
                    const response = await axios.get(`${API_BASE_URL}/common/khoa`);
                    if (!isMounted) return;
                    if (response.data?.success === true && Array.isArray(response.data?.khoaList)) {
                        // Filter for valid items before setting
                        const validOptions = response.data.khoaList.filter(k => k && k.id && k.ten_khoa);
                        setKhoaOptions(validOptions);
                        console.log("Khoa fetched for profile:", validOptions);
                    } else {
                        setError('Lỗi: Không thể tải danh sách Khoa.');
                        setKhoaOptions([]);
                    }
                } catch (err) {
                    if (!isMounted) return;
                    setError('Lỗi kết nối khi tải danh sách Khoa.');
                    console.error("Network/Fetch Error (Khoa):", err);
                    setKhoaOptions([]);
                } finally {
                    if (isMounted) setLoadingOptions(false);
                }
            }
        };
        fetchKhoa();
        return () => { isMounted = false; };
    }, [view, khoaOptions.length]); // Re-run if view changes or if options were previously empty

    // --- Fetch Lớp API (Runs when Khoa changes in completeProfile view) ---
    useEffect(() => {
        let isMounted = true;
        const fetchLop = async () => {
            setLoadingOptions(true);
            console.log(`Fetching Lop for Khoa ID: ${selectedKhoaId}`);
            try {
                const response = await axios.get(`${API_BASE_URL}/common/lop`, { params: { khoaId: selectedKhoaId } });
                if (!isMounted) return;
                if (response.data?.success === true && Array.isArray(response.data?.lopList)) {
                    console.log("Lop data received:", response.data.lopList);
                     // Filter for valid items before setting
                    const validOptions = response.data.lopList.filter(l => l && l.id && l.ten_lop);
                    setLopOptions(validOptions);
                    setSelectedLopId(''); // Reset selection
                } else {
                    setError('Lỗi: Không thể tải danh sách Lớp.');
                    setLopOptions([]);
                    setSelectedLopId('');
                }
            } catch (err) {
                if (!isMounted) return;
                setError('Lỗi kết nối khi tải danh sách Lớp.');
                console.error("Network/Fetch Error (Lop):", err);
                setLopOptions([]);
                setSelectedLopId('');
            } finally {
                if (isMounted) setLoadingOptions(false);
            }
        };

        // Only fetch if in completeProfile view and a valid Khoa ID is selected
        if (view === 'completeProfile' && selectedKhoaId && selectedKhoaId !== "") {
            fetchLop();
        } else if (view === 'completeProfile') {
             // Clear Lớp if Khoa is deselected in completeProfile view
            setLopOptions([]);
            setSelectedLopId('');
        }
        return () => { isMounted = false; };
    }, [selectedKhoaId, view]);


    // --- Helper Functions ---
    const clearForm = (clearIdentifier = false) => {
        if (clearIdentifier) setEmailOrMssv('');
        setPassword('');
        setHoTen('');
        setMssv('');
        setSelectedKhoaId(''); // Reset ID
        setSelectedLopId('');  // Reset ID
        setLopOptions([]);     // Clear Lop options
        // Don't clear khoaOptions as they are fetched once per view session
        setError('');
        setSuccessMessage('');
        setEmailForProcess('');
    };

    // --- Event Handlers ---

    // Handle Login (AeroRL or VAA Email Direct Attempt)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!emailOrMssv) { setError('Vui lòng nhập Email hoặc MSSV.'); return; }

        const isVaaEmail = typeof emailOrMssv === 'string' && emailOrMssv.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`);

        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (isVaaEmail) {
            // --- Attempt Direct VAA Email Login (Simulation) ---
            // **TODO: Replace with API call to backend (e.g., /api/auth/vaa-login)**
            console.log("Simulating Direct VAA Email Login Check for:", emailOrMssv);
            await simulateApiCall(() => {
                const profileNeedsCompletion = emailOrMssv.startsWith('vaa.incomplete');
                const loginSuccess = emailOrMssv.startsWith('vaa.');

                if (loginSuccess) {
                    if (profileNeedsCompletion) {
                        setSuccessMessage('Đăng nhập thành công! Vui lòng hoàn thành hồ sơ.');
                        setEmailForProcess(emailOrMssv);
                        setPassword('');
                        setView('completeProfile');
                    } else {
                        setSuccessMessage('Đăng nhập bằng email VAA thành công! Đang chuyển hướng...');
                        // ** SIMULATED: Store User Data/Token **
                        const simulatedUserData = { id: 99, email: emailOrMssv, hoTen: 'VAA User', mssv: 'VAA001'}; // Example
                        localStorage.setItem('userData', JSON.stringify(simulatedUserData));
                        // localStorage.setItem('authToken', 'simulated-vaa-token');
                        console.log("Simulated VAA user data stored");

                        clearForm(true);
                        // **Redirect to HomePage**
                        setTimeout(() => { window.location.href = '/'; }, 1500);
                    }
                } else {
                     setError('Email VAA không tồn tại hoặc không hợp lệ (Mô phỏng).');
                }
            });
             setLoading(false); // Simulation needs manual stop

        } else {
            // --- AeroRL Login (Email/MSSV + Password) - REAL API CALL ---
            if (!password) {
                 setError('Vui lòng nhập mật khẩu.');
                 setLoading(false);
                 return;
            }

            try {
                // Use /api/auth/login or /sinhvien/login depending on your backend setup
                const loginApiUrl = `${API_BASE_URL}/sinhvien/login`;
                console.log("Attempting AeroRL login to:", loginApiUrl);

                const response = await axios.post(loginApiUrl, {
                    identifier: emailOrMssv,
                    password: password
                });

                console.log("AeroRL Login API Response:", response.data);

                if (response.data?.success) {
                    setSuccessMessage(response.data.message || 'Đăng nhập thành công! Đang chuyển hướng...');

                    // **Store User Data & Token in localStorage**
                    if (response.data.user) { localStorage.setItem('userData', JSON.stringify(response.data.user)); }
                    if (response.data.token) { localStorage.setItem('authToken', response.data.token); }
                    console.log("AeroRL user data/token stored");

                    // **Redirect to HomePage**
                    setTimeout(() => { window.location.href = '/'; }, 1500);

                } else {
                    setError(response.data.message || 'Email/MSSV hoặc mật khẩu không đúng.');
                }

            } catch (err) {
                console.error("AeroRL Login API error:", err);
                if (err.response?.data?.message) { setError(err.response.data.message); }
                else if (err.request) { setError('Lỗi kết nối: Không thể kết nối đến máy chủ.'); }
                else { setError('Lỗi không mong muốn khi đăng nhập.'); }
            } finally {
                setLoading(false);
            }
        }
    };

    // --- Profile Completion Handler ---
    const handleProfileCompletionSubmit = async (e) => {
        e.preventDefault();
        // ** Validate using IDs **
        if (!hoTen || !mssv || !selectedKhoaId || !selectedLopId) { setError('Vui lòng điền đầy đủ thông tin và chọn Khoa/Lớp.'); return; }
        if (!emailForProcess) {setError("Lỗi: Không tìm thấy email để hoàn thành hồ sơ."); return;}

        setLoading(true); setError(''); setSuccessMessage('');
        await simulateApiCall(() => { // **TODO: Replace with API call**
             // Assume backend saves data and returns success + user data/token
             console.log(`Simulating profile completion save for ${emailForProcess}`);
             setSuccessMessage(`Hoàn thành hồ sơ thành công! Đăng nhập thành công!`);

             // ** SIMULATED: Store User Data/Token **
             const simulatedUserData = { id: 98, email: emailForProcess, hoTen: hoTen, mssv: mssv, khoaId: selectedKhoaId, lopId: selectedLopId}; // Example
             localStorage.setItem('userData', JSON.stringify(simulatedUserData));
             // localStorage.setItem('authToken', 'simulated-completed-token');
             console.log("Simulated completed profile data stored");

             clearForm(true);
             // **Redirect to HomePage**
             setTimeout(() => { window.location.href = '/'; }, 1500);
        });
        setLoading(false);
    };

    // --- Switch View Handler ---
    const switchInternalView = (newView) => {
         setView(newView);
        if (newView === 'login') {
            clearForm(true);
        } else {
            setError(''); setSuccessMessage('');
             // Keep emailForProcess only if switching TO completeProfile
             if(newView !== 'completeProfile') {
                 setEmailForProcess('');
             }
        }
    };

    // --- Google Login Handler ---
    const handleGoogleLogin = async () => {
         console.log("Google Login needs API implementation using @react-oauth/google.");
         // Simulation:
         setLoading(true); setError(''); setSuccessMessage('');
         await simulateApiCall(() => { // **TODO: Replace with API call**
             const simulatedGoogleEmail = 'vaa.incomplete.test@vaa.edu.vn';

             if (simulatedGoogleEmail && simulatedGoogleEmail.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) {
                 const profileNeedsCompletion = simulatedGoogleEmail.includes('incomplete');
                 if (profileNeedsCompletion) {
                     setSuccessMessage(`Đăng nhập Google (${simulatedGoogleEmail}) thành công! Vui lòng hoàn thành hồ sơ.`);
                     setEmailForProcess(simulatedGoogleEmail);
                     setEmailOrMssv(''); setPassword('');
                     setView('completeProfile');
                 } else {
                     setSuccessMessage(`Đăng nhập bằng Google (${simulatedGoogleEmail}) thành công! Đang chuyển hướng...`);
                      // ** SIMULATED: Store User Data/Token **
                     const simulatedUserData = { id: 97, email: simulatedGoogleEmail, hoTen: 'Google VAA User', mssv: 'GVAA001'}; // Example
                     localStorage.setItem('userData', JSON.stringify(simulatedUserData));
                     // localStorage.setItem('authToken', 'simulated-google-token');
                     console.log("Simulated Google user data stored");

                     clearForm(true);
                     // **Redirect to HomePage**
                     setTimeout(() => { window.location.href = '/'; }, 1500);
                 }
             } else { setError(`Đăng nhập Google yêu cầu tài khoản @${VAA_EMAIL_DOMAIN} (Mô phỏng).`); }
         });
         setLoading(false);
    };


    // --- Render Logic ---
    const renderContent = () => {
        switch (view) {
            case 'completeProfile':
                 return (
                      <form onSubmit={handleProfileCompletionSubmit} className="student-register-form">
                         <h2>Hoàn thành Hồ sơ (VAA)</h2>
                         <p>Cung cấp thông tin còn thiếu cho <strong>{emailForProcess}</strong>.</p>
                         {/* Inputs for Ho Ten, MSSV (same as before) */}
                         <div className="student-register-input-group">
                            <FaUser className="student-register-icon" />
                            <input name="hoTen" type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                         </div>
                         <div className="student-register-input-group">
                            <FaIdCard className="student-register-icon" />
                            <input name="mssv" type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} required />
                         </div>
                         {/* Khoa Dropdown - USES API DATA */}
                         <div className="student-register-input-group">
                            <FaSchool className="student-register-icon" />
                            <select name="khoa" value={selectedKhoaId} onChange={(e) => setSelectedKhoaId(e.target.value)} required disabled={loadingOptions}>
                                <option key="khoa-placeholder-cp" value=""> -- {loadingOptions ? 'Đang tải Khoa...' : 'Chọn Khoa'} -- </option>
                                {khoaOptions.map(khoa => (
                                    // Ensure API provides 'id' and 'ten_khoa'
                                    <option key={khoa.id} value={khoa.id}> {khoa.ten_khoa} </option>
                                ))}
                            </select>
                         </div>
                         {/* Lop Dropdown - USES API DATA */}
                         <div className="student-register-input-group">
                            <FaChalkboardTeacher className="student-register-icon" />
                            <select name="lop" value={selectedLopId} onChange={(e) => setSelectedLopId(e.target.value)} required disabled={!selectedKhoaId || loadingOptions || lopOptions.length === 0}>
                                <option key="lop-placeholder-cp" value=""> {!selectedKhoaId ? '-- Chọn Khoa trước --' : loadingOptions ? 'Đang tải Lớp...' : lopOptions.length === 0 ? '-- Không có Lớp --' : '-- Chọn Lớp --'} </option>
                                {lopOptions.map(lop => (
                                     // Ensure API provides 'id' and 'ten_lop'
                                    <option key={lop.id} value={lop.id}> {lop.ten_lop} </option>
                                ))}
                            </select>
                         </div>
                         <button type="submit" disabled={loading || loadingOptions} className="student-register-submit-btn">
                             {loading ? 'Đang lưu...' : 'Hoàn thành & Đăng nhập'}
                         </button>
                         <button type="button" onClick={() => switchInternalView('login')} disabled={loading || loadingOptions} className="link-button cancel-button" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>Hủy bỏ</button>
                     </form>
                 );
            case 'login':
            default:
                const isVaaEmailTyping = typeof emailOrMssv === 'string' && emailOrMssv.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`);
                return (
                    <form onSubmit={handleLoginSubmit} className="student-register-form">
                        <h2>Đăng nhập aeRoL+</h2>
                        <p>Sử dụng tài khoản aeRoL+ hoặc VAA</p>

                        <div className="student-register-input-group">
                             <FaUser className="student-register-icon" />
                             <input name="emailOrMssv" type="text" placeholder={`Email (@${VAA_EMAIL_DOMAIN}/thường) hoặc MSSV`} value={emailOrMssv} onChange={(e) => setEmailOrMssv(e.target.value)} required />
                        </div>

                        {!isVaaEmailTyping && (
                             <div className="student-register-input-group">
                                 <FaLock className="student-register-icon" />
                                 <input name="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
                              </div>
                        )}

                        {isVaaEmailTyping && ( <p className="info-text">Đăng nhập trực tiếp bằng email VAA.</p> )}

                        <button type="submit" disabled={loading} className="student-register-submit-btn">
                             {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                        <div className="divider">HOẶC</div>

                        <button type="button" onClick={handleGoogleLogin} className="google-login-button" disabled={loading}>
                           <FcGoogle className="google-icon" />
                            <span>Đăng nhập bằng Google</span>
                        </button>
                         <p className="info-text google-info">Chỉ dành cho tài khoản @{VAA_EMAIL_DOMAIN}</p>

                        <p className="toggle-view student-register-login-link-section">
                            Chưa có tài khoản?{' '}
                            <a href="/register" className="link-button student-register-login-link">Đăng ký tại đây</a>
                        </p>
                    </form>
                );
        }
    };

     // --- Main Component Return ---
     return (
        <div className="auth-container student-register-page">
            <div className="auth-box student-register-box">
                <div className="student-register-logo-area">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="student-register-logo" />
                </div>

                {error && (
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                        <button className="message-close-btn" onClick={() => setError('')} aria-label="Close">X</button>
                    </div>
                )}
                {successMessage && !error && (
                     <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                     </div>
                )}

                {renderContent()}
            </div>
        </div>
     );
};

export default LoginPage;