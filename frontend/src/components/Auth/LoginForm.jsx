import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Input, Button, Typography, Form } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { LoginContext } from "../../contexts/LoginConText";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import "../../css/LoginForm.css";
const { Title } = Typography;

const LoginForm = () => {
  const { loginUser, authState } = useContext(LoginContext);
  const navigate = useNavigate();

  const customIndicator = <LoadingOutlined className="custom-spinner" spin />;

  useEffect(() => {
    // Nếu đã xác thực thành công, chuyển ngay đến dashboard
    if (authState.isAuthenticated) {
      console.log("User is already authenticated. Redirecting to dashboard...");
      navigate("/dashboard");
    }
  }, [authState.isAuthenticated, navigate]);

  if (authState.isLoading) {
    return (
      <div className="loading-container">
        <Spin indicator={customIndicator} />
      </div>
    );
  }

  const onFinish = async (values) => {
    try {
      await loginUser(values.username, values.password);
      message.success("Đăng nhập thành công");
    } catch (error) {
      console.log("Login Failed:", error);
      message.error("Đăng nhập thất bại");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    console.log(errorInfo);
  };

  return (
    <div className="login-container">
      <Row className="login-row">
        {/* Cột bên trái (Logo) */}
        <Col
          span={10}
          className="login-logo-column"
          style={{
            backgroundImage: `url(${logo})`,
          }}
        ></Col>

        {/* Cột bên phải (Form) */}
        <Col span={14} className="login-form-column">
          <Title level={2} className="login-title">
            ĐĂNG NHẬP
          </Title>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
                placeholder="Tên đăng nhập"
                size="large"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<EyeOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
                placeholder="Mật khẩu"
                size="large"
                className="login-input"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="login-button"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default LoginForm;
