// File: RevenueReportPage.jsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  DatePicker,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  DollarCircleOutlined,
  FileDoneOutlined,
  SearchOutlined,
} from "@ant-design/icons"; // Thêm các icon
import apiClient from "../api/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Import file CSS mới
import "../css/RevenueReportPage.css";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Hàm tiện ích format tiền tệ
const formatCurrency = (value) => `${value.toLocaleString()} VND`;

// Hàm parse ngày từ định dạng dd/mm/yyyy
const parseDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Nếu đã là định dạng dd/mm/yyyy từ backend
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Trả về định dạng dd/mm để hiển thị gọn hơn
      return `${parts[0]}/${parts[1]}`;
    }
  }
  
  // Nếu là định dạng khác, thử parse
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  } catch (error) {
    console.warn("Invalid date format:", dateStr);
  }
  
  return dateStr;
};

const RevenueReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [chartData, setChartData] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState('30 ngày gần nhất');

  const fetchRevenue = async (startDate, endDate) => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const res = await apiClient.get("/invoices/revenue-report/", { params });
      setRevenue(res.data.total_revenue || 0);
      setInvoiceCount(res.data.invoice_count || 0);

      const chartRes = await apiClient.get("/invoices/revenue-report/", {
        params: { ...params, group_by: "day" },
      });
      
      // Xử lý dữ liệu ngày tháng để hiển thị đẹp hơn trên trục X
      const formattedChartData = (chartRes.data.daily || []).map((item) => ({
        ...item,
        date: parseDate(item.date), // Sử dụng hàm parse mới
      }));
      setChartData(formattedChartData);
      
      // Cập nhật thông tin khoảng thời gian
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        setCurrentPeriod(`${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`);
      } else {
        setCurrentPeriod('30 ngày gần nhất');
      }
      
      // Thông báo nếu không có dữ liệu
      if (formattedChartData.length === 0) {
        if (startDate && endDate) {
          message.info("Không có dữ liệu doanh thu trong khoảng thời gian đã chọn");
        } else {
          message.info("Không có dữ liệu doanh thu trong 30 ngày gần nhất");
        }
      }
    } catch (err) {
      console.error("Error fetching revenue:", err);
      if (err.response?.status === 404) {
        message.error("API báo cáo doanh thu không tồn tại!");
      } else if (err.response?.status >= 500) {
        message.error("Lỗi server! Vui lòng thử lại sau.");
      } else {
        message.error("Không thể tải báo cáo doanh thu!");
      }
      setChartData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const handleFilter = () => {
    const [start, end] = dateRange || [null, null];
    
    // Reset dữ liệu trước khi fetch mới
    setRevenue(0);
    setInvoiceCount(0);
    setChartData([]);
    
    fetchRevenue(
      start ? start.startOf("day").toISOString() : undefined,
      end ? end.endOf("day").toISOString() : undefined
    );
  };

  return (
    <div className="report-page-container">
      <Title level={3} style={{ paddingTop: 20 }} className="report-page-title">
        Báo cáo doanh thu
      </Title>
      
      <div style={{ 
        marginBottom: 16, 
        color: '#8c8c8c', 
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        Khoảng thời gian: {currentPeriod}
      </div>

      <Card className="filter-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              allowClear
            />
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handleFilter}
              loading={loading}
              icon={<SearchOutlined />}
            >
              Lọc
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => {
                setDateRange([null, null]);
                fetchRevenue();
              }}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Cột bên trái cho các thẻ thống kê */}
        <Col xs={24} lg={7}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card className="statistic-card revenue" loading={loading}>
                <Statistic
                  title="Tổng doanh thu"
                  value={revenue}
                  precision={0}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card className="statistic-card invoice" loading={loading}>
                <Statistic
                  title="Số hóa đơn đã thanh toán"
                  value={invoiceCount}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<FileDoneOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Cột bên phải cho biểu đồ */}
        <Col xs={24} lg={17}>
          <Card 
            className="chart-card" 
            title="Biểu đồ doanh thu theo ngày"
            loading={loading}
          >
            {!loading && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toLocaleString()}tr`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    labelFormatter={(label) => {
                      // Hiển thị ngày đầy đủ trong tooltip
                      if (label && label.includes('/')) {
                        const parts = label.split('/');
                        if (parts.length === 2) {
                          // Nếu là dd/mm, thêm năm hiện tại
                          const currentYear = new Date().getFullYear();
                          return `Ngày ${parts[0]}/${parts[1]}/${currentYear}`;
                        } else if (parts.length === 3) {
                          // Nếu đã có năm
                          return `Ngày ${parts[0]}/${parts[1]}/${parts[2]}`;
                        }
                      }
                      return label;
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 16 }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3f8600"
                    name="Doanh thu"
                    barSize={30}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : !loading && (
              <div style={{ 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#8c8c8c',
                fontSize: '16px'
              }}>
                Không có dữ liệu doanh thu trong khoảng thời gian này
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueReportPage;
