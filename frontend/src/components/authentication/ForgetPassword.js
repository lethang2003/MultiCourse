import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Alert,
  Space 
} from "antd";
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      setOtpExpired(false);
      setTimer(200);
  
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setOtpExpired(true);
            setStep(1);
            setError("OTP has expired. Please re-enter your email.");
            setTimeout(() => {
              setError("");
            }, 3000);
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(countdown);
    }
  }, [step]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleSendEmail = async () => {
    if (!email) {
      return showError("Email is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showError("Please enter a valid email address.");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/forgot-password",
        { email }
      );

      if (response.status === 200) {
        setStep(2);
        showSuccess("OTP has been sent to your email.");
      }
    } catch (err) {
      showError("Unable to send OTP. Please check your email.");
    }
  };

  const handleResetPassword = async () => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;
  
    if (!otp || otp.trim() === "") {
      return showError("OTP is required.");
    }
  
    if (!passwordRegex.test(newPassword)) {
      return showError(
        "Password must be at least 8 characters, contain uppercase, lowercase, numbers and special characters."
      );
    }
  
    if (newPassword !== confirmPassword) {
      return showError("Passwords do not match.");
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/reset-password",
        { otp, newPassword }
      );
  
      if (response.status === 200) {
        showSuccess(response.data.message);
        setStep(3);
      }
    } catch (err) {
      if (err.response && err.response.data.message === "OTP expired") {
        showError("OTP has expired. Please re-enter your email.");
        setStep(1);
      } else {
        showError("Invalid or expired OTP.");
      }
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      return showError("Email is required before resending OTP.");
    }

    setOtpExpired(false);
    setTimer(20);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/resend-otp",
        { email }
      );

      if (response.status === 200) {
        showSuccess("A new OTP has been sent.");
      }
    } catch (err) {
      showError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Col xs={22} sm={16} md={12} lg={8}>
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            padding: "32px 24px",
            background: "#ffffff",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title
              level={2}
              style={{ color: "#1890ff", fontWeight: "bold", marginBottom: 8 }}
            >
              {step === 1 && "Forgot Password"}
              {step === 2 && "OTP Confirmation"}
              {step === 3 && "Success!"}
            </Title>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {successMessage && (
            <Alert
              message={successMessage}
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {step === 1 && (
              <Form layout="vertical">
                <Form.Item
                  label="Email"
                  required
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{ borderRadius: 12, height: 48 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleSendEmail}
                    block
                    style={{
                      borderRadius: 12,
                      height: 48,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Send OTP
                  </Button>
                </Form.Item>
              </Form>
            )}

            {step === 2 && (
              <Form layout="vertical">
                <Form.Item label={`Enter OTP (${timer}s)`} required>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    style={{ borderRadius: 12, height: 48 }}
                  />
                </Form.Item>

                <Form.Item label="New Password" required>
                  <Input.Password
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{ borderRadius: 12, height: 48 }}
                  />
                </Form.Item>

                <Form.Item label="Confirm Password" required>
                  <Input.Password
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{ borderRadius: 12, height: 48 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleResetPassword}
                    block
                    disabled={otpExpired}
                    style={{
                      borderRadius: 12,
                      height: 48,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Change Password
                  </Button>
                </Form.Item>

                {otpExpired && (
                  <Form.Item>
                    <Button
                      type="default"
                      onClick={handleResendOTP}
                      block
                      style={{
                        borderRadius: 12,
                        height: 48,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Resend OTP
                    </Button>
                  </Form.Item>
                )}
              </Form>
            )}

            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 64,
                    color: "#52c41a",
                    marginBottom: 24,
                  }}
                />
                <Text
                  style={{
                    display: "block",
                    fontSize: 16,
                    marginBottom: 24,
                  }}
                >
                  Your password has been changed successfully!
                </Text>
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  block
                  style={{
                    borderRadius: 12,
                    height: 48,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Back to Login
                </Button>
              </div>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgetPassword;