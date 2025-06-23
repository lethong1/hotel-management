// File: src/contexts/RoomListContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../api/apiClient";

// --- Dữ liệu giả để mô phỏng API ---
// const initialRoomData = [ ... ]; // XÓA HOẶC COMMENT DÒNG NÀY

const RoomListContext = createContext();

export const RoomListProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  // 1. Logic tải dữ liệu
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/rooms/");
      // Chuyển đổi dữ liệu từ backend về đúng format frontend cần
      const data = Array.isArray(res.data)
        ? res.data.map((room) => ({
            key: room.id,
            roomNumber: room.room_number,
            roomTypeId: room.room_type?.id,
            roomType: room.room_type?.name || "",
            floor: room.floor,
            capacity: room.room_type?.capacity || "",
            status: room.status,
            price: parseFloat(room.room_type?.price_per_night) || 0,
            amenities: room.room_type?.amenities || [],
            raw: room, // lưu lại object gốc nếu cần
          }))
        : [];
      setRooms(data);
    } catch (err) {
      message.error("Không thể tải danh sách phòng!");
    }
    setLoading(false);
  };

  // 2. Logic Xóa
  const handleDelete = (room) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa phòng này?",
      content: `Phòng số: ${room.roomNumber}`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/rooms/${room.key}/`);
          message.success(`Đã xóa phòng ${room.roomNumber}`);
          fetchRooms();
        } catch {
          message.error("Xóa phòng thất bại!");
        }
      },
    });
  };

  // 3. Logic Sửa
  const showEditModal = (room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      roomNumber: room.roomNumber,
      status: room.status,
      roomTypeId: room.roomTypeId,
      floor: room.floor,
    });
    setIsEditModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsEditModalVisible(false);
    setEditingRoom(null);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`/rooms/${editingRoom.key}/`, {
        room_number: values.roomNumber,
        status: values.status,
        room_type_id: values.roomTypeId,
        floor: values.floor, 
      });
      message.success("Cập nhật thành công!");
      handleCancelModal();
      fetchRooms();
    } catch (err) {
      message.error("Cập nhật thất bại!");
      console.error(err.response?.data || err);
    }
  };

  const value = {
    rooms,
    loading,
    handleDelete,
    showEditModal,
    // Props cho Modal chỉnh sửa
    isEditModalVisible,
    handleCancelModal,
    handleUpdate,
    editingRoom,
    form,
  };

  return (
    <RoomListContext.Provider value={value}>
      {children}
    </RoomListContext.Provider>
  );
};

export const useRoomList = () => {
  const context = useContext(RoomListContext);
  if (!context) {
    throw new Error("useRoomList must be used within a RoomListProvider");
  }
  return context;
};
