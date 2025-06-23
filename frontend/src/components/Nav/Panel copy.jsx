import React from 'react';
import '../../css/Nav/Panel.css';
import avatar from '../../assets/avatar.png';
const UserProfile = ({ name }) => (
  <div className="user-profile">
    <span>{name}</span>
    <img src={avatar} alt="Avatar người dùng" />
  </div>
);


const Panel = () => {
  return (
    <header className="panel">
      <div className="search-and-filters">
        <div className="search-bar">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search....." />
        </div>
        <button className="filter-btn">All</button>
        <button className="filter-btn">Loại Phòng <i className="fa-solid fa-chevron-down"></i></button>
        <button className="filter-btn">Tầng <i className="fa-solid fa-chevron-down"></i></button>
        <button className="filter-btn">Trạng thái <i className="fa-solid fa-chevron-down"></i></button>
      </div>
      <UserProfile name="Tên người dùng" avatarUrl={avatar} />
    </header>
  );
};

export default Panel;