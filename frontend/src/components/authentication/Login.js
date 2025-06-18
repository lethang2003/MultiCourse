import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Input, Button, Card, Typography, Space, Row, Col } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  // Chỉ tạo captcha khi ở trang login
  useEffect(() => {
    if (window.location.pathname === "/login") {
      const newCaptcha = generateCaptcha();
      setCaptcha(newCaptcha);
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Chỉ vẽ captcha khi ở trang login
  useEffect(() => {
    if (window.location.pathname === "/login") {
      drawCaptcha(captcha);
    }
  }, [captcha]);

  // Kiểm tra token chỉ khi ở trang login
  useEffect(() => {
    if (window.location.pathname === "/login") {
      const queryParams = new URLSearchParams(window.location.search);
      const errorFromUrl = queryParams.get("error");
      if (errorFromUrl) {
        setError(errorFromUrl);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }

      const token = localStorage.getItem("authToken");
      const storedRole = localStorage.getItem("role");

      if (token && storedRole) {
        navigate(
          storedRole.toLowerCase() === "tutor"
            ? "/courses-list-tutor"
            : "/homescreen"
        );
      }
    }
  }, [isSubmitting, navigate]);

  // Hàm refresh captcha
  const refreshCaptcha = () => {
    if (window.location.pathname === "/login") {
      const newCaptcha = generateCaptcha();
      setCaptcha(newCaptcha);
      setUserCaptcha("");
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const errorFromUrl = queryParams.get("error");
    if (errorFromUrl) {
      setError(errorFromUrl);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const token = localStorage.getItem("authToken");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      navigate(
        storedRole.toLowerCase() === "tutor"
          ? "/courses-list-tutor"
          : "/homescreen"
      );
    }
  }, [isSubmitting, navigate]);

  useEffect(() => {
    drawCaptcha(captcha);
  }, [captcha]);

  const drawCaptcha = (captcha) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = 150;
    canvas.height = 50;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }

    ctx.font = "bold 30px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = 0; i < captcha.length; i++) {
      const x = 25 + i * 25;
      const y = 25 + Math.random() * 10 - 5;
      ctx.save();
      ctx.translate(x, y);

      const scaleX = 1 + Math.random() * 0.4 - 0.2;
      const scaleY = 1 + Math.random() * 0.3 - 0.15;
      ctx.transform(
        scaleX,
        Math.random() * 0.3 - 0.15,
        Math.random() * 0.3 - 0.15,
        scaleY,
        0,
        0
      );

      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${
        Math.random() * 100
      })`;
      ctx.fillText(captcha[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  const handleSubmit = async (values) => {
    // Nhận values thay vì e
    if (isSubmitting) return;

    if (!username || username.length < 4) {
      setError("Username must be at least 4 characters.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (userCaptcha !== captcha) {
      setError("CAPTCHA error");
      setCaptcha(generateCaptcha());
      setUserCaptcha("");
      return;
    }

    setError("");
    setIsLoading(true);
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        { username, password }
      );

      if (response.status === 200) {
        const { user_id, token, role, fullname, status, tutor_certificates } =
          response.data;

        if (!status) {
          setError("Account has been BANNED");
          setIsSubmitting(false);
          setIsLoading(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", user_id);
        setRole(role);

        setSuccessMessage("Login successfully!");

        setTimeout(() => {
          if (
            role.toLowerCase() === "tutor" &&
            (!tutor_certificates || tutor_certificates.length === 0)
          ) {
            navigate(`/uploadtutorcertificate/${user_id}`, { replace: true });
          } else if (role.toLowerCase() === "admin") {
            navigate("/statistic-for-admin");
          } else if (role.toLowerCase() === "student") {
            navigate("/course-list");
          } else {
            navigate("/courses-list-tutor");
          }
        }, 500);
      }
    } catch (err) {
      setError("Incorrect account or password.");
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpForStudent = () => {
    navigate("/signup", { state: { role: "Student" } });
  };

  const handleSignUpForTutor = () => {
    navigate("/signup", { state: { role: "Tutor" } });
  };
  const handleGoogleLogin = () => {
    window.open("http://localhost:3000/api/users/google/login", "_self");

    // const checkToken = setInterval(() => {
    //   const token = getCookie("token");
    //   if (token) {
    //     clearInterval(checkToken);
    //     localStorage.setItem("authToken", token);

    //     // Thêm đoạn code lấy role từ API
    //     fetch("http://localhost:3000/api/users/profile", {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     })
    //       .then((res) => res.json())
    //       .then((data) => {
    //         localStorage.setItem("profile-role", data.role);
    //         // Tạo một event để thông báo role đã thay đổi
    //         window.dispatchEvent(new Event("roleChanged"));
    //         window.location.href = "/course-list";
    //       });
    //   }
    // }, 500);
  };

  // Hàm để lấy cookie theo tên
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        background: "#f3f4f6", // gray-100
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
              Login
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Welcome to MultiCourse
            </Text>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Button
              icon={<GoogleOutlined />}
              type="primary"
              ghost
              block
              onClick={handleGoogleLogin}
              style={{
                marginBottom: 16,
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 16,
                height: 48,
                transition: "all 0.3s",
              }}
            >
              Sign in with Google
            </Button>

            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Username" required>
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    borderRadius: 12,
                    height: 48,
                  }}
                />
              </Form.Item>

              <Form.Item label="Password" required>
                <Input.Password
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  style={{
                    borderRadius: 12,
                    height: 48,
                  }}
                />
                <Button
                  type="link"
                  style={{ padding: 0, marginTop: 8 }}
                  onClick={() => navigate("/forgetpassword")}
                >
                  Forgot Password?
                </Button>
              </Form.Item>

              <Form.Item label="Captcha" required>
                <Row gutter={8} align="middle">
                  <Col flex="none">
                    <canvas
                      ref={canvasRef}
                      width={120}
                      height={48}
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 10,
                        backgroundColor: "#fff",
                      }}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={refreshCaptcha} // Thay đổi này
                      style={{ borderRadius: 8 }}
                    />
                  </Col>
                </Row>
                <Input
                  placeholder="Enter captcha"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    height: 48,
                  }}
                />
              </Form.Item>

              {error && (
                <Text
                  type="danger"
                  style={{ display: "block", marginBottom: 12 }}
                >
                  {error}
                </Text>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isLoading}
                  style={{
                    borderRadius: 12,
                    height: 48,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Login
                </Button>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space
                  style={{ width: "100%", justifyContent: "center" }}
                  size="large"
                >
                  <Button
                    type="link"
                    style={{ fontWeight: 500 }}
                    onClick={() =>
                      navigate("/signup", { state: { role: "Student" } })
                    }
                  >
                    Sign up as Student
                  </Button>
                  <Button
                    type="link"
                    style={{ fontWeight: 500 }}
                    onClick={() =>
                      navigate("/signup", { state: { role: "Tutor" } })
                    }
                  >
                    Sign up as Tutor
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
