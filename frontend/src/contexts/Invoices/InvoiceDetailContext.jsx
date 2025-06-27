// File: src/contexts/InvoiceDetailContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import apiClient from "../../api/apiClient";

const InvoiceDetailContext = createContext();

export const InvoiceDetailProvider = ({ children }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { invoiceId } = useParams();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setLoading(true);
      try {
        // Debug user info
        const userInfo = localStorage.getItem('userInfo');
        console.log("🔍 User info:", userInfo ? JSON.parse(userInfo) : 'No user info');
        
        const response = await apiClient.get(`/invoices/${invoiceId}/`);
        console.log("🔍 Invoice API Response:", response.data);
        console.log("🔍 Created by data:", response.data.created_by);
        console.log("🔍 Booking created by:", response.data.booking?.created_by);
        console.log("🔍 Current user ID from token:", JSON.parse(userInfo || '{}').id);
        setInvoiceData(response.data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        console.error("Error response:", error.response);
        
        // Debug permission error
        if (error.response?.status === 403) {
          console.error("🔍 Permission denied - User doesn't have access to this invoice");
          message.error("Bạn không có quyền xem hóa đơn này!");
        } else {
          message.error("Không thể tải thông tin hóa đơn!");
        }
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoiceData();
    }
  }, [invoiceId]);

  const value = {
    loading,
    invoiceData,
    setInvoiceData, // Thêm setter để có thể cập nhật dữ liệu
  };

  return (
    <InvoiceDetailContext.Provider value={value}>
      {children}
    </InvoiceDetailContext.Provider>
  );
};

export const useInvoiceDetail = () => {
  const context = useContext(InvoiceDetailContext);
  if (!context) {
    throw new Error(
      "useInvoiceDetail must be used within an InvoiceDetailProvider"
    );
  }
  return context;
};
