import React, { useState, useContext, useRef, useEffect } from 'react';
import { LoginContext } from '../../contexts/LoginUser/LoginConText';
import manager_avt from '../../assets/manager_avt.png'; 
import admin_avt from '../../assets/admin_avt.png';
import user_avt from '../../assets/user_avt.png';
import '../../css/Nav/Panel.css'; 
import { useNavigate } from 'react-router-dom';

const Panel = () => {
    const { authState, logoutUser } = useContext(LoginContext);

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const panelRef = useRef(null); // Ref để tham chiếu đến toàn bộ component

    // Hàm để bật/tắt dropdown
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        logoutUser();
    };
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); 

    return (
        <div className="user-panel-container" ref={panelRef}>
            <div className="user-profile" onClick={toggleDropdown}>
                <span>Xin chào, {authState.isAuthenticated ? authState.user?.full_name : 'Loading...'}</span>
                <img
                    src={authState.isAuthenticated ? authState.user?.role.id === 1 ? admin_avt : (authState.user?.role.id === 3 ? manager_avt: user_avt): user_avt}
                    alt="User Avatar"
                    className="user-avatar" 
                />
            </div>

            {isDropdownOpen && (
                <div className="dropdown-menu">
                    <button onClick={() => navigate('/dashboard')} className="dropdown-item">Thông tin cá nhân</button>
                    <button onClick={handleLogout} className="dropdown-item">
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default Panel;