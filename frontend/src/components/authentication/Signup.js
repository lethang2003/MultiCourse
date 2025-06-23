import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment"; // Thêm dòng này
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Checkbox,
  Modal,
  message,
  Card,
  Typography,
  Space,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title } = Typography;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef(null);

  const initialRole = location.state?.role || "Student";

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Kiểm tra khi người dùng scroll gần đến cuối (trong khoảng 20px)
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setCanAccept(true);
    }
  };

  const validateFullname = (_, value) => {
    if (!value || value.trim().includes(" ")) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Full name must be at least 2 words!"));
  };

  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        "https://multicourse-q1mn.onrender.com/api/users/signup",
        {
          ...values,
          birthday: values.birthday.format("YYYY-MM-DD"),
          role: initialRole,
        }
      );

      message.success("Sign up successfully!");

      setTimeout(() => {
        if (initialRole === "Tutor") {
          navigate(`/uploadtutorcertificate/${response.data.user_id}`);
        } else {
          navigate("/login");
        }
      }, 1500);
    } catch (err) {
      message.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 800 }}>
        <Title
          level={2}
          style={{ textAlign: "center", color: "#1890ff", marginBottom: 30 }}
        >
          Welcome new {initialRole}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="fullname"
              label="Full Name"
              rules={[
                { required: true, message: "Please input your full name!" },
                { validator: validateFullname },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input your username!" },
                {
                  min: 3,
                  max: 20,
                  message: "Username must be 3-20 characters!",
                },
                {
                  pattern: /^[^\s]+$/,
                  message: "Username cannot contain spaces!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: "Please input your phone number!" },
                {
                  pattern: /^0\d{8,10}$/,
                  message: "Please enter a valid phone number!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter your phone number"
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                { required: true, message: "Please select your gender!" },
              ]}
            >
              <Select placeholder="Select your gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Birthday"
              rules={[
                { required: true, message: "Please select your birthday!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value.isBefore(moment())) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Birthday cannot be in the future!")
                    );
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[
                { required: true, message: "Please input your address!" },
                { min: 5, message: "Address must be at least 5 characters!" },
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="Enter your address"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  pattern:
                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character!",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter your password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm your password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Checkbox
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            >
              I agree to the{" "}
              <Button type="link" onClick={() => setIsModalVisible(true)}>
                terms
              </Button>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={!agreeTerms}
              style={{ height: "40px", borderRadius: "20px" }}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Modal
          title={
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Terms & Conditions
            </div>
          }
          visible={isModalVisible}
          onOk={() => {
            setAgreeTerms(true);
            setIsModalVisible(false);
          }}
          onCancel={() => setIsModalVisible(false)}
          okButtonProps={{
            disabled: !canAccept,
            style: {
              backgroundColor: canAccept ? "#1890ff" : "#d9d9d9",
              borderColor: canAccept ? "#1890ff" : "#d9d9d9",
            },
          }}
          cancelButtonProps={{
            style: { display: "none" },
          }}
          okText="Accept"
          width={600}
          centered
        >
          <div
            style={{
              maxHeight: "400px",
              overflow: "auto",
              padding: "20px",
              border: "1px solid #d9d9d9",
              borderRadius: "8px",
              marginBottom: "20px",
              scrollBehavior: "smooth", // Thêm scroll mượt
            }}
            onScroll={handleScroll}
          >
            <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
              <h3 style={{ marginBottom: "16px" }}>
                Please read these terms carefully:
              </h3>

              <p>
                <strong>1. Account Security</strong>
              </p>
              <p>
                Do not share personal login information with others. You are
                responsible for maintaining the security of your account.
              </p>

              <p>
                <strong>2. User Conduct</strong>
              </p>
              <p>
                Respect other users and maintain professional conduct at all
                times.
              </p>

              <p>
                <strong>3. System Compliance</strong>
              </p>
              <p>Comply with all system regulations and guidelines.</p>

              <p>
                <strong>4. Content Guidelines</strong>
              </p>
              <p>Do not post offensive, illegal, or inappropriate content.</p>

              <p>
                <strong>5. Account Usage</strong>
              </p>
              <p>
                Do not use your account to sabotage or harm the system or other
                users.
              </p>

              <p>
                <strong>6. Rule Compliance</strong>
              </p>
              <p>
                Strictly comply with all rules when participating in the system.
              </p>

              <p>
                <strong>7. Violations</strong>
              </p>
              <p>
                All violations will be strictly handled according to our
                policies.
              </p>

              <p>
                <strong>8. Account Suspension</strong>
              </p>
              <p>
                The system reserves the right to suspend accounts when
                necessary.
              </p>

              <p>
                <strong>9. Terms Acceptance</strong>
              </p>
              <p>
                By continuing, you confirm that you have read and understood
                these terms.
              </p>

              <p>
                <strong>10. Privacy Policy</strong>
              </p>
              <p>
                Your personal information will be handled according to our
                privacy policy.
              </p>

              <p>
                <strong>11. Updates to Terms</strong>
              </p>
              <p>
                These terms may be updated periodically. Users will be notified
                of any changes.
              </p>

              <p>
                <strong>12. Responsibility</strong>
              </p>
              <p>
                Users are responsible for all actions performed under their
                account.
              </p>
            </div>
          </div>
          {!canAccept && (
            <div
              style={{
                textAlign: "center",
                color: "#ff4d4f",
                marginTop: "10px",
                animation: "bounce 1s infinite", // Thêm animation cho thông báo
              }}
            >
              Please scroll to the bottom to accept the terms
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Signup;
