// File path: src/pages/AddRoomTypePage.jsx
import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Checkbox,
  Button,
  Typography,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
// Chú ý đường dẫn import này! Nó đi ra khỏi thư mục 'pages' rồi vào thư mục 'contexts'
import { useRoomTypeList } from "../contexts/RoomTypeListContext";
import "../css/AddRoomTypePage.css"; // Import file CSS

const { Title, Text } = Typography;

const AddRoomTypePage = () => {
  const [form] = Form.useForm();
  const { handleAdd } = useRoomTypeList();

  const handleSubmit = (values) => {
    handleAdd({
      ...values,
      price: values.price_per_night,
      // amenities_id: ... nếu cần
    });
    form.resetFields();
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div className="add-room-type-page">
      <div className="top-button-container">
        <Button className="primary-button" icon={<PlusOutlined />} size="large">
          THÊM LOẠI PHÒNG
        </Button>
      </div>

      <div className="form-container">
        <Title level={2} className="page-title">
          THÊM LOẠI PHÒNG
        </Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={32}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={<Text className="form-item-label">Tên loại Phòng</Text>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên loại phòng!",
                  },
                ]}
              >
                <Input
                  placeholder="VD: Phòng Superior Hướng Biển"
                  className="custom-input"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capacity"
                label={<Text className="form-item-label">Sức chứa tối đa</Text>}
                rules={[{ required: true, message: "Vui lòng nhập sức chứa!" }]}
              >
                <InputNumber
                  min={1}
                  className="custom-input"
                  placeholder="VD: 2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={32} align="bottom">
            <Col span={16}>
              <Form.Item
                name="description"
                label={<Text className="form-item-label">Mô tả</Text>}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Mô tả chi tiết về loại phòng..."
                  className="custom-textarea"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price_per_night"
                label={
                  <Text className="form-item-label">Giá cơ bản (VNĐ):</Text>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập giá cơ bản!" },
                ]}
              >
                <InputNumber
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  className="custom-input"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="amenities"
            label={<Text className="form-item-label">Các tiện nghi:</Text>}
          >
            <Checkbox.Group className="amenities-group">
              <Row gutter={[8, 12]}>
                <Col span={8}>
                  <Checkbox value="wifi">Wifi miễn phí</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="ac">Điều hòa</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="tv">Tivi LCD</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="pool">Bể bơi</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="gym">Gym</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="bathtub">Bồn tắm</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="parking">Bãi đậu xe</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <div className="form-actions">
            <Button
              className="secondary-button"
              size="large"
              onClick={handleReset}
            >
              HỦY
            </Button>
            <Button
              className="primary-button"
              type="primary"
              htmlType="submit"
              size="large"
            >
              LƯU
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddRoomTypePage;
