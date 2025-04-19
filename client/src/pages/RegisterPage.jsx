// src/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegisterPage.css'; // Đảm bảo import đúng file CSS và các class name khớp
import { FaUser, FaIdCard, FaEnvelope, FaLock, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';

// --- Cấu hình ---
const API_BASE_URL = 'http://localhost:5000'; // Thay đổi nếu URL backend của bạn khác
const VAA_EMAIL_DOMAIN = 'vaa.edu.vn'; // Domain email không được dùng để đăng ký

// --- Component Trang Đăng Ký Sinh Viên ---
const RegisterPage = () => {
    // --- State Quản lý Dữ liệu Form ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hoTen, setHoTen] = useState('');
    const [mssv, setMssv] = useState('');
    const [selectedKhoaId, setSelectedKhoaId] = useState(''); // Lưu ID của Khoa được chọn
    const [selectedLopId, setSelectedLopId] = useState('');   // Lưu ID của Lớp được chọn

    // --- State Quản lý Dữ liệu Lựa chọn (Dropdowns) ---
    const [khoaOptions, setKhoaOptions] = useState([]);       // Danh sách Khoa lấy từ API
    const [lopOptions, setLopOptions] = useState([]);         // Danh sách Lớp lấy từ API

    // --- State Quản lý Trạng thái Giao diện ---
    const [loading, setLoading] = useState(false);         // Trạng thái loading khi submit form chính
    const [loadingOptions, setLoadingOptions] = useState(false); // Trạng thái loading khi tải Khoa/Lớp
    const [error, setError] = useState('');               // Lưu trữ thông báo lỗi
    const [successMessage, setSuccessMessage] = useState(''); // Lưu trữ thông báo thành công

    // --- useEffect: Tải danh sách Khoa khi component được mount ---
    useEffect(() => {
        let isMounted = true; // Cờ kiểm tra component còn tồn tại không
        const fetchKhoa = async () => {
            setLoadingOptions(true); // Bắt đầu loading Khoa
            setError('');           // Xóa lỗi cũ (nếu có)
            console.log("Fetching Khoa..."); // Log khi bắt đầu fetch
            try {
                // Gọi API lấy danh sách Khoa
                const response = await axios.get(`${API_BASE_URL}/common/khoa`);
                if (!isMounted) return; // Thoát nếu component đã unmount

                // Kiểm tra dữ liệu trả về từ API có hợp lệ không
                if (response.data?.success === true && Array.isArray(response.data?.khoaList)) {
                    setKhoaOptions(response.data.khoaList); // Cập nhật state với danh sách Khoa
                    console.log("Khoa fetched successfully:", response.data.khoaList);
                } else {
                    setError('Lỗi: Không thể tải danh sách Khoa.');
                    setKhoaOptions([]); // Đặt lại là mảng rỗng nếu lỗi
                }
            } catch (err) {
                if (!isMounted) return;
                setError('Lỗi kết nối khi tải danh sách Khoa.'); // Lỗi mạng hoặc server
                console.error("Network/Fetch Error (Khoa):", err);
                setKhoaOptions([]);
            } finally {
                if (isMounted) setLoadingOptions(false); // Kết thúc loading Khoa
            }
        };
        fetchKhoa(); // Gọi hàm fetch

        // Hàm cleanup: Chạy khi component unmount để tránh lỗi state update
        return () => { isMounted = false; };
    }, []); // Mảng dependency rỗng -> Chỉ chạy 1 lần sau khi mount

    // --- useEffect: Tải danh sách Lớp khi Khoa được chọn thay đổi ---
    useEffect(() => {
        let isMounted = true;
        const fetchLop = async () => {
            setLoadingOptions(true); // Bắt đầu loading Lớp
            // Không xóa lỗi chung ở đây để có thể thấy lỗi tải Khoa trước đó

            console.log(`Fetching Lop for Khoa ID: ${selectedKhoaId}`);
            try {
                // Gọi API lấy Lớp theo khoaId
                const response = await axios.get(`${API_BASE_URL}/common/lop`, {
                    params: { khoaId: selectedKhoaId } // Truyền khoaId qua query params
                });
                if (!isMounted) return;

                 // Kiểm tra dữ liệu Lớp trả về
                if (response.data?.success === true && Array.isArray(response.data?.lopList)) {
                    console.log("Lop data received:", response.data.lopList);
                    // Lọc trước khi set state để đảm bảo chỉ có dữ liệu hợp lệ
                    const validLopOptions = response.data.lopList.filter(lop => lop && lop.id && lop.ten_lop);
                    setLopOptions(validLopOptions); // Cập nhật state Lớp
                    setSelectedLopId(''); // Reset Lớp đã chọn khi danh sách Lớp thay đổi
                    if(validLopOptions.length !== response.data.lopList.length) {
                        console.warn("Some Lop items were filtered out due to missing id or ten_lop.");
                    }
                } else {
                    setError('Lỗi: Không thể tải danh sách Lớp cho Khoa này.');
                    setLopOptions([]);
                    setSelectedLopId('');
                    console.error("API Error or Invalid Data (Lop):", response.data);
                }
            } catch (err) {
                if (!isMounted) return;
                setError('Lỗi kết nối khi tải danh sách Lớp.');
                console.error("Network/Fetch Error (Lop):", err);
                setLopOptions([]);
                setSelectedLopId('');
            } finally {
                if (isMounted) setLoadingOptions(false); // Kết thúc loading Lớp
            }
        };

        // Chỉ gọi fetchLop nếu đã có selectedKhoaId hợp lệ
        if (selectedKhoaId && selectedKhoaId !== "") {
            fetchLop();
        } else {
            // Nếu không chọn Khoa, xóa danh sách Lớp và lựa chọn Lớp
            setLopOptions([]);
            setSelectedLopId('');
        }

        // Hàm cleanup
        return () => { isMounted = false; };
    }, [selectedKhoaId]); // Dependency: Chạy lại effect này mỗi khi selectedKhoaId thay đổi

    // --- Hàm tiện ích: Xóa nội dung các trường input trên form ---
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setHoTen('');
        setMssv('');
        setSelectedKhoaId('');
        setSelectedLopId('');
        // Không cần xóa khoaOptions, lopOptions sẽ tự động xóa bởi useEffect khi Khoa thay đổi
        setError('');
        // Giữ lại success message để người dùng đọc
    };

    // --- Hàm xử lý sự kiện: Khi người dùng nhấn nút Đăng ký ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Ngăn trình duyệt reload trang

        // --- Bước 1: Validate dữ liệu phía Frontend ---
        if (typeof email === 'string' && email.toLowerCase().endsWith(`@${VAA_EMAIL_DOMAIN}`)) {
            setError(`Email @${VAA_EMAIL_DOMAIN} không dùng để đăng ký.`); return;
        }
        if (!hoTen || !mssv || !selectedKhoaId || !selectedLopId || !email || !password) {
            setError('Vui lòng điền đầy đủ thông tin và chọn Khoa/Lớp.'); return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra email cơ bản
        if (!emailRegex.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.'); return;
        }
        if (password.length < 6) { // Thêm kiểm tra độ dài mật khẩu cơ bản
             setError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
        }

        // --- Bước 2: Chuẩn bị gửi request ---
        setLoading(true);       // Bắt đầu loading submit
        setError('');           // Xóa lỗi cũ
        setSuccessMessage('');  // Xóa thông báo thành công cũ

        // --- Bước 3: Gọi API đăng ký ---
        try {
            // Sử dụng endpoint /sinhvien/register
            const registerApiUrl = `${API_BASE_URL}/sinhvien/register`;
            console.log("Submitting registration to:", registerApiUrl);

            const response = await axios.post(registerApiUrl, {
                email,
                password, // Gửi mật khẩu
                hoTen,
                mssv,
                khoaId: selectedKhoaId, // Gửi ID Khoa (đã dùng 'id' từ API)
                lopId: selectedLopId    // Gửi ID Lớp (đã dùng 'id' từ API)
            });
            console.log("Registration API Response:", response.data);

            // --- Bước 4: Xử lý kết quả trả về từ API ---
            if (response.data?.success) { // Nếu backend báo thành công
                setSuccessMessage(response.data.message || "Đăng ký thành công! Chuyển hướng về đăng nhập...");
                clearForm(); // Xóa form
                // Tùy chọn: Chuyển hướng người dùng sau vài giây
                setTimeout(() => {
                    // Chuyển về trang Login (thay đổi '/' nếu trang login của bạn khác)
                    window.location.href = '/';
                }, 3000);
            } else { // Nếu backend báo lỗi (ví dụ: email/mssv đã tồn tại)
                setError(response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (err) { // Xử lý lỗi kết nối hoặc lỗi server khác
            console.error("Student Register API error:", err);
             if (err.response?.data?.message) { // Ưu tiên hiển thị lỗi cụ thể từ backend
                 setError(err.response.data.message);
             } else if (err.request) { // Lỗi không kết nối được server
                 setError('Lỗi kết nối: Không thể gửi yêu cầu đăng ký.');
             } else { // Lỗi không xác định
                 setError('Lỗi không mong muốn trong quá trình đăng ký.');
             }
        } finally {
            setLoading(false); // Kết thúc loading submit
        }
    };

    // --- Hàm Render: Tạo cấu trúc JSX cho Form ---
    const renderContent = () => {
        return (
            <form onSubmit={handleRegisterSubmit} className="student-register-form">
                <h2>Đăng ký tài khoản Sinh viên</h2>
                <p className="student-register-info-text">Sử dụng email cá nhân (không phải @{VAA_EMAIL_DOMAIN}).</p>

                {/* Input Họ tên */}
                <div className="student-register-input-group">
                    <FaUser className="student-register-icon" />
                    <input name="hoTen" type="text" placeholder="Họ tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                </div>

                {/* Input MSSV */}
                <div className="student-register-input-group">
                    <FaIdCard className="student-register-icon" />
                    <input name="mssv" type="text" placeholder="MSSV" value={mssv} onChange={(e) => setMssv(e.target.value)} required />
                </div>

                {/* Input Email */}
                <div className="student-register-input-group">
                    <FaEnvelope className="student-register-icon" />
                    <input name="email" type="email" placeholder="Email đăng ký" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                {/* Input Mật khẩu */}
                <div className="student-register-input-group">
                    <FaLock className="student-register-icon" />
                    <input name="password" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {/* === Dropdown Chọn Khoa === */}
                <div className="student-register-input-group">
                    <FaSchool className="student-register-icon" />
                    <select
                        name="khoa"
                        value={selectedKhoaId}
                        onChange={(e) => setSelectedKhoaId(e.target.value)} // Cập nhật state khi chọn
                        required
                        disabled={loadingOptions} // Disable khi đang tải
                    >
                        {/* Option mặc định */}
                        <option key="khoa-placeholder" value="">
                            -- {loadingOptions && !khoaOptions.length ? 'Đang tải Khoa...' : 'Chọn Khoa'} --
                        </option>
                        {/* Render các option Khoa từ state */}
                        {khoaOptions
                            .filter(khoa => khoa && khoa.id && khoa.ten_khoa) // Lọc dựa trên 'id' và 'ten_khoa'
                            .map(khoa => (
                                <option key={khoa.id} value={khoa.id}>
                                    {khoa.ten_khoa} {/* Hiển thị 'ten_khoa' */}
                                </option>
                            ))}
                    </select>
                </div>

                {/* === Dropdown Chọn Lớp === */}
                <div className="student-register-input-group">
                    <FaChalkboardTeacher className="student-register-icon" />
                    <select
                        name="lop"
                        value={selectedLopId}
                        onChange={(e) => setSelectedLopId(e.target.value)} // Cập nhật state khi chọn
                        required
                        // Disable khi chưa chọn Khoa, hoặc đang tải, hoặc không có Lớp
                        disabled={!selectedKhoaId || loadingOptions || (selectedKhoaId && lopOptions.length === 0)}
                    >
                         {/* Option mặc định, thay đổi text tùy trạng thái */}
                        <option key="lop-placeholder" value="">
                            {!selectedKhoaId
                                ? '-- Vui lòng chọn Khoa --'
                                : loadingOptions
                                ? 'Đang tải Lớp...'
                                : lopOptions.length === 0 // Đã tải xong nhưng không có Lớp
                                ? '-- Không có Lớp --'
                                : '-- Chọn Lớp --'}
                        </option>
                        {/* Render các option Lớp từ state */}
                        {lopOptions
                            // Lọc dựa trên 'id' và 'ten_lop' (giả định tên cột là ten_lop)
                            // **Quan trọng**: Đảm bảo 'ten_lop' là đúng tên cột API trả về cho tên lớp
                            .filter(lop => lop && lop.id && lop.ten_lop)
                            .map(lop => (
                                <option key={lop.id} value={lop.id}>
                                    {lop.ten_lop} {/* Hiển thị 'ten_lop' */}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Nút Đăng ký */}
                <button
                    type="submit"
                    // Disable khi đang submit form HOẶC đang tải Khoa/Lớp
                    disabled={loading || loadingOptions}
                    className="student-register-submit-btn"
                >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                {/* Link chuyển sang trang Đăng nhập */}
                <p className="student-register-login-link-section">
                    Đã có tài khoản?{' '}
                    <a href="/" className="student-register-login-link">Đăng nhập tại đây</a>
                </p>
            </form>
        );
    };

     // --- Render Component chính ra DOM ---
     return (
         <div className="auth-container student-register-page"> {/* Container chung */}
            <div className="auth-box student-register-box">   {/* Hộp chứa form */}
                 {/* Phần Logo */}
                 <div className="student-register-logo-area">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="student-register-logo" />
                </div>

                {/* Khu vực hiển thị thông báo Lỗi */}
                {error && (
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                         {/* Nút đóng thông báo lỗi */}
                         <button className="message-close-btn" onClick={() => setError('')} aria-label="Close">X</button>
                    </div>
                 )}

                 {/* Khu vực hiển thị thông báo Thành Công (chỉ hiện khi không có lỗi) */}
                {successMessage && !error && (
                     <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                        {/* Optional: Nút đóng cho success message */}
                        {/* <button className="message-close-btn" onClick={() => setSuccessMessage('')} aria-label="Close">X</button> */}
                    </div>
                )}

                {/* Render nội dung form */}
                {renderContent()}
            </div>
        </div>
     );
};

export default RegisterPage; // Xuất component để sử dụng ở nơi khác