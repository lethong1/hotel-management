// File: src/pages/UserManagementPage.jsx

import React from "react";
import {
  Table,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useUserManagement } from "../contexts/UserManagementContext";

const { Option } = Select;

// Hàm render tag màu cho vai trò và trạng thái
const renderRoleTag = (role, record) => {
  // Ưu tiên dùng roleName nếu có, nếu không thì dùng role
  const roleKey = record.role || "user";
  const roleName = record.roleName || roleKey;
  const roleMap = {
    admin: { color: "volcano", text: "Admin" },
    manager: { color: "gold", text: "Quản lý" },
    user: { color: "geekblue", text: "Người dùng" },
  };
  const { color, text } = roleMap[roleKey] || {
    color: "default",
    text: roleName,
  };
  return <Tag color={color}>{String(text).toUpperCase()}</Tag>;
};

const renderStatusTag = (_, record) => {
  const isActive = record.isActive;
  const color = isActive ? "success" : "error";
  const text = isActive ? "Hoạt động" : "Vô hiệu hóa";
  return <Tag color={color}>{text.toUpperCase()}</Tag>;
};

const UserManagementPage = () => {
  const {
    users,
    loading,
    handleDelete,
    showModal,
    isModalVisible,
    handleCancelModal,
    handleSave,
    editingUser,
    form,
  } = useUserManagement();

  const palette = {
    primary: "#BBD38B",
    pageBackground: "#F7F6E7",
    tableHeaderBg: "#E9E8DA",
    actionBlue: "#2563EB",
  };

  const tableStyles = `
        .custom-table .ant-table-thead > tr > th { background-color: ${palette.tableHeaderBg} !important; font-weight: 600; }
        .action-link { color: #333; font-weight: 500; }
        .delete-link { color: ${palette.actionBlue}; font-weight: 500; }
    `;

  const columns = [
    { title: "Họ và Tên", dataIndex: "fullName", key: "fullName" },
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: renderRoleTag,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: renderStatusTag,
    },
    {
      title: "Ngày tham gia",
      dataIndex: "dateJoined",
      key: "dateJoined",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>{tableStyles}</style>
      <div
        style={{
          backgroundColor: palette.pageBackground,
          minHeight: "100vh",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button
            icon={<PlusOutlined />}
            size="large"
            style={{
              backgroundColor: palette.primary,
              borderColor: palette.primary,
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
            }}
            onClick={() => showModal()}
          >
            THÊM NGƯỜI DÙNG
          </Button>
        </div>

        <div className="custom-table">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="key"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </div>
      </div>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancelModal}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="user_form">
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Số điện thoại"
            rules={[
              { required: false, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: false, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: !editingUser, message: "Vui lòng nhập mật khẩu!" },
            ]}
            help={
              editingUser ? "Để trống nếu không muốn thay đổi mật khẩu" : ""
            }
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="manager">Quản lý</Option>
              <Option value="user">Người dùng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Vô hiệu hóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagementPage;
