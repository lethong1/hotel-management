import React from "react";
import { Modal, Form, Select, DatePicker, Input, Radio } from "antd";
import { useBooking } from "../contexts/BookingContext";

const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingModal = () => {
  const {
    form,
    isBookingModalVisible,
    handleCancelModal,
    handleFormSubmit,
    editingBooking,
    customers,
    rooms,
  } = useBooking();

  const isNewCustomer = Form.useWatch("isNewCustomer", form); // Theo dõi giá trị chọn khách mới/cũ

  return (
    <Modal
      title={editingBooking ? "Chỉnh sửa Đặt phòng" : "Tạo Đơn đặt phòng mới"}
      open={isBookingModalVisible}
      onCancel={handleCancelModal}
      onOk={handleFormSubmit}
      okText={editingBooking ? "Cập nhật" : "Tạo"}
      cancelText="Hủy"
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isNewCustomer: false }}
      >
        <Form.Item name="isNewCustomer" label="Hình thức khách hàng">
          <Radio.Group
            onChange={(e) =>
              form.setFieldValue("isNewCustomer", e.target.value)
            }
          >
            <Radio value={false}>Khách hàng cũ</Radio>
            <Radio value={true}>Khách hàng mới</Radio>
          </Radio.Group>
        </Form.Item>

        {isNewCustomer ? (
          <>
            <Form.Item
              name="full_name"
              label="Họ tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="id_card_number"
              label="CCCD"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone_number"
              label="Số điện thoại"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="customer_id"
            label="Chọn khách hàng"
            rules={[{ required: true }]}
          >
            <Select showSearch placeholder="Tìm và chọn khách hàng">
              {customers.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.full_name} - {c.phone_number}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="room_id"
          label="Chọn phòng"
          rules={[{ required: true }]}
        >
          <Select showSearch placeholder="Tìm và chọn phòng">
            {rooms
              .filter(
                (r) =>
                  r.status === "available" || r.id === editingBooking?.room.id
              )
              .map((r) => (
                <Option key={r.id} value={r.id}>
                  Phòng {r.room_number} ({r.room_type.name})
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="booking_dates"
          label="Ngày nhận - trả phòng"
          rules={[{ required: true }]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái" initialValue="confirmed">
          <Select>
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="checked_in">Đã nhận phòng</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingModal;
