import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../api/apiClient";

const RoomListContext = createContext();

export const RoomListProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form] = Form.useForm();
    const [roomTypes, setRoomTypes] = useState([]);

    const fetchRoomTypes = async () => {
        try {
            const res = await apiClient.get("/room-types/");
            setRoomTypes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi khi tải loại phòng:", err);
            message.error("Không thể tải danh sách loại phòng!");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, bookingsRes] = await Promise.all([
                apiClient.get("/rooms/"),
                apiClient.get("/bookings/?status__in=confirmed,checked_in"),
            ]);

            const allRooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
            const activeBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

            const data = allRooms.map((room) => {
                const bookingForThisRoom = activeBookings.find(b => b.room?.id === room.id);
                return {
                    ...room,
                    key: room.id,
                    bookingId: bookingForThisRoom ? bookingForThisRoom.id : null,
                };
            });
            setRooms(data);

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            message.error("Không thể tải được dữ liệu!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchRoomTypes();
    }, []);

    const handleDelete = (room) => {
        Modal.confirm({
            title: "Bạn có chắc muốn xóa phòng này?",
            content: `Phòng số: ${room.room_number}`,
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await apiClient.delete(`/rooms/${room.key}/`);
                    message.success(`Đã xóa phòng ${room.room_number}`);
                    fetchData();
                } catch {
                    message.error("Xóa phòng thất bại!");
                }
            },
        });
    };
    
    // Đổi tên isEditModalVisible thành isModalVisible cho chung
    const showModal = (room = null) => {
        setEditingRoom(room);
        if (room) {
            // Nếu là sửa, điền thông tin phòng và ID của loại phòng
            form.setFieldsValue({
                ...room,
                room_type_id: room.room_type?.id,
            });
        } else {
            // Nếu là thêm mới, reset form
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingRoom(null);
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values }; // Lấy tất cả giá trị từ form

            if (editingRoom) {
                // SỬA: Dùng PATCH để linh hoạt
                await apiClient.patch(`/rooms/${editingRoom.key}/`, payload);
                message.success("Cập nhật phòng thành công!");
            } else {
                // THÊM:
                await apiClient.post("/rooms/", payload);
                message.success("Thêm phòng thành công!");
            }
            handleCancelModal();
            fetchData();
        } catch (err) {
            console.error("Lỗi submit form:", err.response);
            message.error("Thao tác thất bại!");
        }
    };

    const handleCheckout = async (bookingId) => {
        if (!bookingId) {
            message.error("Phòng này không có thông tin đặt phòng hợp lệ!");
            return;
        }
        try {
            await apiClient.patch(`/bookings/${bookingId}/`, { status: "checked_out" });
            message.success("Trả phòng thành công!");
            fetchData();
        } catch (err) {
            message.error("Thao tác trả phòng thất bại!");
        }
    };

    // TẬP HỢP TẤT CẢ CÁC HÀM VÀ STATE CẦN THIẾT
    const value = {
        rooms,
        loading,
        form,
        isModalVisible,
        editingRoom,
        showModal,
        handleCancelModal,
        handleFormSubmit,
        handleDelete,
        handleCheckout,
        roomTypes,
    };

    return (
        <RoomListContext.Provider value={value}>
            {children}
        </RoomListContext.Provider>
    );
};

export const useRoomList = () => useContext(RoomListContext);