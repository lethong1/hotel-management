// File: src/contexts/AmenityContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../../api/apiClient";

const AmenityContext = createContext();

export const AmenityProvider = ({ children }) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho việc thêm mới trực tiếp (inline)
  const [newAmenity, setNewAmenity] = useState({ name: "", description: "" });

  // State cho việc sửa trong Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [form] = Form.useForm();

  // Tải dữ liệu ban đầu từ API
  useEffect(() => {
    fetchAmenities();
    // eslint-disable-next-line
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/amenities/");
      setAmenities(
        Array.isArray(res.data)
          ? res.data.map((item) => ({ ...item, key: item.id }))
          : []
      );
    } catch (err) {
      setError("Không thể tải danh sách tiện nghi!");
      message.error("Không thể tải danh sách tiện nghi!");
    }
    setLoading(false);
  };

  // Thêm tiện nghi mới
  const handleInlineAdd = async () => {
    if (!newAmenity.name.trim()) {
      message.error("Vui lòng nhập tên tiện nghi!");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post("/amenities/", newAmenity);
      setAmenities((prev) => [...prev, { ...res.data, key: res.data.id }]);
      setNewAmenity({ name: "", description: "" });
      message.success("Đã thêm tiện nghi mới!");
    } catch (err) {
      message.error("Thêm tiện nghi thất bại!");
    }
    setLoading(false);
  };

  // Xóa tiện nghi
  const handleDelete = (amenity) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa tiện nghi này?",
      content: `Tiện nghi: "${amenity.name}"`,
      okText: "Xóa",
      onOk: async () => {
        setLoading(true);
        try {
          await apiClient.delete(`/amenities/${amenity.id}/`);
          setAmenities((prev) => prev.filter((item) => item.id !== amenity.id));
          message.success("Đã xóa tiện nghi!");
        } catch (err) {
          message.error("Xóa tiện nghi thất bại!");
        }
        setLoading(false);
      },
    });
  };

  // Sửa tiện nghi (dùng Modal)
  const showEditModal = (amenity) => {
    setEditingAmenity(amenity);
    form.setFieldsValue(amenity);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingAmenity(null);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await apiClient.put(
        `/amenities/${editingAmenity.id}/`,
        values
      );
      setAmenities((prev) =>
        prev.map((item) =>
          item.id === editingAmenity.id ? { ...item, ...res.data } : item
        )
      );
      message.success("Cập nhật tiện nghi thành công!");
      handleCancelModal();
    } catch (error) {
      message.error("Cập nhật tiện nghi thất bại!");
    }
    setLoading(false);
  };

  const value = {
    amenities,
    loading,
    error,
    newAmenity,
    setNewAmenity,
    handleInlineAdd,
    handleDelete,
    showEditModal,
    // Props cho Modal
    isModalVisible,
    handleCancelModal,
    handleUpdate,
    form,
  };

  return (
    <AmenityContext.Provider value={value}>{children}</AmenityContext.Provider>
  );
};

export const useAmenity = () => {
  const context = useContext(AmenityContext);
  if (!context) {
    throw new Error("useAmenity must be used within an AmenityProvider");
  }
  return context;
};
