import React, { useState } from "react";
import axios from "axios";
import { WalletOutlined, QuestionCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Space, 
  Tooltip, 
  Row, 
  Col, 
  InputNumber, 
  message, 
  Spin 
} from "antd";

const { Title } = Typography;

const WalletStudent = () => {
  const [amount, setAmount] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setResponseMessage("");

    if (!amount || amount < 50000) {
      message.error("The deposit amount must be greater than 50,000 VND.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      message.error("Please login before payment.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/payment/create-payment",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        typeof response.data === "string" &&
        response.data.startsWith("http")
      ) {
        window.open(response.data, "_blank");
        setAmount(null);
        message.success("Payment link opened in a new tab");
      }
    } catch (error) {
      console.error("Error sending payment request:", error);
      message.error(
        error.response?.data?.message || "An error occurred, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const amountOptions = [
    50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 5000000, 10000000
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh", 
      padding: "24px",
      background: "#f0f2f5"
    }}>
      <Card 
        style={{ 
          width: "100%", 
          maxWidth: 500,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}
      >
        <Title 
          level={2} 
          style={{ 
            textAlign: "center", 
            // color: "#1890ff",
            marginBottom: 24
          }}
        >
          <WalletOutlined style={{ marginRight: 8,  color: "#1890ff" }} /> Deposit Wallet
        </Title>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ position: "relative" }}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter amount..."
              value={amount}
              onChange={(value) => setAmount(value)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              min={50000}
              size="large"
              addonAfter={
                <Tooltip title="Deposit amount must be greater than 50,000 VND">
                  <QuestionCircleOutlined />
                </Tooltip>
              }
            />
          </div>

          <Row gutter={[8, 8]}>
            {amountOptions.map((value) => (
              <Col span={8} key={value}>
                <Button
                  onClick={() => setAmount(value)}
                  style={{ width: "100%" }}
                  type={amount === value ? "primary" : "default"}
                >
                  {value.toLocaleString()}
                </Button>
              </Col>
            ))}
          </Row>

          <Button
            type="primary"
            size="large"
            onClick={handlePayment}
            disabled={loading}
            block
            style={{ 
              height: 48,
              fontSize: 16,
              background: "#1890ff" 
            }}
          >
            {loading ? <Spin indicator={antIcon} /> : "Deposit"}
          </Button>

          {responseMessage && (
            <div style={{ textAlign: "center", color: "#ff4d4f" }}>
              {responseMessage}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default WalletStudent;