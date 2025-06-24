// File: src/contexts/UserManagementContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import { v4 as uuidv4 } from "uuid";
import apiClient from "../api/apiClient";

const UserManagementContext = createContext();

export const UserManagementProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Tải dữ liệu
  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/users/")
      .then((res) => {
        // Giả sử API trả về mảng user, ánh xạ lại cho đúng format frontend
        const data = Array.isArray(res.data)
          ? res.data.map((user) => ({
              key: user.id,
              fullName: user.full_name || user.fullName || "",
              username: user.username,
              email: user.email,
              // Lấy role từ user.role.role (object)
              role: user.role?.role || "user", // 'admin', 'manager', 'user'
              roleName: user.role?.role
                ? user.role.role === "admin"
                  ? "Admin"
                  : user.role.role === "manager"
                  ? "Quản lý"
                  : "Người dùng"
                : "Người dùng",
              isActive: user.is_active, // boolean
              dateJoined: user.date_joined || user.dateJoined || "",
              raw: user,
            }))
          : [];
        setUsers(data);
      })
      .catch(() => {
        message.error("Không thể tải danh sách người dùng!");
      })
      .finally(() => setLoading(false));
  }, []);

  // Xóa
  const handleDelete = (user) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa người dùng này?",
      content: `Người dùng: "${user.fullName}"`,
      okText: "Xóa",
      onOk: () => {
        apiClient
          .delete(`/users/${user.key}/`)
          .then(() => {
            setUsers((prev) => prev.filter((item) => item.key !== user.key));
            message.success("Đã xóa người dùng thành công!");
          })
          .catch((err) => {
            message.error("Xóa người dùng thất bại!");
            console.log(err.response.data);
          });
      },
    });
  };

  // Mở modal
  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  // Lưu (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Chuyển fullName -> full_name cho backend
      if (values.fullName) {
        values.full_name = values.fullName;
        delete values.fullName;
      }
      // Chuyển isActive -> is_active cho backend
      if (typeof values.isActive !== "undefined") {
        values.is_active = values.isActive;
        delete values.isActive;
      }
      if (editingUser) {
        // Chế độ Sửa
        apiClient
          .put(`/users/${editingUser.key}/`, values)
          .then((res) => {
            setUsers((prev) =>
              prev.map((item) =>
                item.key === editingUser.key
                  ? { ...item, ...values, ...res.data }
                  : item
              )
            );
            message.success("Cập nhật thông tin người dùng thành công!");
            handleCancelModal();
          })
          .catch((err) => {
            message.error("Cập nhật người dùng thất bại!");
            console.log(err.response.data);
          });
      } else {
        // Chế độ Thêm mới
        apiClient
          .post("/users/", values)
          .then((res) => {
            const user = res.data;
            setUsers((prev) => [
              ...prev,
              {
                key: user.id,
                fullName: user.full_name || user.fullName || "",
                username: user.username,
                email: user.email,
                role: user.role?.role || "user",
                roleName: user.role?.role
                  ? user.role.role === "admin"
                    ? "Admin"
                    : user.role.role === "manager"
                    ? "Quản lý"
                    : "Người dùng"
                  : "Người dùng",
                isActive: user.is_active,
                dateJoined: user.date_joined || user.dateJoined || "",
                raw: user,
              },
            ]);
            message.success("Thêm người dùng mới thành công!");
            handleCancelModal();
          })
          .catch(() => {
            message.error("Thêm người dùng mới thất bại!");
          });
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const value = {
    users,
    loading,
    isModalVisible,
    editingUser,
    form,
    handleDelete,
    showModal,
    handleCancelModal,
    handleSave,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error(
      "useUserManagement must be used within a UserManagementProvider"
    );
  }
  return context;
};
