import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Empty,
  Button,
  List,
  Card,
  Row,
  Col,
  Image,
  Space,
  Tag,
  Divider,
  Modal,
  message,
  Spin,
  Statistic
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  BookOutlined,
  DollarOutlined,
  TrophyOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart from API
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://multicourse-q1mn.onrender.com/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();

        console.log("API Response:", data);

        if (response.ok && data.cart_items && Array.isArray(data.cart_items)) {
          setCartItems(data.cart_items);
          setTotalPrice(data.total_price);
          setCartId(data._id);
        } else {
          console.log(
            "Error fetching cart:",
            data.message || "No cart available"
          );
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const showDeleteConfirm = (itemId) => {
    confirm({
      title: 'Remove Course',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to remove this course from your cart?',
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        handleRemoveItem(itemId);
      },
    });
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`https://multicourse-q1mn.onrender.com/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const updatedItems = cartItems.filter(
          (item) => item.course._id !== itemId
        );

        const updatedTotalPrice = updatedItems.reduce(
          (total, item) => total + item.course.price,
          0
        );

        setCartItems(updatedItems);
        setTotalPrice(updatedTotalPrice);
        
        message.success("Course removed from cart successfully");
      } else {
        message.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      message.error("An error occurred while removing the course");
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(
        `https://multicourse-q1mn.onrender.com/api/orders/create-order/${cartId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();

      if (data.status === false) {
        message.error("Your account has been banned and cannot make purchases!");
        return;
      }

      if (response.status === 201) {
        message.success("Payment successful!");
        setIsSuccessModalOpen(true);
      } else {
        if (data.message === "Not enough balance") {
          message.error("Not enough balance in your account!");
        } else {
          message.error(data.message || "Payment failed!");
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Payment failed. Please try again later.");
    }
  };

  const EmptyCart = () => (
    <Card>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ height: 120 }}
        description={
          <Space direction="vertical" size="large" align="center">
            <Title level={4}>Your cart is empty</Title>
            <Text type="secondary">No courses in your cart yet</Text>
            <Button 
              type="primary" 
              icon={<HomeOutlined />} 
              size="large"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </Space>
        }
      />
    </Card>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5", padding: "24px" }}>
      <Content style={{ width: 1100, margin: "0 auto" }}>
        {/* Header Section */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <ShoppingCartOutlined /> Shopping Cart
            </Title>
            <Text type="secondary">
              {cartItems.length} {cartItems.length === 1 ? "course" : "courses"} in cart
            </Text>
          </Col>
          <Col>
            <Tag color="blue" style={{ padding: "8px 16px", fontSize: 16 }}>
              <TrophyOutlined /> Welcome to your shopping cart!
            </Tag>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 100 }}>
            <Spin size="large" />
            <div style={{ marginTop: 20 }}>
              <Text>Loading your cart...</Text>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <Row gutter={24}>
            {/* Cart Items */}
            <Col xs={24} lg={16}>
              <Card title={<Title level={4}>Cart Items</Title>} bordered={false}>
                <List
                  itemLayout="horizontal"
                  dataSource={cartItems}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteConfirm(item.course._id)}
                        >
                          Remove
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Image 
                            src={item.course.image} 
                            alt={item.course.title} 
                            width={120} 
                            height={80} 
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                            preview={false}
                          />
                        }
                        title={
                          <Title level={5} style={{ marginBottom: 8 }}>
                            {item.course.title}
                          </Title>
                        }
                        description={
                          <>
                            <Tag icon={<BookOutlined />} color="blue">
                              {item.course.category}
                            </Tag>
                            <div style={{ marginTop: 8 }}>
                              <Text type="danger" strong style={{ fontSize: 16 }}>
                                {item.course.price.toLocaleString()} VND
                              </Text>
                            </div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card 
                title={<Title level={4}>Order Summary</Title>} 
                bordered={false}
                style={{ position: 'sticky', top: 24 }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Row justify="space-between">
                    <Col>
                      <Text>Subtotal</Text>
                    </Col>
                    <Col>
                      <Text>{totalPrice.toLocaleString()} VND</Text>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '12px 0' }} />

                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong style={{ fontSize: 16 }}>Total</Text>
                    </Col>
                    <Col>
                      <Statistic 
                        value={totalPrice} 
                        suffix="VND" 
                        precision={0} 
                        valueStyle={{ color: '#1890ff', fontSize: 20 }}
                      />
                    </Col>
                  </Row>

                  <Button 
                    type="primary" 
                    icon={<CreditCardOutlined />} 
                    size="large" 
                    block
                    onClick={handlePayment}
                  >
                    Proceed to Payment
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </Content>

      {/* Success Modal */}
      <Modal
        title={<div style={{ textAlign: 'center' }}>🎉 Purchase Successful!</div>}
        open={isSuccessModalOpen}
        onCancel={() => setIsSuccessModalOpen(false)}
        footer={[
          <Button 
            key="goto-courses" 
            type="primary"
            icon={<BookOutlined />}
            onClick={() => {
              setIsSuccessModalOpen(false);
              navigate("/my-courses");
            }}
          >
            Go to My Courses
          </Button>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4} style={{ color: '#52c41a' }}>
            <TrophyOutlined /> Congratulations!
          </Title>
          <Text>Your purchase was successful. You can now access your courses!</Text>
        </div>
      </Modal>
    </Layout>
  );
};

export default Cart;