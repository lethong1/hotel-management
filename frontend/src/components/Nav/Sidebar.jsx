import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LoginContext } from "../../contexts/LoginConText";
import "../../css/Nav/Sidebar.css";
import logo from "../../assets/logo.png";
import room from "../../assets/room.png";
import list_icon from "../../assets/list_icon.png";
import amenities from "../../assets/amenities.png";
import booking from "../../assets/booking.png";
import employee from "../../assets/employee.png";
const Sidebar = () => {
  const { authState } = useContext(LoginContext);
  const user = authState.user;

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <div className="sidebar-menu">
        <p className="menu-title">QUẢN LÝ PHÒNG</p>
        {(user?.role.id === 1 || user?.role.id === 3) && (
          <Link to="/dashboard/user-management" className="menu-item">
            <img
              src={employee}
              alt="employee_icon"
              style={{
                width: "40px",
                height: "40px",
                marginRight: "10px",
                backgroundColor: "white",
                padding: "5px",
                borderRadius: "10%",
              }}
            />
            <span>Quản Lí Nhân Viên</span>
          </Link>
        )}
        <Link to="/dashboard/room-list" className="menu-item">
          <img
            src={list_icon}
            alt="list_icon"
            style={{
              width: "40px",
              height: "40px",
              marginRight: "10px",
              backgroundColor: "white",
              padding: "5px",
              borderRadius: "10%",
            }}
          />
          <span>Danh sách phòng</span>
        </Link>
        <Link to="/dashboard/room-type-list" className="menu-item">
          <img
            src={room}
            alt="room_icon"
            style={{
              width: "40px",
              height: "40px",
              marginRight: "10px",
              backgroundColor: "white",
              padding: "5px",
              borderRadius: "10%",
            }}
          />
          <span>Loại phòng</span>
        </Link>
        <Link to="/dashboard/amenities" className="menu-item">
          <img
            src={amenities}
            alt="amenities_icon"
            style={{
              width: "40px",
              height: "40px",
              marginRight: "10px",
              backgroundColor: "white",
              padding: "5px",
              borderRadius: "10%",
            }}
          />
          <span>Tiện Nghi</span>
        </Link>
        <Link to="/dashboard/booking" className="menu-item">
          <img
            src={booking}
            alt="booking_icon"
            style={{
              width: "40px",
              height: "40px",
              marginRight: "10px",
              backgroundColor: "white",
              padding: "5px",
              borderRadius: "10%",
            }}
          />
          <span>Đặt phòng</span>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
