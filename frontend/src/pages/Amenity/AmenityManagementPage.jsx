import React, { useEffect } from "react";
import { Button, Typography, Space, Modal, Form, Input, Spin } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useAmenity } from "../../contexts/Amenity/AmenityContext";
import "../../css/Amenity/AmenityManagementPage.css";

const { Title, Text } = Typography;

const AmenityManagementPage = () => {
  const {
    amenities,
    loading,
    newAmenity,
    setNewAmenity,
    handleInlineAdd,
    handleDelete,
    showEditModal,
    isModalVisible,
    handleCancelModal,
    handleUpdate,
    form,
  } = useAmenity();

  // Sử dụng palette màu đồng nhất với UserInfoPage
  const palette = {
    primary: "#bbd38b", // Màu chính (xanh dương)
    secondary: "#dfddc5", // Màu phụ (xanh lá)
    pageBackground: "#ffffff", // Màu nền trang
    cardBackground: "#ffffff", // Màu nền card
    border: "#dfddc5", // Màu viền
    headerBg: "#e9e8da", // Màu nền header
    text: "#333333", // Màu chữ chính
    textLight: "#333333", // Màu chữ phụ
    danger: "#2563eb", // Màu cảnh báo (đỏ)
    success: "#bbd38b", // Màu thành công (xanh lá đậm)
    info: "#bbd38b", // Màu thông tin (xanh dương đậm)
  };

  useEffect(() => {
    document.body.style.setProperty("--primary-color", palette.primary);
    document.body.style.setProperty(
      "--page-background",
      palette.pageBackground
    );
    document.body.style.setProperty("--border-color", palette.border);
    document.body.style.setProperty(
      "--form-background",
      palette.formBackground
    );
  }, [palette]);

  return (
    <div className="amenity-management-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      ></div>

      <div className="amenity-grid">
        {/* Header */}
        <div className="amenity-row amenity-header">
          <div className="amenity-cell amenity-cell-name">
            <Text strong style={{ color: "#2c3e50" }}>
              Tên Tiện Nghi
            </Text>
          </div>
          <div className="amenity-cell amenity-cell-desc">
            <Text strong style={{ color: "#2c3e50" }}>
              Mô tả
            </Text>
          </div>
          <div className="amenity-cell amenity-cell-actions">
            <Text strong style={{ color: "#2c3e50" }}>
              Hành động
            </Text>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          amenities.map((amenity) => (
            <div className="amenity-row" key={amenity.key}>
              <div className="amenity-cell amenity-cell-name">
                {amenity.name}
              </div>
              <div className="amenity-cell amenity-cell-desc">
                {amenity.description || (
                  <span style={{ color: "#95a5a6", fontStyle: "italic" }}>
                    Không có mô tả
                  </span>
                )}
              </div>
              <div className="amenity-cell amenity-cell-actions">
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(amenity)}
                    style={{ color: palette.info }}
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(amenity)}
                    style={{ color: palette.danger }}
                  />
                </Space>
              </div>
            </div>
          ))
        )}

        {/* Inline Add Row */}
        <div className="amenity-row" style={{ background: "#f8f9fa" }}>
          <div className="amenity-cell amenity-cell-name">
            <Input
              placeholder="Nhập tên tiện nghi"
              value={newAmenity.name}
              onChange={(e) =>
                setNewAmenity({ ...newAmenity, name: e.target.value })
              }
              className="inline-input"
            />
          </div>
          <div className="amenity-cell amenity-cell-desc">
            <Input
              placeholder="Nhập mô tả"
              value={newAmenity.description}
              onChange={(e) =>
                setNewAmenity({ ...newAmenity, description: e.target.value })
              }
              className="inline-input"
            />
          </div>
          <div className="amenity-cell amenity-cell-actions">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleInlineAdd}
              style={{
                backgroundColor: palette.success,
                borderColor: palette.success,
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Chỉnh sửa tiện nghi"
        visible={isModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancelModal}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnClose
        okButtonProps={{
          style: {
            backgroundColor: palette.primary,
            borderColor: palette.primary,
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên tiện nghi"
            rules={[{ required: true, message: "Vui lòng nhập tên tiện nghi" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AmenityManagementPage;
