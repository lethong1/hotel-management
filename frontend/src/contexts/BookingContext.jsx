// File: src/contexts/BookingContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../api/apiClient";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);

  // Đổi tên state để rõ nghĩa hơn: quản lý modal chi tiết phòng
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form này vẫn có thể cần nếu bạn muốn thêm các trường khác trong tương lai
  const [form] = Form.useForm();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/rooms/");
      const data = Array.isArray(res.data)
        ? res.data.map((room) => ({
            key: room.id,
            roomNumber: room.room_number,
            roomType: room.room_type?.name || "",
            floor: room.floor,
            capacity: room.room_type?.capacity || "",
            status: room.status,
            price: parseFloat(room.room_type?.price_per_night) || 0,
          }))
        : [];
      setRooms(data);
    } catch (err) {
      message.error("Không thể tải danh sách phòng!");
    }
    setLoading(false);
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await apiClient.get("/room-types/");
      setRoomTypes(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách loại phòng!");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  // Hàm mở Modal chi tiết
  const showDetailModal = (room) => {
    setSelectedRoom(room);
    setIsDetailModalVisible(true);
  };

  const handleCancelDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedRoom(null);
  };

  // Hàm xác nhận đặt phòng (tạo booking)
  const handleConfirmBooking = async (roomToBook, bookingRange) => {
    if (!roomToBook || !bookingRange || !bookingRange[0] || !bookingRange[1])
      return;

    try {
      // Giả sử customer_id là 1 (cần lấy động trong thực tế)
      const payload = {
        room_id: roomToBook.key,
        customer_id: 1, // TODO: lấy từ user hoặc chọn khách hàng
        check_in_date: bookingRange[0].toISOString(),
        check_out_date: bookingRange[1].toISOString(),
        status: "confirmed",
      };
      await apiClient.post("/bookings/", payload);
      message.success(`Phòng ${roomToBook.roomNumber} đã được đặt thành công!`);
      handleCancelDetailModal();
      fetchRooms();
    } catch (err) {
      if (err.response && err.response.data) {
        // Kiểm tra lỗi phòng đã được đặt trong khoảng thời gian này
        if (
          err.response.data.non_field_errors &&
          Array.isArray(err.response.data.non_field_errors) &&
          err.response.data.non_field_errors.some((msg) =>
            msg.includes("được đặt trong khoảng thời gian")
          )
        ) {
          message.error(
            "Phòng này đã có người đặt trong khoảng thời gian bạn chọn. Vui lòng chọn phòng khác hoặc đổi ngày."
          );
        } else {
          const detail =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          message.error(`Đặt phòng thất bại: ${detail}`);
        }
      } else {
        message.error("Thao tác đặt phòng thất bại!");
      }
    }
  };

  // Hàm trả phòng
  const handleCheckoutRoom = async (roomToCheckout) => {
    if (!roomToCheckout) return;
    try {
      // 1. Lấy booking active của phòng này
      const res = await apiClient.get(
        `/bookings/?room_id=${roomToCheckout.key}&status=confirmed`
      );
      const activeBookings = Array.isArray(res.data) ? res.data : [];
      if (activeBookings.length > 0) {
        // Giả sử chỉ có 1 booking active tại 1 thời điểm
        const bookingId = activeBookings[0].id;
        await apiClient.patch(`/bookings/${bookingId}/`, {
          status: "checked_out", // hoặc "cancel" nếu muốn huỷ
        });
      }
      // 2. Cập nhật trạng thái phòng
      await apiClient.patch(`/rooms/${roomToCheckout.key}/`, {
        status: "available",
      });
      message.success(
        `Phòng ${roomToCheckout.roomNumber} đã được trả thành công!`
      );
      handleCancelDetailModal();
      fetchRooms();
    } catch (err) {
      message.error("Thao tác trả phòng thất bại!");
    }
  };

  const value = {
    rooms,
    loading,
    form, // Giữ lại form để có thể dùng trong tương lai
    selectedRoom,
    isDetailModalVisible,
    showDetailModal,
    handleCancelDetailModal,
    handleConfirmBooking, // <-- Hàm mới
    roomTypes, // Thêm roomTypes vào context
    handleCheckoutRoom, // Thêm hàm trả phòng vào context
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
