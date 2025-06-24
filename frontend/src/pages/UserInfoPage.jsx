import React, { useContext } from "react";
import { LoginContext } from "../contexts/LoginConText";
import manager_avt from "../assets/manager_avt.png";
import admin_avt from "../assets/admin_avt.png";
import user_avt from "../assets/user_avt.png";  
import "../css/UserInfoPage.css";

const UserInfoPage = () => {
  const { authState } = useContext(LoginContext);
  const user = authState.user;

  if (!authState.isAuthenticated || !user) {
    return (
      <div className="user-info-login-message">
        Vui lòng đăng nhập để xem thông tin cá nhân.
      </div>
    );
  }

  let createdAt = user.date_joined || user.created_at;
  let createdAtStr = createdAt
    ? new Date(createdAt).toLocaleString("vi-VN")
    : "Chưa cập nhật";

  return (
    <div className="user-info-page">
      <div className="user-info-container">
      <h1 className="user-info-title">
        Hồ sơ cá nhân
        <span className="user-info-title-underline"></span>
      </h1>
      <div className="user-info-flex">
        {/* Avatar Section */}
        <div className="user-info-avatar-section">    
          <img src={authState.isAuthenticated ? authState.user?.role.id === 1 ? admin_avt : (authState.user?.role.id === 3 ? manager_avt: user_avt): user_avt} alt="User Avatar" className="user-info-avatar" />
          <h3 className="user-info-fullname">
            {user.full_name || "Chưa cập nhật"}
          </h3>
          <p className="user-info-role">{user.role?.role || "Chưa cập nhật"}</p>
          <p className="user-info-created">Thành viên từ: {createdAtStr}</p>
        </div>
        {/* Info Section */}
        <div className="user-info-details">
          <div>
            <div className="user-info-label">Tên đăng nhập</div>
            <div className="user-info-value">
              {user.username || "Chưa cập nhật"}
            </div>
          </div>
          <div>
            <div className="user-info-label">Email</div>
            <div className="user-info-value">
              {user.email || "Chưa cập nhật"}
            </div>
          </div>
          <div>
            <div className="user-info-label">Số điện thoại</div>
            <div className="user-info-value">
              {user.phone_number || "Chưa cập nhật"}
            </div>
          </div>
          <div>
            <div className="user-info-label">Địa chỉ</div>
            <div className="user-info-value">
              {user.address || "Chưa cập nhật"}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserInfoPage;
