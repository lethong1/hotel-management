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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RoomListProvider, useRoomList } from "../contexts/RoomListContext"; // Import hook
import "../css/RoomListPage.css";

const { Title } = Typography;
const { Option } = Select;

// --- Các hàm tiện ích ---
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
const renderStatusTag = (status) => {
  const statusMap = {
    available: { color: "green", text: "PHÒNG TRỐNG" },
    occupied: { color: "red", text: "ĐANG Ở" },
    maintenance: { color: "orange", text: "ĐANG SỬA CHỮA" },
  };
  const style = statusMap[status] || {
    color: "default",
    text: status.toUpperCase(),
  };
  return <Tag color={style.color}>{style.text}</Tag>;
};

// Component con để hiển thị nội dung
const RoomListContent = () => {
  const {
    rooms,
    loading,
    handleDelete,
    showModal, // <-- Dùng hàm showModal chung
    isModalVisible,
    handleCancelModal,
    handleFormSubmit, // <-- Dùng hàm submit chung
    form,
    editingRoom,
    handleCheckout,
    roomTypes = [],
  } = useRoomList();

  const columns = [
    { title: "Số Phòng", dataIndex: "room_number", key: "room_number" },
    { title: "Loại Phòng", dataIndex: ["room_type", "name"], key: "roomType" },
    { title: "Tầng", dataIndex: "floor", key: "floor" },
    { title: "Sức chứa", dataIndex: "capacity", key: "capacity" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "occupied" ? (
            <Button
              danger
              onClick={() => handleCheckout(record.bookingId)}
              disabled={!record.bookingId}
            >
              Trả phòng
            </Button>
          ) : (
            // Gọi showModal với record để sửa
            <Button onClick={() => showModal(record)}>Sửa</Button>
          )}
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="room-list-page">
      {/* Gọi showModal không có tham số để thêm mới */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        THÊM PHÒNG
      </Button>
      <Table columns={columns} dataSource={rooms} loading={loading} bordered />
      <Modal
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancelModal}
        okText={editingRoom ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          {/* Các trường trong form để thêm/sửa */}
          <Form.Item
            name="room_number"
            label="Số phòng"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="floor" label="Tầng" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="room_type_id"
            label="Loại phòng"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn loại phòng">
              {roomTypes.map((roomType) => (
                <Option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="available">Phòng trống</Option>
              <Option value="maintenance">Đang sửa chữa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const RoomListPage = () => (
  <RoomListProvider>
    <Title level={2}>Danh sách phòng</Title>
    <RoomListContent />
  </RoomListProvider>
);

export default RoomListPage;
