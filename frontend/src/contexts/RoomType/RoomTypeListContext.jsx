
import React, { createContext, useState, useContext, useEffect } from "react";
import { Form, Modal, message } from "antd";
import apiClient from "../../api/apiClient";



const RoomTypeListContext = createContext();

export const RoomTypeListProvider = ({ children }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();


  useEffect(() => {
    fetchRoomTypes();
    fetchAmenities();
  }, []);


  const fetchAmenities = async () => {
    try {
      const res = await apiClient.get("/amenities/");
      const amenitiesData = Array.isArray(res.data)
        ? res.data.map((amenity) => ({
            id: amenity.id,
            name: amenity.name,
            description: amenity.description,
            icon_class: amenity.icon_class,
          }))
        : [];
      setAmenities(amenitiesData);
    } catch (err) {
      message.error("Không thể tải danh sách tiện nghi!");
    }
  };

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/room-types/");

      const data = Array.isArray(res.data)
        ? res.data.map((type) => ({
            key: type.id,
            name: type.name,
            capacity: type.capacity,
            description: type.description,
            price: parseFloat(type.price_per_night) || 0,
            amenities: Array.isArray(type.amenities)
              ? type.amenities.map((a) => a.name)
              : [],
            raw: type,
          }))
        : [];
      setRoomTypes(data);
    } catch (err) {
      message.error("Không thể tải danh sách loại phòng!");
    }
    setLoading(false);
  };


  const handleDelete = (record) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa?",
      content: `Xóa loại phòng: "${record.name}"`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await apiClient.delete(`/room-types/${record.key}/`);
          message.success(`Đã xóa "${record.name}"`);
          fetchRoomTypes();
        } catch {
          message.error("Xóa loại phòng thất bại!");
        }
      },
    });
  };


  const showEditModal = (record) => {
    setEditingRecord(record);

    const selectedAmenityIds = record.raw.amenities
      ? record.raw.amenities.map((amenity) => amenity.id)
      : [];

    form.setFieldsValue({
      name: record.name,
      capacity: record.capacity,
      description: record.description,
      price: record.price,
      amenities: [record.raw.amenities?.map((a) => a.id)],
    });
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        capacity: values.capacity,
        description: values.description,
        price_per_night: values.price,
        amenities_id: Array.isArray(values.amenities) ? values.amenities : [],
      };

      await apiClient.put(`/room-types/${editingRecord.key}/`, payload);
      message.success("Cập nhật thành công!");
      handleCancelModal();
      fetchRoomTypes();
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  // Thêm loại phòng mới
  const handleAdd = async (values) => {
    try {
      const payload = {
        name: values.name,
        capacity: values.capacity,
        description: values.description,
        price_per_night: values.price,
        amenities_id: Array.isArray(values.amenities) ? values.amenities : [],
      };

      await apiClient.post("/room-types/", payload);
      message.success("Thêm loại phòng thành công!");
      fetchRoomTypes();
    } catch (err) {
      console.error(err.response?.data || err);
      message.error("Thêm loại phòng thất bại!");
    }
  };

  const value = {
    roomTypes,
    amenities,
    loading,
    handleDelete,
    showEditModal,
    isModalVisible,
    handleCancelModal,
    handleUpdate,
    editingRecord,
    form,
    handleAdd,
  };

  return (
    <RoomTypeListContext.Provider value={value}>
      {children}
    </RoomTypeListContext.Provider>
  );
};

export const useRoomTypeList = () => {
  const context = useContext(RoomTypeListContext);
  if (!context) {
    throw new Error(
      "useRoomTypeList must be used within a RoomTypeListProvider"
    );
  }
  return context;
};
