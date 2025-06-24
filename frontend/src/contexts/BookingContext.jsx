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

  // Hàm xác nhận đặt phòng (thay thế hàm update cũ)
  const handleConfirmBooking = async (roomToBook) => {
    if (!roomToBook) return;

    try {
      // Tự động cập nhật trạng thái thành 'occupied'
      await apiClient.patch(`/rooms/${roomToBook.key}/`, {
        status: "occupied",
      });
      message.success(`Phòng ${roomToBook.roomNumber} đã được đặt thành công!`);

      // Đóng modal và tải lại dữ liệu
      handleCancelDetailModal();
      fetchRooms();
    } catch (err) {
      message.error("Thao tác đặt phòng thất bại!");
    }
  };

  // Hàm trả phòng
  const handleCheckoutRoom = async (roomToCheckout) => {
    if (!roomToCheckout) return;
    try {
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
