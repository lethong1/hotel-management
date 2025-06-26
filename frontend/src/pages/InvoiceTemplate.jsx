// File: src/components/InvoiceTemplate.jsx

import React from "react";
import { Typography, Row, Col, Descriptions, Table, Tag } from "antd";
import dayjs from "dayjs";
import { formatCurrency, formatVNDateTime } from "../utils/Formatter";

const { Title, Text } = Typography;

// Hàm render tag màu cho trạng thái hóa đơn
const renderInvoiceStatusTag = (status) => {
  switch (status) {
    case "paid":
      return <Tag color="success">ĐÃ THANH TOÁN</Tag>;
    case "pending":
      return <Tag color="warning">CHỜ THANH TOÁN</Tag>;
    case "cancelled":
      return <Tag color="error">ĐÃ HỦY</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const InvoiceTemplate = React.forwardRef(({ invoiceData }, ref) => {
  if (!invoiceData) return null;

  // Tính toán chi phí từ dữ liệu thực tế
  const numberOfNights =
    dayjs(invoiceData.booking?.check_out_date).diff(
      dayjs(invoiceData.booking?.check_in_date),
      "day"
    ) || 1;
  const roomCost = parseFloat(invoiceData.booking?.total_price) || 0;
  const vat = roomCost * 0.08;
  const total = roomCost + vat;

  return (
    <div
      ref={ref}
      style={{ padding: "30px", color: "#000", background: "#fff" }}
    >
      {/* --- Header --- */}
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ color: "#333", marginBottom: 0 }}>
            HÓA ĐƠN THANH TOÁN
          </Title>
          <div>{renderInvoiceStatusTag(invoiceData.status)}</div>
        </Col>
        <Col style={{ textAlign: "right" }}>
          <Text strong>Khách sạn ABC</Text>
          <br />
          Địa chỉ: 123 Đường XYZ, Quận 1, TP.HCM
        </Col>
      </Row>
      <hr
        style={{
          margin: "20px 0",
          border: "none",
          borderTop: "1px solid #eee",
        }}
      />

      {/* --- Thông tin chung --- */}
      <Descriptions
        bordered
        column={2}
        size="small"
        style={{ marginBottom: 20 }}
      >
        <Descriptions.Item label="Số HĐ">
          {invoiceData.invoice_number}
        </Descriptions.Item>
        <Descriptions.Item label="Người tạo">
          {invoiceData.created_by?.username || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày xuất HĐ">
          {formatVNDateTime(invoiceData.issue_date)}
        </Descriptions.Item>
        <Descriptions.Item label="Hạn thanh toán">
          {formatVNDateTime(invoiceData.due_date)}
        </Descriptions.Item>
      </Descriptions>

      {/* --- Thông tin khách hàng & phòng --- */}
      <Row gutter={32}>
        <Col span={12}>
          <Title level={5}>Thông tin khách hàng:</Title>
          <Text>
            <strong>Họ tên:</strong> {invoiceData.booking?.customer?.full_name}
          </Text>
          <br />
          <Text>
            <strong>SĐT:</strong> {invoiceData.booking?.customer?.phone_number}
          </Text>
          <br />
          <Text>
            <strong>Email:</strong> {invoiceData.booking?.customer?.email}
          </Text>
          <br />
          <Text>
            <strong>CCCD:</strong>{" "}
            {invoiceData.booking?.customer?.id_card_number}
          </Text>
          <br />
          <Text>
            <strong>Địa chỉ:</strong> {invoiceData.booking?.customer?.address}
          </Text>
        </Col>
        <Col span={12}>
          <Title level={5}>Chi tiết đặt phòng:</Title>
          <Text>
            <strong>Phòng:</strong> {invoiceData.booking?.room?.room_number} (
            {invoiceData.booking?.room?.room_type?.name})
          </Text>
          <br />
          <Text>
            <strong>Nhận phòng:</strong>{" "}
            {formatVNDateTime(invoiceData.booking?.check_in_date)}
          </Text>
          <br />
          <Text>
            <strong>Trả phòng:</strong>{" "}
            {formatVNDateTime(invoiceData.booking?.check_out_date)}
          </Text>
          <br />
          <Text>
            <strong>Số đêm:</strong> {numberOfNights} đêm
          </Text>
          <br />
          <Text>
            <strong>Đơn giá:</strong>{" "}
            {formatCurrency(
              invoiceData.booking?.room?.room_type?.price_per_night
            )}
          </Text>
        </Col>
      </Row>

      {/* --- Chi tiết thanh toán --- */}
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
            render: (val) => formatCurrency(val),
          },
        ]}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <Text strong>TỔNG CỘNG</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <Text strong style={{ color: "#cf1322", fontSize: "16px" }}>
                {formatCurrency(total)}
              </Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      {/* --- Ghi chú & Footer --- */}
      {invoiceData.notes && (
        <div style={{ marginTop: 20 }}>
          <Text strong>Ghi chú:</Text>
          <p
            style={{
              border: "1px solid #eee",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {invoiceData.notes}
          </p>
        </div>
      )}
      <div
        style={{
          textAlign: "center",
          marginTop: 40,
          borderTop: "1px solid #eee",
          paddingTop: 20,
        }}
      >
        <Text italic>Cảm ơn quý khách và hẹn gặp lại!</Text>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
