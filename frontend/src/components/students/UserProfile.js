import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message, notification } from "antd";
import {
  Card,
  Avatar,
  Typography,
  Button,
  Space,
  Divider,
  Descriptions,
  Tag,
  Spin,
  Modal,
  Form,
  Input,
  Badge,
  Upload,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  LogoutOutlined,
  KeyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  FormOutlined,
  LoadingOutlined,
  CameraOutlined, // Th
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [fullname, setFullname] = useState("User");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Password states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Fetch user data
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "https://multicourse-q1mn.onrender.com/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data);
      localStorage.setItem("avatarUrl", response.data.avatar);
      setIsLoggedIn(true);
    } catch (err) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("authToken");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && window.location.pathname === "/login") {
      navigate("/userprofile");
    }
  }, [navigate]);

  // Check if user is logged out
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      setUserData(null);
      setFullname("User");
      setIsLoggedIn(false);
    }
  }, []);

  // Handle avatar change
  const handleAvatarChange = async (info) => {
    if (info.file.status === "uploading") {
      setAvatarLoading(true);
      return;
    }

    if (info.file.status === "done") {
      // File upload successful
      setAvatarLoading(false);
      message.success(`${info.file.name} uploaded successfully`);

      // Update user data with new avatar
      if (info.file.response && info.file.response.avatar) {
        setUserData({ ...userData, avatar: info.file.response.avatar });
        localStorage.setItem("avatar", info.file.response.avatar);
      }
    } else if (info.file.status === "error") {
      setAvatarLoading(false);
      message.error(`${info.file.name} upload failed.`);
    }
  };

  // Custom request for avatar upload
  const customRequest = async ({ file, onSuccess, onError }) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await axios.post(
        "https://multicourse-q1mn.onrender.com/api/users/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess(response.data, file);
      console.log(response.data.avatar);
      localStorage.setItem("avatarUrl", response.data.avatar);
      window.location.reload();
    } catch (err) {
      onError(err);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error("Password fields cannot be left blank.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      message.error(
        "New password must be at least 6 characters, including uppercase, lowercase, numbers and special characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Confirmation password does not match.");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      setLoading(true);
      const response = await axios.post(
        "https://multicourse-q1mn.onrender.com/api/users/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "Password changed successfully!",
          placement: "topRight",
        });

        setPasswordModalVisible(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        message.error("Old password is incorrect.");
      } else {
        message.error("An error occurred while changing password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const token = localStorage.getItem("authToken");

          if (token) {
            await axios.post(
              "https://multicourse-q1mn.onrender.com/api/users/logout",
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }

          // Remove all localStorage items
          localStorage.removeItem("authToken");
          localStorage.removeItem("fullname");
          localStorage.removeItem("role");
          localStorage.removeItem("avatar");
          localStorage.removeItem("userId");

          // Delete cookie
          document.cookie =
            "Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure; SameSite=None;";

          // Update state
          setIsLoggedIn(false);
          setUserData(null);
          setFullname("User");

          message.success("Logged out successfully");
          navigate("/login");
        } catch (error) {
          console.error("Logout failed:", error);
          message.error("An error occurred during logout. Please try again!");
        }
      },
    });
  };

  if (loading && !userData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading user profile..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Card
        style={{
          maxWidth: "800px",
          width: "100%",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        loading={loading && !userData}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ marginBottom: "8px", color: "#1890ff" }}>
            User Profile
          </Title>
          <Divider style={{ margin: "16px 0" }} />
        </div>

        {userData ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Upload
                name="avatar"
                showUploadList={false}
                customRequest={customRequest}
                beforeUpload={(file) => {
                  const isAllowed =
                    file.type === "image/jpeg" ||
                    file.type === "image/png" ||
                    file.type === "image/webp";
                  if (!isAllowed) {
                    message.error("Chỉ chấp nhận file JPG, PNG và WEBP.");
                  }
                  return isAllowed || Upload.LIST_IGNORE;
                }}
                onChange={handleAvatarChange}
              >
                <Tooltip title="Nhấn để thay đổi ảnh đại diện">
                  <Badge
                    count={
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#1890ff",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <CameraOutlined
                          style={{ color: "#fff", fontSize: "16px" }}
                        />
                      </div>
                    }
                    offset={[-10, 80]}
                  >
                    <Avatar
                      size={100}
                      src={
                        userData.avatar ||
                        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                      }
                      icon={!userData.avatar && <UserOutlined />}
                      style={{
                        boxShadow: "0 0 0 4px #fff, 0 0 0 6px #f0f0f0",
                        cursor: "pointer",
                      }}
                    />
                  </Badge>
                </Tooltip>
                <div style={{ marginTop: "8px" }}>
                  <Text strong style={{ fontSize: "18px" }}>
                    {userData.fullname || "User's Name"}
                  </Text>
                  <div>
                    <Tag color="blue" style={{ margin: "8px 0 0" }}>
                      {userData.role || "User"}
                    </Tag>
                  </div>
                </div>
              </Upload>
            </div>

            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined /> Email
                  </Space>
                }
                span={1}
              >
                {userData.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined /> Phone
                  </Space>
                }
                span={1}
              >
                {userData.phone || "Not provided"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <FormOutlined /> Gender
                  </Space>
                }
                span={1}
              >
                {userData.gender || "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <IdcardOutlined /> Status
                  </Space>
                }
                span={1}
              >
                <Badge
                  status={userData.status ? "success" : "error"}
                  text={userData.status ? "Active" : "Inactive"}
                />
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <HomeOutlined /> Address
                  </Space>
                }
                span={2}
              >
                {userData.address || "Not provided"}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/updateprofile/${userData._id}`)}
              >
                Edit Profile
              </Button>

              <Button
                icon={<KeyOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                Change Password
              </Button>

              {userData?.role === "Tutor" && (
                <Button
                  type="default"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => navigate("/certificate")}
                >
                  Certificates
                </Button>
              )}

              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              No user information available. Please log in.
            </Text>
            <div style={{ marginTop: "16px" }}>
              <Button type="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label="Current Password"
            required
            validateStatus={oldPassword ? "success" : ""}
            help=""
          >
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            required
            validateStatus={newPassword ? "success" : ""}
            help={
              newPassword &&
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/.test(
                newPassword
              )
                ? "Password must contain uppercase, lowercase, number and special character"
                : ""
            }
          >
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            required
            validateStatus={
              confirmPassword
                ? confirmPassword === newPassword
                  ? "success"
                  : "error"
                : ""
            }
            help={
              confirmPassword && confirmPassword !== newPassword
                ? "Passwords do not match"
                : ""
            }
          >
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleChangePassword}
                loading={loading}
                disabled={
                  !oldPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
