// src/components/admin/EventManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaFilter, FaSync,FaSearch,FaTimesCircle } from 'react-icons/fa'; // Thêm icons
import './EventManagement.css'; // File CSS riêng cho quản lý sự kiện

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000'; // URL Backend

// --- Modal/Form Component (Placeholder) ---
// Bạn sẽ cần tạo component này để thêm/sửa sự kiện
const EventFormModal = ({ eventData, onClose, onSave, isLoading }) => {
    // State cho form (tên, mô tả, loại, thời gian, số lượng...)
    const [formData, setFormData] = useState(eventData || {
        tieu_de: '', mo_ta: '', loai: 'ren_luyen',
        thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '',
        thoi_gian_mo_dang_ky: '', thoi_gian_dong_dang_ky: '',
        so_luong_toi_da: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Validate form data
        const validationErrors = {};
        // ... (logic validation) ...
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSave(formData); // Gọi hàm lưu từ props
    };

     // --- TODO: Xây dựng Form chi tiết ---
     return (
        <div className="modal-backdrop">
             <div className="modal-content event-form-modal">
                 <h2>{eventData ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}</h2>
                 <form onSubmit={handleSubmit}>
                     {/* Các trường input cho tiêu đề, mô tả, loại, thời gian, số lượng... */}
                      <div className="form-group">
                         <label htmlFor="tieu_de">Tiêu đề (*)</label>
                         <input type="text" id="tieu_de" name="tieu_de" value={formData.tieu_de} onChange={handleChange} required />
                         {/* Hiển thị lỗi nếu có */}
                      </div>
                     <div className="form-group">
                         <label htmlFor="mo_ta">Mô tả</label>
                         <textarea id="mo_ta" name="mo_ta" value={formData.mo_ta} onChange={handleChange}></textarea>
                     </div>
                     {/* Thêm các input khác: loai (select), thoi_gian_*, so_luong_toi_da */}
                     {/* ... */}

                     <div className="form-actions">
                         <button type="submit" className="button primary" disabled={isLoading}>
                             {isLoading ? 'Đang lưu...' : (eventData ? 'Lưu thay đổi' : 'Thêm sự kiện')}
                         </button>
                         <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>Hủy</button>
                     </div>
                 </form>
                 <button onClick={onClose} className="modal-close-button">X</button>
            </div>
        </div>
    );
};


// --- Component Chính ---
const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ type: '', status: '' }); // State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm

    // State cho Modal/Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null); // null: add new, object: edit
    const [isSaving, setIsSaving] = useState(false);


    // --- Fetch danh sách sự kiện ---
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // TODO: Thêm filters và searchTerm vào params nếu có
            const params = {};
            if (filters.type) params.loai = filters.type;
            if (filters.status) params.trang_thai = filters.status; // Ví dụ: 'sap_dien_ra', 'dang_dien_ra', 'da_ket_thuc'
            if (searchTerm) params.search = searchTerm;

            // Thay bằng API thật: GET /api/admin/events
            // const response = await axios.get(`${API_BASE_URL}/admin/events`, { params });
             // *** SIMULATED FETCH ***
             console.log("Fetching events with params:", params);
             await new Promise(resolve => setTimeout(resolve, 800));
             const simulatedEvents = [
                 { id: 1, tieu_de: 'Ngày hội Hiến máu 2024', loai: 'tinh_nguyen', thoi_gian_bat_dau: '2024-09-10T08:00:00', bi_huy: false },
                 { id: 2, tieu_de: 'Tập huấn Kỹ năng Mềm', loai: 'ren_luyen', thoi_gian_bat_dau: '2024-08-25T14:00:00', bi_huy: false },
                 { id: 3, tieu_de: 'Chiến dịch Mùa hè Xanh', loai: 'tinh_nguyen', thoi_gian_bat_dau: '2024-07-15T07:00:00', bi_huy: true }, // Bị hủy
             ];
             // Lọc giả lập phía client (nên làm ở backend)
             let filtered = simulatedEvents;
             if(params.loai) filtered = filtered.filter(e => e.loai === params.loai);
             if(params.search) filtered = filtered.filter(e => e.tieu_de.toLowerCase().includes(params.search.toLowerCase()));
             // Thêm lọc trạng thái nếu có...
             setEvents(filtered);
            // *** END SIMULATION ***

            // if (response.data.success) {
            //    setEvents(response.data.events);
            // } else {
            //    setError('Không thể tải danh sách sự kiện.');
            //}
        } catch (err) {
            setError('Lỗi kết nối khi tải danh sách sự kiện.');
            console.error("Fetch Events error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchTerm]); // Phụ thuộc vào filters và searchTerm

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]); // Gọi fetchEvents khi component mount hoặc dependency thay đổi


    // --- Xử lý bộ lọc ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        // fetchEvents sẽ tự chạy lại do filters thay đổi
    };
     const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Cân nhắc debounce search hoặc tìm khi nhấn enter/button
    };
     const handleSearchSubmit = (e) => {
         e.preventDefault();
         fetchEvents(); // Trigger fetch với searchTerm hiện tại
     };


    // --- Xử lý Modal Form ---
    const openAddModal = () => {
        setEditingEvent(null); // Đảm bảo là chế độ thêm mới
        setIsModalOpen(true);
    };
    const openEditModal = (event) => {
        // TODO: Định dạng lại dữ liệu event (ví dụ: date/time) nếu cần cho form
        setEditingEvent(event);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null); // Reset editing state
    };


    // --- Xử lý Lưu Sự kiện (Thêm mới hoặc Cập nhật) ---
    const handleSaveEvent = async (formData) => {
        setIsSaving(true);
        setError(''); // Xóa lỗi cũ
        const apiUrl = editingEvent
            ? `${API_BASE_URL}/admin/events/${editingEvent.id}` // PUT để sửa
            : `${API_BASE_URL}/admin/events`; // POST để thêm
        const method = editingEvent ? 'put' : 'post';

        try {
            // --- THAY BẰNG API THẬT ---
            console.log(`Saving event (${method.toUpperCase()}) to ${apiUrl}`, formData);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
            const response = { data: { success: true, message: editingEvent ? 'Cập nhật thành công!' : 'Thêm thành công!' } }; // Simulate success
            // --- HẾT API THẬT ---

            // const response = await axios[method](apiUrl, formData /*, { headers: { Authorization: ... }} */);

            if (response.data.success) {
                closeModal();
                fetchEvents(); // Tải lại danh sách sau khi lưu
                // Hiển thị thông báo thành công (có thể dùng state riêng)
                 alert(response.data.message);
            } else {
                setError(response.data.message || 'Lưu sự kiện thất bại.');
            }
        } catch (err) {
             console.error("Save Event error:", err);
             if (err.response?.data?.message) setError(err.response.data.message);
             else setError('Lỗi kết nối hoặc lỗi không xác định khi lưu sự kiện.');
             // Giữ modal mở để người dùng sửa lỗi hoặc xem thông báo
        } finally {
            setIsSaving(false);
        }
    };


    // --- Xử lý Xóa/Hủy Sự kiện (TODO) ---
    const handleDeleteEvent = async (eventId) => {
         if (window.confirm(`Bạn có chắc muốn XÓA vĩnh viễn sự kiện ID ${eventId}? Hành động này không thể hoàn tác.`)) {
            console.log("Deleting event:", eventId);
            // Gọi API DELETE /api/admin/events/:id
            // Refetch list
         }
    };
     const handleCancelEvent = async (eventId) => {
         if (window.confirm(`Bạn có chắc muốn HỦY sự kiện ID ${eventId}?`)) {
             console.log("Canceling event:", eventId);
             // Gọi API PUT /api/admin/events/:id/cancel (Ví dụ)
             // Refetch list
         }
    };


    return (
        <div className="event-management-container">
            <h2>Quản lý Sự kiện</h2>

            {/* --- Khu vực Lọc và Tìm kiếm --- */}
            <div className="filters-container">
                 <form onSubmit={handleSearchSubmit} className="search-form">
                     <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}><FaSearch /> Tìm</button> {/* Thêm icon */}
                 </form>
                 <div className="filter-controls">
                    <select name="type" value={filters.type} onChange={handleFilterChange} disabled={isLoading}>
                        <option value="">-- Lọc theo loại --</option>
                        <option value="ren_luyen">Rèn luyện</option>
                        <option value="tinh_nguyen">Tình nguyện</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} disabled={isLoading}>
                        <option value="">-- Lọc trạng thái --</option>
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra</option>
                        <option value="past">Đã kết thúc</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                     <button onClick={fetchEvents} disabled={isLoading} title="Tải lại danh sách"><FaSync className={isLoading ? 'spinner' : ''} /></button>
                 </div>
                 <button onClick={openAddModal} className="button primary add-button" disabled={isLoading}>
                     <FaPlus style={{ marginRight: '5px' }} /> Thêm sự kiện
                 </button>
            </div>

            {/* --- Thông báo Lỗi/Loading --- */}
            {error && !isModalOpen && <div className="message-box error-message"><span>{error}</span><button onClick={()=>setError('')}>X</button></div>} {/* Chỉ hiện lỗi list khi modal đóng */}
            {isLoading && <div className="loading-indicator">Đang tải sự kiện...</div>}

            {/* --- Bảng Sự kiện --- */}
            {!isLoading && !error && (
                <div className="event-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Loại</th>
                                <th>Thời gian BĐ</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <tr key={event.id} className={event.bi_huy ? 'cancelled-event' : ''}>
                                        <td>{event.id}</td>
                                        <td>{event.tieu_de}</td>
                                        <td>{event.loai === 'ren_luyen' ? 'Rèn luyện' : 'Tình nguyện'}</td>
                                        <td>{event.thoi_gian_bat_dau ? new Date(event.thoi_gian_bat_dau).toLocaleString('vi-VN') : 'N/A'}</td>
                                        <td>
                                            {/* TODO: Xác định trạng thái dựa trên thời gian và bi_huy */}
                                            {event.bi_huy ? <span className="status-cancelled">Đã hủy</span> : <span className="status-active">Hoạt động</span>}
                                        </td>
                                        <td className="action-buttons">
                                            <button onClick={() => alert(`Xem chi tiết SK ${event.id}`)} title="Xem chi tiết"><FaEye /></button>
                                            {!event.bi_huy && <button onClick={() => openEditModal(event)} title="Chỉnh sửa"><FaEdit /></button>}
                                            {!event.bi_huy && <button onClick={() => handleCancelEvent(event.id)} title="Hủy sự kiện" className="button-cancel"><FaTimesCircle /></button>} {/* Thêm icon */}
                                            <button onClick={() => handleDeleteEvent(event.id)} title="Xóa sự kiện" className="button-delete"><FaTrashAlt /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">Không tìm thấy sự kiện nào phù hợp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- Modal Form --- */}
            {isModalOpen && (
                <EventFormModal
                    eventData={editingEvent}
                    onClose={closeModal}
                    onSave={handleSaveEvent}
                    isLoading={isSaving}
                />
            )}
        </div>
    );
};

export default EventManagement;