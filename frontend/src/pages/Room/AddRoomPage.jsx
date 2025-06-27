// AddRoomPage.js
import React from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Typography,
  Row,
  Col,
  notification,
  Spin,
} from "antd";
import {
  PlusOutlined,
  CheckCircleFilled,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAddRoom } from "../../contexts/Room/AddRoomContext"; // Import hook
import "../../css/Room/AddRoomPage.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Hàm định dạng tiền tệ cho đẹp
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const AddRoomPageStyled = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Lấy state và functions từ Context
  const {
    roomTypeId,
    roomDetails,
    selectedAmenities,
    handleRoomTypeChange,
    handleAmenitiesChange,
    addRoom,
    loading,
    roomTypes, // Lấy danh sách loại phòng
    loadingInitialData, // Lấy trạng thái loading ban đầu
  } = useAddRoom();

  // Lấy danh sách tiện nghi của loại phòng đã chọn
  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId);
  const amenities = selectedRoomType?.amenities || [];

  const onFinish = async (values) => {
    try {
      await addRoom(values); // `values` chứa dữ liệu từ Form Ant Design
      notification.success({
        message: "Thành công",
        description: "Đã thêm phòng mới thành công!",
        placement: "topRight",
      });
      form.resetFields(); // Reset form sau khi thành công
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể thêm phòng. Vui lòng thử lại.",
        placement: "topRight",
      });
    }
  };

  // Hiển thị loading nếu chưa tải xong dữ liệu ban đầu
  if (loadingInitialData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="add-room-page">
      {/* Nút Tạo Phòng ở góc trên */}
      <div className="top-button-container">
        <Button
          icon={<PlusOutlined />}
          size="large"
          className="primary-action-btn"
        >
          Tạo Phòng
        </Button>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <Title level={2} className="page-title">
          THÊM PHÒNG MỚI
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={32}>
            {/* Cột trái */}
            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="roomNumber"
                    label={<Text className="form-item-label">Số Phòng</Text>}
                  >
                    <Input placeholder="VD: 306" className="custom-input" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="roomType"
                    label={<Text className="form-item-label">Loại Phòng</Text>}
                  >
                    <Select
                      placeholder="Chọn loại phòng"
                      className="custom-select"
                      onChange={handleRoomTypeChange}
                      value={roomTypeId} // Giờ value là ID
                    >
                      {roomTypes.map((option) => (
                        <Option key={option.id} value={option.id}>
                          {option.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="floor"
                    label={<Text className="form-item-label">Tầng</Text>}
                  >
                    <Select placeholder="Tầng" className="custom-select">
                      <Option value="1">1</Option>
                      <Option value="2">2</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label={<Text className="form-item-label">Mô tả/ ghi chú:</Text>}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập mô tả hoặc ghi chú."
                  className="custom-textarea"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label={<Text className="form-item-label">Trạng thái</Text>}
                  >
                    <Select placeholder="Trạng thái" className="custom-select">
                      <Option value="available">Phòng trống</Option>
                      <Option value="occupied">Đang ở</Option>
                      <Option value="maintenance">Đang sửa chữa</Option>
                      <Option value="cleaning">Đang chờ dọn</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Text className="form-item-label">Giá cơ bản (VND):</Text>
                    }
                  >
                    {/* HIỂN THỊ GIÁ TỪ CONTEXT */}
                    <Text className="price-display">
                      {formatCurrency(roomDetails.totalPrice)}
                    </Text>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Cột phải */}
            <Col xs={24} md={8}>
              <div className="capacity-container">
                <Text className="form-item-label">Sức chứa tối đa:</Text>
                {/* HIỂN THỊ SỨC CHỨA TỪ CONTEXT */}
                <div className="capacity-details">
                  <Text>{roomDetails.capacity} người</Text>
                </div>
              </div>

              <Form.Item
                label={
                  <Text className="form-item-label">Danh sách tiện nghi:</Text>
                }
              >
                <div style={{ minHeight: 40 }}>
                  {roomTypeId && amenities.length > 0 ? (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {amenities.map((amenity) => (
                        <li
                          key={amenity.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ color: "#52c41a", marginRight: 8 }}>
                            <CheckOutlined
                              style={{ fontSize: 18, color: "#52c41a" }}
                            />
                          </span>
                          <span>{amenity.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : roomTypeId && amenities.length === 0 ? (
                    <span style={{ color: "#888" }}>
                      Loại phòng này chưa có tiện nghi nào.
                    </span>
                  ) : (
                    <span style={{ color: "#888" }}>
                      Vui lòng chọn loại phòng để xem tiện nghi.
                    </span>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>

          {/* Nút hành động */}
          <div className="action-buttons">
            <Button
              onClick={() => navigate("/dashboard/room-list")}
              size="large"
              className="cancel-btn"
            >
              HỦY
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="primary-action-btn"
              loading={loading}
            >
              {loading ? "Đang lưu..." : "LƯU"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddRoomPageStyled;
