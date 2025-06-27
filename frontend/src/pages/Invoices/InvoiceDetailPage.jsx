import React, { useRef, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  InvoiceDetailProvider,
  useInvoiceDetail,
} from "../../contexts/Invoices/InvoiceDetailContext";
import { LoginContext } from "../../contexts/LoginUser/LoginConText";
import {
  Typography,
  Row,
  Col,
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Spin,
  message,
  Modal,
  Divider,
} from "antd";
import { useReactToPrint } from "react-to-print";
import {
  PrinterOutlined,
  PlusOutlined,
  CreditCardOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import InvoiceTemplate from "./InvoiceTemplate";
import PaymentModal from "../../components/Modals/PaymentModal";
import { formatCurrency, formatVNDateTime } from "../../utils/Formatter";
import "../../css/Invoices/InvoiceDetailPage.css";

const { Title, Text } = Typography;

// Component chính hiển thị chi tiết hóa đơn
const InvoiceDetailView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoiceData, loading } = useInvoiceDetail();
  const invoiceRef = useRef();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  
  // Lấy user info từ LoginContext
  const { authState } = useContext(LoginContext);
  const userInfo = authState.user;
  const userRole = userInfo?.role?.role;
  const userId = userInfo?.id;
  
  // Kiểm tra quyền
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';
  const isBookingCreator = invoiceData?.booking?.created_by?.id === userId;
  const hasPermission = isManagerOrAdmin || isBookingCreator;

  // Debug dữ liệu
  useEffect(() => {
    if (invoiceData) {
      console.log("🔍 Invoice Data in Component:", invoiceData);
      console.log("🔍 Created By:", invoiceData.created_by);
      console.log("🔍 Room Type:", invoiceData.booking?.room?.room_type);
      console.log("🔍 Price per night:", invoiceData.booking?.room?.room_type?.price_per_night);
      console.log("🔍 User Info from Context:", userInfo);
      console.log("🔍 User Role:", userRole);
      console.log("🔍 User ID:", userId);
      console.log("🔍 Has Permission:", hasPermission);
    }
  }, [invoiceData, userInfo, userRole, userId, hasPermission]);

  const handlePrint = useReactToPrint({ content: () => invoiceRef.current });

  const handlePayment = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    // Refresh lại dữ liệu hóa đơn
    window.location.reload();
  };

  const handleAddService = () => {
    message.info("Tính năng thêm dịch vụ sẽ được phát triển sau!");
  };

  const handleViewDetails = () => {
    // Chuyển về trang danh sách booking
    navigate("/dashboard/booking");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin hóa đơn...</div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={3}>Không tìm thấy hóa đơn</Title>
        <Button type="primary" onClick={() => navigate("/dashboard/booking")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Kiểm tra quyền truy cập
  if (!hasPermission) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={3}>Không có quyền truy cập</Title>
        <Text>Bạn không có quyền xem hóa đơn này.</Text>
        <br />
        <Button type="primary" onClick={() => navigate("/dashboard/booking")} style={{ marginTop: 16 }}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Tính toán chi phí
  const numberOfNights =
    dayjs(invoiceData.booking?.check_out_date).diff(
      dayjs(invoiceData.booking?.check_in_date),
      "day"
    ) || 1;
  const roomCost = parseFloat(invoiceData.booking?.total_price) || 0;
  const vat = roomCost * 0.08;
  const total = roomCost + vat;

  // Xác định trạng thái booking để hiển thị nút phù hợp
  const isCheckedIn = invoiceData.booking?.status === "checked_in";
  const isPaid = invoiceData.status === "paid";
  const isCheckedOut = invoiceData.booking?.status === "checked_out";

  return (
    <div className="invoice-detail-page">
      {/* Header */}
      <div className="invoice-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dashboard/booking")}
              style={{
                marginRight: 380,
                backgroundColor: "#cf1322",
                color: "white",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết Hóa đơn #{invoiceData.invoice_number}
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="action-button"
              >
                In hóa đơn
              </Button>
              {!isPaid && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddService}
                  className="action-button"
                >
                  Thêm dịch vụ
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <div className="invoice-content">
        {/* Thông tin chính */}
        <div className="invoice-main">
          <Card title="Thông tin hóa đơn" className="invoice-card">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số hóa đơn">
                <Text strong>{invoiceData.invoice_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag className={`status-tag ${isPaid ? "paid" : "pending"}`}>
                  {isPaid ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xuất">
                {formatVNDateTime(invoiceData.issue_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn thanh toán">
                {formatVNDateTime(invoiceData.due_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {invoiceData.created_by?.full_name || invoiceData.created_by?.username || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {invoiceData.notes || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin khách hàng" className="invoice-card">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Họ tên">
                <Text strong>{invoiceData.booking?.customer?.full_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {invoiceData.booking?.customer?.phone_number}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {invoiceData.booking?.customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD">
                {invoiceData.booking?.customer?.id_card_number}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {invoiceData.booking?.customer?.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Chi tiết đặt phòng" className="invoice-card">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Phòng">
                <Text strong>
                  {invoiceData.booking?.room?.room_number} (
                  {invoiceData.booking?.room?.room_type?.name})
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái booking">
                <Tag className={`status-tag ${invoiceData.booking?.status}`}>
                  {invoiceData.booking?.status === "checked_in"
                    ? "ĐÃ NHẬN PHÒNG"
                    : invoiceData.booking?.status === "checked_out"
                    ? "ĐÃ TRẢ PHÒNG"
                    : invoiceData.booking?.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhận phòng">
                {formatVNDateTime(invoiceData.booking?.check_in_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả phòng">
                {formatVNDateTime(invoiceData.booking?.check_out_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Số đêm">
                {numberOfNights} đêm
              </Descriptions.Item>
              <Descriptions.Item label="Đơn giá">
                {formatCurrency(
                  invoiceData.booking?.room?.room_type?.price_per_night
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Chi tiết thanh toán" className="invoice-card">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tiền phòng">
                {formatCurrency(roomCost)}
              </Descriptions.Item>
              <Descriptions.Item label="Thuế VAT (8%)">
                {formatCurrency(vat)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <div className="total-amount">{formatCurrency(total)}</div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Sidebar - Các hành động */}
        <div className="invoice-sidebar">
          <Card
            title="Hành động"
            className="invoice-card"
            style={{ position: "sticky", top: 24 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {isCheckedIn && !isPaid && hasPermission && (
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={handlePayment}
                  className="payment-button"
                  style={{ width: "100%" }}
                >
                  Thanh toán
                </Button>
              )}

              {isPaid && isCheckedOut && hasPermission && (
                <Button
                  type="default"
                  size="large"
                  icon={<EyeOutlined />}
                  onClick={handleViewDetails}
                  className="action-button"
                  style={{ width: "100%" }}
                >
                  Xem chi tiết
                </Button>
              )}

              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="action-button"
                style={{ width: "100%" }}
              >
                In hóa đơn tạm tính
              </Button>

              {!isPaid && hasPermission && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddService}
                  className="action-button"
                  style={{ width: "100%" }}
                >
                  Thêm dịch vụ
                </Button>
              )}
            </Space>

            <Divider />

            <div>
              <Text strong>Trạng thái hiện tại:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag className={`status-tag ${isPaid ? "paid" : "pending"}`}>
                  {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                </Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag className={`status-tag ${invoiceData.booking?.status}`}>
                  {invoiceData.booking?.status === "checked_in"
                    ? "Đã nhận phòng"
                    : invoiceData.booking?.status === "checked_out"
                    ? "Đã trả phòng"
                    : invoiceData.booking?.status}
                </Tag>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal in hóa đơn */}
      <Modal
        open={false}
        onCancel={() => {}}
        width={800}
        title="Hóa đơn"
        className="invoice-print-modal"
        footer={[
          <Button key="close" onClick={() => {}}>
            Đóng
          </Button>,
          <Button key="print" type="primary" onClick={handlePrint}>
            In hóa đơn
          </Button>,
        ]}
      >
        <div className="invoice-print-content">
          <InvoiceTemplate invoiceData={invoiceData} ref={invoiceRef} />
        </div>
      </Modal>

      <PaymentModal
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        bookingId={invoiceData?.booking?.id}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

// Component wrapper với Provider
const InvoiceDetailPage = () => {
  return (
    <InvoiceDetailProvider>
      <InvoiceDetailView />
    </InvoiceDetailProvider>
  );
};

export default InvoiceDetailPage;
