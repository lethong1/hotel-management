// File: src/contexts/CheckoutContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, message } from "antd";
import { useSearchParams } from "react-router-dom"; // Hook để lấy ID từ URL
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
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

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
    const fetchBooking = async (id) => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/bookings/${id}/`);
        const details = res.data;
        const costs = calculateCost(details);
        setBookingDetails({ ...details, ...costs });
      } catch (err) {
        setBookingDetails(null);
        // Có thể hiện message lỗi ở đây nếu muốn
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  // Xử lý thanh toán và xuất hóa đơn
  const handlePayment = async () => {
    try {
      const res = await apiClient.post('/bookings/vnpay/create-payment/', {
        booking_id: bookingDetails.id,
      });
      window.location.href = res.data.vnpay_url;  // chuyển thẳng đến VNPAY
    } catch (error) {
      message.error("Lỗi tạo URL thanh toán.");
      console.error(error);
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
