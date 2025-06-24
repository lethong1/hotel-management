// File: src/pages/BookingPage.jsx

import React, { useState } from "react";
import {
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Descriptions,
  DatePicker,
} from "antd"; // Thêm DatePicker
import { useBooking } from "../contexts/BookingContext";
import "../css/BookingPage.css";

const { Title, Text } = Typography;

// --- Các hàm tiện ích không đổi ---
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

const BookingPage = () => {
  // Lấy các state và hàm đã được cập nhật từ Context
  const {
    rooms,
    loading,
    selectedRoom,
    isDetailModalVisible,
    showDetailModal,
    handleCancelDetailModal,
    handleConfirmBooking,
    roomTypes,
    handleCheckoutRoom,
  } = useBooking();

  const palette = {
    primary: "#BBD38B",
    pageBackground: "#F7F6E7",
    border: "#DFDDC5",
    tableHeaderBg: "#E9E8DA",
    actionBlue: "#1890ff",
  };

  const [bookingRange, setBookingRange] = useState([null, null]);

  const columns = [
    {
      title: "Số Phòng",
      dataIndex: "roomNumber",
      key: "roomNumber",
      align: "center",
    },
    { title: "Loại Phòng", dataIndex: "roomType", key: "roomType" },
    {
      title: "Giá cơ bản",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: formatCurrency,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: renderStatusTag,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) =>
        // Chỉ hiển thị nút "Đặt phòng" khi phòng đang trống
        record.status === "available" ? (
          <Button
            className="booking-primary-btn"
            onClick={() => showDetailModal(record)}
          >
            ĐẶT PHÒNG
          </Button>
        ) : (
          // Bạn có thể hiển thị một nút khác để check-out hoặc cập nhật
          <Button onClick={() => showDetailModal(record)}>XEM CHI TIẾT</Button>
        ),
    },
  ];

  return (
    <div className="booking-page-container">
      <Title level={2} className="booking-page-title">
        SƠ ĐỒ PHÒNG CHO LỄ TÂN
      </Title>

      <div className="room-booking-table">
        <Table
          columns={columns}
          dataSource={rooms}
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>

      {/* --- Modal mới để hiển thị chi tiết và xác nhận đặt phòng --- */}
      <Modal
        title={
          <Title level={4}>Chi tiết phòng {selectedRoom?.roomNumber}</Title>
        }
        open={isDetailModalVisible}
        onCancel={handleCancelDetailModal}
        footer={[
          <Button key="back" onClick={handleCancelDetailModal}>
            Đóng
          </Button>,
          selectedRoom?.status === "available" && (
            <Button
              key="submit"
              className="booking-primary-btn"
              onClick={() => handleConfirmBooking(selectedRoom, bookingRange)}
              disabled={!bookingRange[0] || !bookingRange[1]}
            >
              Xác nhận Đặt phòng
            </Button>
          ),
          selectedRoom?.status === "occupied" && (
            <Button
              key="checkout"
              danger
              onClick={() => handleCheckoutRoom(selectedRoom)}
            >
              Trả phòng
            </Button>
          ),
        ]}
      >
        {selectedRoom && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Số phòng">
                {selectedRoom.roomNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Loại phòng">
                {selectedRoom.roomType}
              </Descriptions.Item>
              <Descriptions.Item label="Tầng">
                {selectedRoom.floor}
              </Descriptions.Item>
              <Descriptions.Item label="Sức chứa">
                {selectedRoom.capacity}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cơ bản">
                {formatCurrency(selectedRoom.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                {renderStatusTag(selectedRoom.status)}
              </Descriptions.Item>
            </Descriptions>
            {/* Chọn ngày giờ đặt phòng */}
            <div style={{ margin: "16px 0" }}>
              <Text strong>Chọn ngày nhận - trả phòng:</Text>
              <br />
              <DatePicker.RangePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={bookingRange}
                onChange={setBookingRange}
                style={{ marginTop: 8, width: "100%" }}
                placeholder={["Ngày nhận phòng", "Ngày trả phòng"]}
              />
            </div>
            {/* Danh sách tiện nghi theo loại phòng */}
            <div className="booking-modal-amenities">
              <Text strong>Tiện nghi:</Text>
              <ul>
                {(() => {
                  const roomTypeObj = roomTypes.find(
                    (rt) => rt.name === selectedRoom.roomType
                  );
                  const amenities = roomTypeObj?.amenities || [];
                  return amenities.length > 0 ? (
                    amenities.map((amenity) => (
                      <li key={amenity.id || amenity}>
                        {amenity.name || amenity}
                      </li>
                    ))
                  ) : (
                    <li className="no-amenity">Không có tiện nghi.</li>
                  );
                })()}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BookingPage;
