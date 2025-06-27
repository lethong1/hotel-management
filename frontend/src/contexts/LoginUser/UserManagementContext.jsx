
import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../../api/apiClient";

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

      // Chuẩn bị dữ liệu cho backend
      const backendData = {
        username: values.username,
        email: values.email,
        full_name: values.fullName,
        phone_number: values.phone_number || "", // Thêm trường bắt buộc
        address: values.address || "", // Thêm trường bắt buộc
      };

      // Xử lý password
      if (values.password) {
        backendData.password = values.password;
      }

      // Xử lý role - cần gửi ID của role thay vì string
      if (values.role) {
        // Tìm role ID dựa trên role name - theo database thực tế
        const roleMap = {
          admin: 1,
          user: 2,
          manager: 3,
        };
        backendData.role = roleMap[values.role] || 2; // Mặc định là user (ID: 2)
      }

      // Xử lý status -> is_active
      if (values.status) {
        backendData.is_active = values.status === "active";
      }

      if (editingUser) {
        // Chế độ Sửa
        apiClient
          .put(`/users/${editingUser.key}/`, backendData)
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
          .post("/users/", backendData)
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
          .catch((err) => {
            message.error("Thêm người dùng mới thất bại!");
            console.log("Error details:", err.response?.data);
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
