import React, { useContext, useEffect } from 'react';
import { Row, Col, Input, Button, Typography, Form } from 'antd';
import { MailOutlined, EyeInvisibleOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png' // Lưu ý: Bạn cần tạo file logo.svg riêng
import { LoginContext } from '../../contexts/LoginConText'  
import { useNavigate } from 'react-router-dom';
import { message, Spin} from 'antd';
const { Title } = Typography;



const LoginForm = () => {
  const { loginUser, authState } = useContext(LoginContext)
  const navigate = useNavigate();
  const customIndicator = (
    <LoadingOutlined 
      style={{ 
        fontSize: 48, // Chỉnh kích thước
        color: '#B5C99A' // Chỉnh màu sắc cho hợp với theme của bạn
      }} 
      spin 
    />
  );
  useEffect(() => {
    // Nếu đã xác thực thành công, chuyển ngay đến dashboard
    if (authState.isAuthenticated) {
      console.log('User is already authenticated. Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);
  if (authState.isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={customIndicator} />
      </div>
    );
  }
  const onFinish = async (values) => {
    try {
      await loginUser(values.username, values.password)
      message.success('Đăng nhập thành công')
    } catch (error) {
      console.log('Login Failed:', error)
      message.error('Đăng nhập thất bại')
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    console.log(errorInfo)
    // setIsLoading({...isLoading, authLoading: false})
  };

  return (
    <div style={{
      backgroundColor: '#F5F5DC', // Màu nền kem nhạt
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Montserrat', sans-serif",
      borderRadius: '20px', // Font chữ tương tự
    }}>
      <Row style={{
        width: 800,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        {/* Cột bên trái (Logo) */}
        <Col span={10} style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
        </Col>

        {/* Cột bên phải (Form) */}
        <Col span={14} style={{
          padding: '60px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Title level={2} style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: 'bold',
            color: '#333'
          }}>
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
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                placeholder=""
                size="large"
                style={{
                  borderRadius: '25px',
                  backgroundColor: '#fff',
                  borderColor: '#000',
                  height: '50px',
                  paddingLeft: '20px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<EyeInvisibleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                placeholder=""
                size="large"
                style={{
                  borderRadius: '25px',
                  backgroundColor: '#fff',
                  borderColor: '#000',
                  height: '50px',
                  paddingLeft: '20px'
                }}
                iconRender={visible => (visible ? <EyeInvisibleOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '20px' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  width: '100%',
                  borderRadius: '25px',
                  backgroundColor: '#B5C99A',
                  borderColor: '#B5C99A',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333'
                }}
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