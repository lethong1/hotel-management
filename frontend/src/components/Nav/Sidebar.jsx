import React from 'react';
import '../../css/Nav/Sidebar.css';
import logo from '../../assets/logo.png';
import room from '../../assets/room.png';
import list_icon from '../../assets/list_icon.png';
import amenities from '../../assets/amenities.png';
const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="logo" />
      </div>
      <div className="sidebar-menu">
        <p className="menu-title">QUẢN LÝ PHÒNG</p>
        <a href="#" className="menu-item">
        <img src={list_icon} alt="list_icon"  
          style={{width: '40px', height: '40px', marginRight: '10px',
          backgroundColor: 'white', padding: '5px', borderRadius: '10%'}}/>
          <span>Danh sách phòng</span>
        </a>
        <a href="#" className="menu-item">
          <img src={room} alt="room_icon"  
          style={{width: '40px', height: '40px', marginRight: '10px',
          backgroundColor: 'white', padding: '5px', borderRadius: '10%'}}/>
          <span>Loại Phòng</span>
        </a>
        <a href="#" className="menu-item">
          <img src={amenities} alt="amenities_icon"  
          style={{width: '40px', height: '40px', marginRight: '10px',
          backgroundColor: 'white', padding: '5px', borderRadius: '10%'}}/>
          <span>Tiện Nghi</span>
        </a>
      </div>
    </nav>
  );
};

export default Sidebar;