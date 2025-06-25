import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../api/apiClient";
import dayjs from "dayjs";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  // STATE CHÍNH
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE PHỤ TRỢ CHO FORM
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);

  // STATE MODAL
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [form] = Form.useForm();

  // GỌI DỮ LIỆU BAN ĐẦU
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, customersRes, roomsRes] = await Promise.all([
        apiClient.get("/bookings/"),
        apiClient.get("/customers/"),
        apiClient.get("/rooms/"),
      ]);
      setBookings(
        Array.isArray(bookingsRes.data)
          ? bookingsRes.data.map((b) => ({ ...b, key: b.id }))
          : []
      );
      setCustomers(customersRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      message.error("Không thể tải được dữ liệu cần thiết!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // MỞ MODAL ĐẶT PHÒNG
  const showBookingModal = (bookingRecord = null) => {
    setEditingBooking(bookingRecord);
    if (bookingRecord) {
      form.setFieldsValue({
        ...bookingRecord,
        customer_id: bookingRecord.customer?.id,
        room_id: bookingRecord.room?.id,
        booking_dates: [
          dayjs(bookingRecord.check_in_date),
          dayjs(bookingRecord.check_out_date),
        ],
      });
    } else {
      form.resetFields();
    }
    setIsBookingModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsBookingModalVisible(false);
    setEditingBooking(null);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      let customerId = values.customer_id;

      if (values.isNewCustomer) {
        if (!values.full_name || !values.email) {
          throw new Error("Vui lòng nhập đầy đủ thông tin khách hàng mới.");
        }

        const customerPayload = {
          full_name: values.full_name,
          email: values.email,
          phone_number: values.phone_number,
          id_card_number: values.id_card_number,
          address: values.address,
        };

        const customerRes = await apiClient.post(
          "/customers/",
          customerPayload
        );
        customerId = customerRes.data.id;
      }

      if (!customerId) throw new Error("Vui lòng chọn khách hàng.");

      const bookingPayload = {
        customer_id: customerId,
        room_id: values.room_id,
        check_in_date: values.booking_dates[0].toISOString(),
        check_out_date: values.booking_dates[1].toISOString(),
        status: values.status || "confirmed",
        notes: values.notes || "",
      };

      if (editingBooking) {
        await apiClient.patch(
          `/bookings/${editingBooking.key}/`,
          bookingPayload
        );
        message.success("Cập nhật thành công!");
      } else {
        await apiClient.post("/bookings/", bookingPayload);
        message.success("Tạo booking thành công!");
      }

      handleCancelModal();
      fetchData();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.non_field_errors?.[0] ||
        Object.values(errorData || {})?.[0]?.[0] ||
        "Thao tác thất bại.";
      message.error(errorMessage);
      console.error("❌ Lỗi tạo khách hàng:", error.response?.data);
      message.error("Không thể tạo khách hàng mới");
      return;
    }
  };

  // HÀM XÓA BOOKING
  const handleDelete = (booking) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa đơn đặt phòng này?",
      content: `ID đơn đặt: ${booking.id}`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/bookings/${booking.id}/`);
          message.success("Xóa đơn đặt phòng thành công!");
          fetchData();
        } catch (err) {
          console.error("Lỗi khi xóa:", err);
          message.error("Xóa thất bại!");
        }
      },
    });
  };

  const value = {
    bookings,
    customers,
    rooms,
    loading,
    form,
    isBookingModalVisible,
    editingBooking,
    showBookingModal,
    handleCancelModal,
    handleFormSubmit,
    handleDelete, // THÊM VÀO ĐÂY
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
