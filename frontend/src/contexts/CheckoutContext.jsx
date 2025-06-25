// File: src/contexts/CheckoutContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, message } from "antd";
import { useParams } from "react-router-dom"; // Hook để lấy ID từ URL
import dayjs from "dayjs";
import apiClient from "../api/apiClient";

// Dữ liệu giả lập cho một booking cụ thể
const mockBookingDetails = {
  id: "booking123",
  room: {
    key: "3",
    roomNumber: "201",
    roomType: "Phòng đôi",
    price: 1000000,
  },
  checkInDate: "2025-06-26",
  checkOutDate: "2025-06-28",
};

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [form] = Form.useForm();
  const { bookingId } = useParams(); // Lấy ID từ URL, ví dụ: /checkout/booking123

  // Tính toán chi phí
  const calculateCost = (details) => {
    if (!details) return null;
    const checkIn = dayjs(details.checkInDate);
    const checkOut = dayjs(details.checkOutDate);
    const numberOfNights = checkOut.diff(checkIn, "day");
    const roomCost = details.room.price * numberOfNights;
    const vat = roomCost * 0.08; // Giả sử VAT 8%
    const total = roomCost + vat;
    return { numberOfNights, roomCost, vat, total };
  };

  // Tải thông tin booking
  useEffect(() => {
    const fetchBookingDetails = () => {
      setLoading(true);
      // Giả lập gọi API: apiClient.get(`/bookings/${bookingId}`)
      setTimeout(() => {
        const costs = calculateCost(mockBookingDetails);
        setBookingDetails({ ...mockBookingDetails, ...costs });
        setLoading(false);
      }, 500);
    };
    fetchBookingDetails();
  }, [bookingId]);

  // Xử lý thanh toán và xuất hóa đơn
  const handlePayment = async () => {
    try {
      const guestInfo = await form.validateFields();
      // 1. Giả lập gửi thông tin thanh toán lên server
      // await apiClient.post('/payments', { booking_id: bookingId, ... });

      // 2. Chuẩn bị dữ liệu cho hóa đơn
      const finalInvoiceData = {
        ...guestInfo,
        ...bookingDetails,
        invoiceNumber: `HD-${Date.now()}`,
        issueDate: dayjs().format("DD/MM/YYYY"),
      };
      setInvoiceData(finalInvoiceData);

      // 3. Hiển thị modal hóa đơn
      setIsInvoiceVisible(true);
      message.success("Thanh toán thành công!");
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin khách hàng!");
    }
  };

  const handleCloseInvoice = () => {
    setIsInvoiceVisible(false);
  };

  const value = {
    loading,
    bookingDetails,
    form,
    handlePayment,
    isInvoiceVisible,
    invoiceData,
    handleCloseInvoice,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
