// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios'; // For API calls
import { Link, useNavigate } from 'react-router-dom'; // For navigation and linking
import './LoginPage.css'; // Ensure this CSS file exists and is appropriate
import { FaEnvelope, FaLock } from 'react-icons/fa'; // Icons for login

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000'; 

const AdminLoginPage = () => {
    // --- State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Optional: for brief success feedback

    const navigate = useNavigate(); // Hook for programmatic navigation

    // --- Helper Functions ---
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setError('');
        // setSuccessMessage(''); // Keep success message if needed after clearing
    };

    // --- Event Handler: Login Submission ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Basic validation
        if (!email || !password) {
            setError('Vui lòng nhập Email và Mật khẩu.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // --- API Call ---
            const response = await axios.post(`${API_BASE_URL}/admin/login`, {
                email: email,
                password: password,
            });

            // --- Handle Success ---
            if (response.data.success) {
                const userData = response.data.user;
                setSuccessMessage(response.data.message); // Show success message
                clearForm();
                localStorage.setItem('adminUser', JSON.stringify(userData)); 
                console.log('Admin logged in:', userData);

                // 2. Redirect to the admin dashboard or relevant page after a short delay
                setTimeout(() => {
                    navigate('/admin/dashboard'); 
                }, 1500); // Redirect after 1.5 seconds

            } else {
                 // Should not happen if backend uses proper status codes,
                 // but handle just in case backend returns success: false with 200 OK
                 setError(response.data.message || 'Đăng nhập thất bại.');
            }

        } catch (err) {
            // --- Handle Errors ---
            if (err.response && err.response.data && err.response.data.message) {
                // Specific error from backend (e.g., incorrect credentials, validation)
                setError(err.response.data.message);
            } else if (err.request) {
                // Network error (request made but no response received)
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
            } else {
                // Other errors (e.g., setting up the request)
                setError('Đã xảy ra lỗi không mong muốn khi đăng nhập.');
            }
            console.error("Admin Login API error:", err);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    // --- Render Logic ---
    return (
        <div className="auth-container admin-login"> {/* Keep classes for styling */}
            <div className="auth-box">
                {/* Logo */}
                <div className="logo-placeholder">
                    <img src="/logo.svg" alt="AeroRL+ Logo" className="logo-image" />
                </div>

                <h2>Đăng nhập Cán bộ - AeroRL+</h2>
                <p>Sử dụng tài khoản Email và Mật khẩu của bạn.</p>

                {/* Messages */}
                {error && (
                    <div className="message-box error-message" role="alert">
                        <span>{error}</span>
                        <button className="close-button" onClick={() => setError('')} aria-label="Close">X</button>
                    </div>
                )}
                {successMessage && !error && (
                    <div className="message-box success-message" role="alert">
                        <span>{successMessage}</span>
                        {/* Optional: Add close button if message should persist */}
                        {/* <button className="close-button" onClick={() => setSuccessMessage('')} aria-label="Close">X</button> */}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit}>
                    {/* Input Email */}
                    <div className="input-with-icon">
                        <FaEnvelope className="input-icon" />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading} // Disable while loading
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
                            disabled={loading} // Disable while loading
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading}>
                         {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>

                     {/* Link to Register Page */}
                    <p className="toggle-view">
                        Chưa có tài khoản?{' '}
                        <Link to="/admin/register" className="link-button">
                            Đăng ký tại đây
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;