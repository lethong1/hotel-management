import React, { useEffect } from "react";
import { Button, Typography, Space, Modal, Form, Input, Spin } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useAmenity } from "../contexts/AmenityContext";

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

  const styles = `
  .amenity-grid {
    border: 1px solid var(--border-color);
    border-radius: 0;
    font-family: 'Inter', sans-serif;
    background: var(--form-background);
  }

  .amenity-row {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s ease;
  }

  .amenity-row:hover {
    background-color: #f3f4ef;
  }

  .amenity-row:last-child {
    border-bottom: none;
  }

  .amenity-header {
    background-color: #e9e8da;
    font-weight: 600;
  }

  .amenity-cell {
    padding: 14px 18px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    font-size: 15px;
    background-color: var(--form-background);
  }

  .amenity-cell-name {
    flex: 1;
    border-right: 1px solid var(--border-color);
    font-weight: 500;
  }

  .amenity-cell-desc {
    flex: 2;
    border-right: 1px solid var(--border-color);
    font-style: italic;
    color: var(--text-color);
  }

  .amenity-cell-actions {
    width: 150px;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .amenity-cell-actions:last-child {
    border-right: none;
  }

  .inline-input {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-color);
    background-color: #f9fafb;
    transition: border 0.2s ease;
  }

  .inline-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(187, 211, 139, 0.2);
  }

  .action-link-edit {
    color: #333;
    font-weight: 500;
  }

  .action-link-delete {
    color: #2563eb;
    font-weight: 500;
  }
`;

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
    <>
      <style>{styles}</style>
      <div
        style={{
          backgroundColor: palette.pageBackground,
          minHeight: "100vh",
          padding: "24px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Title level={3} style={{ margin: 0, color: "#2c3e50" }}>
            Quản lý Tiện Nghi
          </Title>
          <Button
            icon={<PlusOutlined />}
            size="large"
            style={{
              backgroundColor: palette.primary,
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              boxShadow: "0 2px 6px rgba(52, 152, 219, 0.2)",
            }}
            onClick={handleInlineAdd}
          >
            THÊM TIỆN NGHI
          </Button>
        </div>

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
    </>
  );
};

export default AmenityManagementPage;
