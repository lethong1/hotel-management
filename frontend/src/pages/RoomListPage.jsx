// File: src/pages/RoomListPage.jsx
import React from "react";
import {
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRoomList } from "../contexts/RoomListContext"; // <-- Import hook
import "../css/RoomListPage.css";

const { Title, Text } = Typography;
const { Option } = Select;

// --- Các hàm tiện ích ---
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const renderStatusTag = (status) => {
  switch (status) {
    case "available":
      return <Tag color="green">PHÒNG TRỐNG</Tag>;
    case "occupied":
      return <Tag color="red">ĐANG Ở</Tag>;
    case "cleaning":
      return <Tag color="cyan">ĐANG CHỜ DỌN</Tag>;
    case "maintenance":
      return <Tag color="orange">ĐANG SỬA CHỮA</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const RoomListPage = () => {
  const navigate = useNavigate();
  // Lấy dữ liệu và logic từ Context
  const {
    rooms,
    loading,
    handleDelete,
    showEditModal,
    isEditModalVisible,
    handleCancelModal,
    handleUpdate,
    form,
  } = useRoomList();

  const palette = {
    primary: "#BBD38B",
    pageBackground: "#F7F6E7",
    border: "#DFDDC5",
    tableHeaderBg: "#E9E8DA",
    actionBlue: "#2563EB",
  };

  const columns = [
    {
      title: "Số Phòng",
      dataIndex: "roomNumber",
      key: "roomNumber",
      align: "center",
    },
    { title: "Loại Phòng", dataIndex: "roomType", key: "roomType" },
    { title: "Tầng", dataIndex: "floor", key: "floor", align: "center" },
    {
      title: "Sức chứa tối đa",
      dataIndex: "capacity",
      key: "capacity",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: renderStatusTag,
    },
    {
      title: "Giá cơ bản",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: formatCurrency,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <a className="action-link-edit" onClick={() => showEditModal(record)}>
            SỬA
          </a>
          <a
            className="action-link-delete"
            onClick={() => handleDelete(record)}
          >
            XÓA
          </a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: palette.pageBackground,
          minHeight: "100vh",
          padding: "20px 40px",
          fontFamily: "'Inter', sans-serif",
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
            onClick={() => navigate("/add-room")}
          >
            THÊM PHÒNG
          </Button>
        </div>
        <div className="room-management-table">
          <Table
            columns={columns}
            dataSource={rooms} // <-- Dùng dữ liệu từ Context
            loading={loading} // <-- Dùng trạng thái loading từ Context
            pagination={false}
            bordered={false}
          />
        </div>
      </div>

      {/* --- Modal để chỉnh sửa --- */}
      <Modal
        title="Chỉnh sửa thông tin phòng"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancelModal}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="edit_room_form">
          <Form.Item
            name="roomNumber"
            label="Số phòng"
            rules={[{ required: true, message: "Vui lòng nhập số phòng!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="available">Phòng trống</Option>
              <Option value="occupied">Đang ở</Option>
              <Option value="maintenance">Đang sửa chữa</Option>
              <Option value="cleaning">Đang chờ dọn</Option>
            </Select>
          </Form.Item>
          {/* Bạn có thể thêm các trường khác để sửa ở đây nếu cần */}
        </Form>
      </Modal>
    </>
  );
};

export default RoomListPage;
