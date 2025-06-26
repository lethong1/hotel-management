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

const RevenueReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [chartData, setChartData] = useState([]);

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
        date: new Date(item.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
      }));
      setChartData(formattedChartData);
    } catch (err) {
      message.error("Không thể tải báo cáo doanh thu!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const handleFilter = () => {
    const [start, end] = dateRange || [null, null];
    fetchRevenue(
      start ? start.startOf("day").toISOString() : undefined,
      end ? end.endOf("day").toISOString() : undefined
    );
  };

  return (
    <div className="report-page-container">
      <Title level={2} className="report-page-title">
        Báo cáo doanh thu
      </Title>

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
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Cột bên trái cho các thẻ thống kê */}
        <Col xs={24} lg={7}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card className="statistic-card revenue">
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
              <Card className="statistic-card invoice">
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
          <Card className="chart-card" title="Biểu đồ doanh thu theo ngày">
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueReportPage;
