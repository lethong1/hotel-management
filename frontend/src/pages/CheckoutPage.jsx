// File: src/pages/CheckoutPage.jsx

import React, { useRef, useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Radio,
  Spin,
  Modal,
} from "antd";
import { useCheckout } from "../contexts/CheckoutContext";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/apiClient";



const { Title, Text } = Typography;

                                                                                             

// Component Hóa đơn để in
const InvoiceComponent = React.forwardRef(({ invoiceData }, ref) => {
  if (!invoiceData) return null;
  const { roomCost, vat, total, numberOfNights } = invoiceData;
  return (
    <div ref={ref} style={{ padding: "20px", color: "#000" }}>
      <Title level={3} style={{ textAlign: "center" }}>
        HÓA ĐƠN THANH TOÁN
      </Title>
      <Row justify="space-between">
        <Col>
          <Text strong>Khách sạn ABC</Text>
          <br />
          Địa chỉ: 123 Đường XYZ, Quận 1, TP.HCM
        </Col>
        <Col style={{ textAlign: "right" }}>
          <Text strong>Hóa đơn số:</Text> {invoiceData.invoiceNumber}
          <br />
          <Text strong>Ngày xuất:</Text> {invoiceData.issueDate}
        </Col>
      </Row>
      <hr style={{ margin: "20px 0" }} />
      <Title level={5}>Thông tin khách hàng:</Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Họ và tên">
          {invoiceData.guestName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {invoiceData.guestPhone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {invoiceData.guestEmail}
        </Descriptions.Item>
      </Descriptions>
      <Title level={5} style={{ marginTop: 20 }}>
        Chi tiết đặt phòng:
      </Title>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Phòng">
          {invoiceData.room.roomNumber} ({invoiceData.room.roomType})
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian">
          {dayjs(invoiceData.checkInDate).format("DD/MM/YYYY")} -{" "}
          {dayjs(invoiceData.checkOutDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
      </Descriptions>
      <Title level={5} style={{ marginTop: 20 }}>
        Chi tiết thanh toán:
      </Title>
      <Table
        dataSource={[
          {
            key: "1",
            item: `Đơn giá phòng x ${numberOfNights} đêm`,
            amount: roomCost,
          },
          { key: "2", item: "Thuế VAT (8%)", amount: vat },
        ]}
        columns={[
          { title: "Diễn giải", dataIndex: "item", key: "item" },
          {
            title: "Thành tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (val) => `${val.toLocaleString("vi-VN")} VNĐ`,
          },
        ]}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <Text strong>TỔNG CỘNG</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <Text strong>{total.toLocaleString("vi-VN")} VNĐ</Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Text>Cảm ơn quý khách và hẹn gặp lại!</Text>
      </div>
    </div>
  );
});

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (bookingId) {
      apiClient.get(`/bookings/${bookingId}/`).then(res => setBooking(res.data));
    }
  }, [bookingId]); 
  const {
    loading,
    bookingDetails,
    form,
    handlePayment,
    isInvoiceVisible,
    invoiceData,
    handleCloseInvoice,
  } = useCheckout();
  const invoiceRef = useRef();
  const handlePrint = useReactToPrint({ content: () => invoiceRef.current });

  if (loading)
    return (
      <Spin
        size="large"
        style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
      />
    );
  if (!bookingDetails)
    return (
      <Title level={3} style={{ textAlign: "center" }}>
        Không tìm thấy thông tin đặt phòng.
      </Title>
    );

  return (
    <div style={{ background: "#F7F6E7", padding: "40px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
        Thanh toán & Xuất hóa đơn
      </Title>
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Title level={4}>Thông tin khách hàng</Title>
          <Form form={form} layout="vertical">
            <Form.Item
              name="guestName"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="guestPhone"
              label="Số điện thoại"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="guestEmail"
              label="Email"
              rules={[{ type: "email" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              initialValue="cash"
            >
              <Radio.Group>
                <Radio value="cash">Tiền mặt</Radio>
                <Radio value="transfer">Chuyển khoản</Radio>
                <Radio value="card">Thẻ tín dụng</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Tóm tắt đơn đặt phòng">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Phòng">
                {bookingDetails.room.roomNumber} ({bookingDetails.room.roomType}
                )
              </Descriptions.Item>
              <Descriptions.Item label="Nhận phòng">
                {dayjs(bookingDetails.checkInDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Trả phòng">
                {dayjs(bookingDetails.checkOutDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Số đêm">
                {bookingDetails.numberOfNights}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền phòng">
                {bookingDetails.roomCost.toLocaleString("vi-VN")} VNĐ
              </Descriptions.Item>
              <Descriptions.Item label="VAT (8%)">
                {bookingDetails.vat.toLocaleString("vi-VN")} VNĐ
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Tổng cộng</Text>}>
                <Text strong style={{ color: "#cf1322" }}>
                  {bookingDetails.total.toLocaleString("vi-VN")} VNĐ
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 40 }}>
        <Button
          type="primary"
          size="large"
          onClick={handlePayment}
          style={{ backgroundColor: "#BBD38B", borderColor: "#BBD38B" }}
        >
          Xác nhận Thanh toán & Xuất hóa đơn
        </Button>
      </Row>

      {/* Modal Hóa đơn */}
      <Modal
        open={isInvoiceVisible}
        onCancel={handleCloseInvoice}
        width={800}
        title="Hóa đơn"
        footer={[
          <Button key="close" onClick={handleCloseInvoice}>
            Đóng
          </Button>,
          <Button key="print" type="primary" onClick={handlePrint}>
            In hóa đơn
          </Button>,
        ]}
      >
        <InvoiceComponent invoiceData={invoiceData} ref={invoiceRef} />
      </Modal>
    </div>
  );
};

export default CheckoutPage;
