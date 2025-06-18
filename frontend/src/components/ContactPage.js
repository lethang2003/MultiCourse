import React, { useState } from "react";
import {
  Layout,
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Divider,
  message,
  Space,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useTheme } from "./context/ThemeContext";
import emailjs from "@emailjs/browser";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const ContactPage = () => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const templateParams = {
        user_name: values.name,
        user_email: values.email,
        user_subject: values.subject,
        user_message: values.message,
        admin_email: "your-email@multicourse.edu.vn",
        admin_name: "MultiCourse Team",
      };

      await emailjs.send(
        "service_f553c8r",
        "template_eiky6aq",
        templateParams,
        "0LLyBVlsDufvMFw7l"
      );

      message.success(
        "Thank you for your message! We have sent you a confirmation email."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error sending email:", error);
      message.error("Failed to send email. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Content
      style={{
        padding: "50px 50px",
        background: theme === "dark" ? "#141414" : "#f0f2f5",
      }}
    >
      <Row justify="center" align="middle" style={{ marginBottom: 40 }}>
        <Col xs={24} md={16} lg={12} style={{ textAlign: "center" }}>
          <Space align="center" direction="vertical" size="large">
            <img
              src="/MultiCourse-logo.png"
              alt="MultiCourse Logo"
              style={{ width: "180px", height: "180px" }}
            />
            <Title
              level={1}
              style={{
                margin: 0,
                color: theme === "dark" ? "#fff" : "#001529",
              }}
            >
              Contact Us
            </Title>
            <Paragraph
              style={{
                fontSize: "16px",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.85)"
                    : "rgba(0, 0, 0, 0.65)",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              Have questions about our courses? Want to learn more about
              becoming a tutor? We're here to help! Reach out to us using the
              form below.
            </Paragraph>
          </Space>
        </Col>
      </Row>

      <Row gutter={[32, 32]} justify="center">
        {/* Contact Information */}
        <Col xs={24} md={10} lg={8}>
          <Card
            style={{
              height: "100%",
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{ color: theme === "dark" ? "#fff" : "#001529" }}
            >
              Get In Touch
            </Title>
            <Divider style={{ margin: "16px 0" }} />

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space align="start">
                <EnvironmentOutlined
                  style={{ fontSize: "20px", color: "#1890ff" }}
                />
                <div>
                  <Text strong>Address</Text>
                  <Paragraph style={{ margin: 0 }}>
                    123 Education Street, Ho Chi Minh City, Vietnam
                  </Paragraph>
                </div>
              </Space>

              <Space align="start">
                <PhoneOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                <div>
                  <Text strong>Phone</Text>
                  <Paragraph style={{ margin: 0 }}>
                    +84 (28) 1234 5678
                  </Paragraph>
                </div>
              </Space>

              <Space align="start">
                <MailOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                <div>
                  <Text strong>Email</Text>
                  <Paragraph style={{ margin: 0 }}>
                    contact@multicourse.edu.vn
                  </Paragraph>
                </div>
              </Space>

              <Space align="start">
                <GlobalOutlined
                  style={{ fontSize: "20px", color: "#1890ff" }}
                />
                <div>
                  <Text strong>Working Hours</Text>
                  <Paragraph style={{ margin: 0 }}>
                    Monday-Friday: 8:00 AM - 6:00 PM
                  </Paragraph>
                  <Paragraph style={{ margin: 0 }}>
                    Saturday: 8:00 AM - 12:00 PM
                  </Paragraph>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={14} lg={12}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{ color: theme === "dark" ? "#fff" : "#001529" }}
            >
              Send Us A Message
            </Title>
            <Divider style={{ margin: "16px 0" }} />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input size="large" placeholder="Your Full Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input size="large" placeholder="Your Email Address" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: "Please enter a subject" }]}
              >
                <Input size="large" placeholder="How can we help you?" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[
                  { required: true, message: "Please enter your message" },
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Your message in detail..."
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  loading={submitting}
                  style={{ width: "100%" }}
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row justify="center" style={{ marginBottom: 60 }}>
        <Col xs={24} md={20}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{
                color: theme === "dark" ? "#fff" : "#001529",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Our Location
            </Title>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0519803167836!2d105.73001407573037!3d10.012565272816941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a08900318d0db3%3A0x7aa54681cde47b0b!2zxJDhuqFpIEjhu41jIEZQVA!5e0!3m2!1svi!2s!4v1745325862827!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default ContactPage;
