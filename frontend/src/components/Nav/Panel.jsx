import React, { useState, useContext, useRef, useEffect } from 'react';
import { LoginContext } from '../../contexts/LoginConText';
import avatar from '../../assets/avatar.png'; 
import '../../css/Nav/Panel.css'; // File CSS đi kèm

const Panel = () => {
    // LẤY DỮ LIỆU TỪ CONTEXT MỘT CÁCH CHÍNH XÁC
    const { authState, logoutUser } = useContext(LoginContext);

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const panelRef = useRef(null); // Ref để tham chiếu đến toàn bộ component

    // Hàm để bật/tắt dropdown
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    // Hàm xử lý đăng xuất  
    const handleLogout = () => {
        logoutUser();
        // Việc chuyển hướng sẽ do ProtectedRoute xử lý
    };

    // Effect để xử lý việc bấm ra ngoài component
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu dropdown đang mở và người dùng bấm ra ngoài khu vực của panelRef
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setDropdownOpen(false); // Đóng dropdown
            }
        };

        // Thêm event listener khi component được mount
        document.addEventListener('mousedown', handleClickOutside);
        
        // Dọn dẹp event listener khi component bị unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần khi mount

    return (
        // Gắn ref vào div cha của component
        <div className="user-panel-container" ref={panelRef}>
            {/* Toàn bộ khu vực này có thể bấm để bật/tắt dropdown */}
            <div className="user-profile" onClick={toggleDropdown}>
                {/* HIỂN THỊ TÊN NGƯỜI DÙNG TỪ AUTHSTATE */}
                <span>{authState.isAuthenticated ? authState.user?.full_name : 'Loading...'}</span>
                <img
                    src={authState.isAuthenticated ? authState.user?.role === 'manager' ? avatar : (authState.user?.role === 'admin' ? avatar: avatar): avatar}
                    alt="User Avatar"
                    className="user-avatar"
                />
            </div>

            {/* Chỉ hiện dropdown menu khi isDropdownOpen là true */}
            {isDropdownOpen && (
                <div className="dropdown-menu">
                    <button className="dropdown-item">Cài đặt</button>
                    <button onClick={handleLogout} className="dropdown-item">
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default Panel;