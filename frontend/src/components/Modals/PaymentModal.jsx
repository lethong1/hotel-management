import React, { useState } from "react";
import { Modal, Button, Space, Typography, message } from "antd";
import {
  BankOutlined,
  QrcodeOutlined,
  DollarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import apiClient from "../../api/apiClient";

const { Title, Text } = Typography;

const PaymentModal = ({ visible, onCancel, bookingId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handlePayment = async (method) => {
    setPaymentMethod(method);
    setLoading(true);

    try {
      switch (method) {
        case "cash":
          // Thanh toán tiền mặt - cập nhật trạng thái ngay lập tức
          await apiClient.post(`/bookings/${bookingId}/cash/payment/`);
          message.success("✅ Thanh toán tiền mặt thành công!");
          onSuccess();
          break;

        case "qr":
          // Thanh toán QR - tạo QR MOMO
          const qrResponse = await apiClient.post(`/bookings/${bookingId}/momo/create-payment/`);
          window.location.href = qrResponse.data.pay_url;
          break;

        case "bank":
          // Thanh toán ngân hàng - cũng dùng MOMO (thẻ ATM/Internet Banking)
          const bankResponse = await apiClient.post(`/bookings/${bookingId}/momo/create-payment/`, {
            payment_type: "bank"  // Thêm tham số để phân biệt loại thanh toán
          });
          window.location.href = bankResponse.data.pay_url;
          break;

        default:
          message.error("Phương thức thanh toán không hợp lệ!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error("Không thể thực hiện thanh toán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setPaymentMethod(null);
    }
  };

  const paymentMethods = [
    {
      key: "cash",
      title: "Tiền mặt",
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      description: "Thanh toán trực tiếp tại quầy",
      color: "#52c41a",
    },
    {
      key: "qr",
      title: "Mã QR",
      icon: <QrcodeOutlined style={{ fontSize: 24 }} />,
      description: "Quét mã QR qua ứng dụng MOMO",
      color: "#1890ff",
    },
    {
      key: "bank",
      title: "Ngân hàng",
      icon: <BankOutlined style={{ fontSize: 24 }} />,
      description: "Thanh toán qua thẻ ATM/Internet Banking (MOMO)",
      color: "#722ed1",
    },
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            Chọn phương thức thanh toán
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
    >
      <div style={{ padding: "20px 0" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {paymentMethods.map((method) => (
            <Button
              key={method.key}
              type="default"
              size="large"
              icon={loading && paymentMethod === method.key ? <LoadingOutlined /> : method.icon}
              onClick={() => handlePayment(method.key)}
              loading={loading && paymentMethod === method.key}
              disabled={loading}
              style={{
                width: "100%",
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 24px",
                borderColor: method.color,
                color: method.color,
              }}
            >
              <div style={{ textAlign: "left", marginLeft: 16 }}>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {method.title}
                </div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {method.description}
                </Text>
              </div>
            </Button>
          ))}
        </Space>
      </div>
    </Modal>
  );
};

export default PaymentModal; 