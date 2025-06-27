// File path: src/contexts/AddRoomTypeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Form, message } from "antd";
import apiClient from "../../api/apiClient";

const AddRoomTypeContext = createContext();

export const AddRoomTypeProvider = ({ children }) => {
  const [form] = Form.useForm();
  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);

  // Fetch amenities từ API khi mount
  useEffect(() => {
    const fetchAmenities = async () => {
      setLoadingAmenities(true);
      try {
        const res = await apiClient.get("/amenities/");
        setAmenities(res.data); // [{id, name}, ...]
      } catch (err) {
        setAmenities([]);
      }
      setLoadingAmenities(false);
    };
    fetchAmenities();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Đảm bảo amenities là mảng, price là số
      const payload = {
        name: values.name,
        capacity: values.capacity,
        description: values.description,
        price_per_night: Number(values.price),
        amenities_id: Array.isArray(values.amenities) ? values.amenities : [],
      };
      await apiClient.post("/room-types/", payload);
      message.success("Thêm loại phòng thành công!");
      form.resetFields();
    } catch (err) {
      message.error("Thêm loại phòng thất bại!");
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Đã hủy thao tác.");
  };

  const value = {
    form,
    handleSubmit,
    handleReset,
    amenities,
    loadingAmenities,
  };

  return (
    <AddRoomTypeContext.Provider value={value}>
      {children}
    </AddRoomTypeContext.Provider>
  );
};

export const useAddRoomType = () => {
  const context = useContext(AddRoomTypeContext);
  if (context === undefined) {
    throw new Error("useAddRoomType must be used within a AddRoomTypeProvider");
  }
  return context;
};
