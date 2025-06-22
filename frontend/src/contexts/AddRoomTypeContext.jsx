// File path: src/contexts/AddRoomTypeContext.jsx
import React, { createContext, useContext } from "react";
import { Form, message } from "antd";

const AddRoomTypeContext = createContext();

export const AddRoomTypeProvider = ({ children }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Submitting new room type:", values);
    message.success("Thêm loại phòng thành công!");
    form.resetFields();
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Đã hủy thao tác.");
  };

  const value = {
    form,
    handleSubmit,
    handleReset,
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
