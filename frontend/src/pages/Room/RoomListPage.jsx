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
import { RoomListProvider, useRoomList } from "../../contexts/Room/RoomListContext"; // Import hook
import "../../css/Room/RoomListPage.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

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
    showModal, 
    isModalVisible,
    handleCancelModal,
    handleFormSubmit, 
    form,
    editingRoom,
    roomTypes = [],
  } = useRoomList();
  const navigate = useNavigate();
  const columns = [
    { title: "Số Phòng", dataIndex: "room_number", key: "room_number" },
    { title: "Loại Phòng", dataIndex: ["room_type", "name"], key: "roomType" },
    { title: "Tầng", dataIndex: "floor", key: "floor" },
    { 
      title: "Sức chứa", 
      key: "capacity",
      render: (_, record) => record.capacity ?? record.room_type?.capacity ?? "N/A"
    },
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
              onClick={() => navigate(`/dashboard/booking/`)}
              disabled={!record.bookingId}
            >
              Xem chi tiết
            </Button>
          ) : (
          <>
            <Button onClick={() => showModal(record)}>Sửa</Button>
            <Button type="link" danger onClick={() => handleDelete(record)}>
              Xóa
            </Button>
          </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="room-list-page">
      <div className="form-container">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ marginBottom: 16, background: "#BBD38B" }}
        >
          THÊM PHÒNG
        </Button>
        <div className="room-management-table">
          <Table columns={columns} dataSource={rooms} loading={loading} bordered />
        </div>
        <Modal
          title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          open={isModalVisible}
          onOk={handleFormSubmit}
          onCancel={handleCancelModal}
          okText={editingRoom ? "Cập nhật" : "Tạo"}
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical">
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
    </div>
  );
};

const RoomListPage = () => (
  <RoomListProvider>
    <RoomListContent />
  </RoomListProvider>
);

export default RoomListPage;
