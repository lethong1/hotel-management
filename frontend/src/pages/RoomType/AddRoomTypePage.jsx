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
import { useNavigate } from "react-router-dom";
import "../../css/RoomType/AddRoomTypePage.css";
import { useAddRoomType } from "../../contexts/RoomType/AddRoomTypeContext";
const { Title, Text } = Typography;

const AddRoomTypePage = () => {
  const navigate = useNavigate();
  const { form, handleSubmit, amenities, loadingAmenities } = useAddRoomType();



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
                name="price"
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
            <Checkbox.Group>
              <Row>
                {amenities.map((a) => (
                  <Col span={8} key={a.id}>
                    <Checkbox value={a.id}>{a.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <div className="form-actions">
            <Button
              className="secondary-button"
              size="large"
              onClick={() => navigate("/dashboard/room-type-list")}
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
