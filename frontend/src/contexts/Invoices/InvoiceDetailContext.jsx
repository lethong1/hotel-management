
import React, { createContext, useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import apiClient from "../../api/apiClient";

// Context
const InvoiceDetailContext = createContext();

export const InvoiceDetailProvider = ({ children }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { invoiceId } = useParams();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/invoices/${invoiceId}/`);
        setInvoiceData(response.data);
      } catch (error) {
        
        if (error.response?.status === 403) {
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
    setInvoiceData,
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
