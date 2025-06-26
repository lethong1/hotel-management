import React from "react";
import { BookingProvider, useBooking } from "../contexts/BookingContext";
import BookingModal from "./BookingModal";
import { Table, Button, Tag, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CreditCardOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

// Import hàm định dạng từ file tiện ích
import { formatVNDateTime, formatCurrency } from "../utils/Formatter";

const { Title } = Typography;

// Component con để hiển thị nội dung chính
const BookingView = () => {
  const navigate = useNavigate();
  // Lấy dữ liệu và các hàm từ context
  const { bookings, loading, showBookingModal, handleDelete } = useBooking();

  // Hàm xử lý chuyển đến trang thanh toán
  const handlePayment = (booking) => {
    // Chuyển đến trang chi tiết hóa đơn của booking này
    navigate(`/invoices/${booking.invoice?.id}`);
  };

  // Hàm xử lý xem chi tiết hóa đơn
  const handleViewInvoice = (booking) => {
    navigate(`/invoices/${booking.invoice?.id}`);
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", fixed: "left", width: 30 },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "full_name"],
      key: "customer",
      width: 150,
    },
    {
      title: "Phòng",
      dataIndex: ["room", "room_number"],
      key: "room",
      width: 50,
    },
    {
      title: "Ngày nhận phòng",
      dataIndex: "check_in_date",
      key: "check_in_date",
      width: 110,
      render: (isoString) => formatVNDateTime(isoString),
    },
    {
      title: "Ngày trả phòng",
      dataIndex: "check_out_date",
      key: "check_out_date",
      width: 110,
      render: (isoString) => formatVNDateTime(isoString),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_price",
      key: "total_price",
      width: 100,
      render: (price) => formatCurrency(parseFloat(price)),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status) => {
        let color = "default";
        let text = status.toUpperCase();

        switch (status) {
          case "confirmed":
            color = "blue";
            text = "ĐÃ XÁC NHẬN";
            break;
          case "checked_in":
            color = "green";
            text = "ĐÃ NHẬN PHÒNG";
            break;
          case "checked_out":
            color = "orange";
            text = "ĐÃ TRẢ PHÒNG";
            break;
          case "cancelled":
            color = "red";
            text = "ĐÃ HỦY";
            break;
          default:
            color = "default";
            text = "CHỜ XÁC NHẬN";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => {
        const isCheckedIn = record.status === "checked_in";
        const isCheckedOut = record.status === "checked_out";
        const isPaid = record.invoice?.status === "paid";

        return (
          <Space>
            {isCheckedIn && !isPaid && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => handlePayment(record)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Thanh Toán
              </Button>
            )}

            {isCheckedOut && isPaid && (
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleViewInvoice(record)}
              >
                Xem Chi Tiết
              </Button>
            )}

            {!isCheckedIn && !isCheckedOut && (
              <Button
                icon={<EditOutlined />}
                onClick={() => showBookingModal(record)}
              >
                Sửa
              </Button>
            )}

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => showBookingModal(null)}
        style={{ marginBottom: 16 }}
      >
        Tạo Đơn đặt phòng mới
      </Button>
      <Table
        columns={columns}
        dataSource={bookings}
        loading={loading}
        bordered
        scroll={{ x: 1300 }} // Thêm thanh cuộn ngang nếu bảng quá rộng
      />
      {/* Modal để thêm/sửa sẽ được quản lý bởi context */}
      <BookingModal />
    </div>
  );
};

// Component cha của trang, bọc mọi thứ trong Provider
const BookingPage = () => {
  return (
    <BookingProvider>
      <Title level={2}>Quản lý Đặt phòng</Title>
      <BookingView />
    </BookingProvider>
  );
};

export default BookingPage;
