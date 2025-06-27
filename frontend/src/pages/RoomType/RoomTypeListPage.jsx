// File: src/pages/RoomTypeListPage.jsx

import React from "react";
import {
  Table,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRoomTypeList } from "../../contexts/RoomType/RoomTypeListContext";
import "../../css/RoomType/RoomTypeListPage.css";
const { Title, Text } = Typography;

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const RoomTypeListPage = () => {
  const navigate = useNavigate();
  const {
    roomTypes,
    amenities,
    loading,
    handleDelete,
    showEditModal,
    isModalVisible,
    handleCancelModal,
    handleUpdate,
    form,
  } = useRoomTypeList();

  const palette = {
    primary: "#BBD38B",
    pageBackground: "#F7F6E7",
    border: "#DFDDC5",
    tableHeaderBg: "#E9E8DA",
    actionBlue: "#2563EB",
  };

  // CSS cho bảng
  const tableStyles = `
        .custom-table .ant-table-thead > tr > th { background-color: ${palette.tableHeaderBg} !important; font-weight: 600; }
        .action-link { color: #333; font-weight: 500; }
        .delete-link { color: ${palette.actionBlue}; font-weight: 500; }
    `;

  const columns = [
    { title: "Tên loại phòng", dataIndex: "name", key: "name", width: "25%" },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      align: "center",
    },
    {
      title: "Giá cơ bản",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: formatCurrency,
    },
    {
      title: "Tiện nghi",
      dataIndex: "amenities",
      key: "amenities",
      render: (amenities) => {
        if (!Array.isArray(amenities)) return "";
        return amenities.join(", ");
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <a className="action-link" onClick={() => showEditModal(record)}>
            SỬA
          </a>
          <a className="delete-link" onClick={() => handleDelete(record)}>
            XÓA
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div className="room-type-list-page">
      <style>{tableStyles}</style>
      <div
        style={{
          backgroundColor: palette.pageBackground,
          minHeight: "100vh",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button
            icon={<PlusOutlined />}
            size="large"
            style={{
              backgroundColor: palette.primary,
              borderColor: palette.primary,
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
            }}
            onClick={() => navigate("/dashboard/add-room-type")}
          >
            THÊM LOẠI PHÒNG
          </Button>
        </div>

        <div className="custom-table">
          <Table
            columns={columns}
            dataSource={roomTypes}
            rowKey="key"
            loading={loading}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </div>
      </div>

      <Modal
        title="Chỉnh sửa loại phòng"
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancelModal}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên loại Phòng"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức chứa tối đa"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá cơ bản (VNĐ)"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item name="amenities" label="Các tiện nghi">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row>
                {amenities.map((amenity) => (
                  <Col span={8} key={amenity.id}>
                    <Checkbox value={amenity.id}>{amenity.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomTypeListPage;
