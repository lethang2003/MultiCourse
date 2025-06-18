import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  Button,
  List,
  Typography,
  Spin,
  Empty,
  Space,
  Alert,
  Tag,
  Modal,
  Tooltip,
  Divider,
  PageHeader,
  message
} from "antd";
import {
  FileAddOutlined,
  DeleteOutlined,
  LinkOutlined,
  FilePdfOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  RightCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { confirm } = Modal;

const ViewCertificate = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("🔹 Token từ LocalStorage:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("🔹 Token đã giải mã:", decodedToken);

        if (!decodedToken._id) {
          console.error("❌ Token không chứa _id!");
        } else {
          setUserId(decodedToken._id);
          console.log("✅ userId từ token:", decodedToken._id);
        }
      } catch (error) {
        console.error("❌ Lỗi giải mã token:", error);
      }
    } else {
      console.error("❌ Không tìm thấy token trong LocalStorage!");
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Token not found! Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3000/api/certificates/get-tutor-certificate",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificates(response.data.certificates);
    } catch (err) {
      message.error("Error fetching certificates");
      setError("Could not fetch certificates. Please try again!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = (id) => {
    confirm({
      title: 'Are you sure you want to delete this certificate?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          message.error("Token not found! Please log in again.");
          return;
        }
      
        try {
          await axios.delete(
            `http://localhost:3000/api/certificates/delete-tutor-certificate/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCertificates(certificates.filter((cert) => cert._id !== id));
          message.success("Certificate deleted successfully!");
        } catch (error) {
          message.error("Failed to delete certificate. Please try again!");
        }
      },
    });
  };  

  const renderCertificateItem = (item) => {
    // Detect if URL is likely a PDF
    const isPDF = item.certificate_url.toLowerCase().includes('.pdf');
    
    return (
      <List.Item
        key={item._id}
        actions={[
          <Tooltip title="Delete certificate">
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => deleteCertificate(item._id)}
            >
              Delete
            </Button>
          </Tooltip>
        ]}
      >
        <List.Item.Meta
          avatar={isPDF ? <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} /> : <LockOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
          title={
            <Space>
              <Text strong>{item.title}</Text>
              <Tag color={isPDF ? "red" : "blue"}>{isPDF ? "PDF" : "Certificate"}</Tag>
            </Space>
          }
          description={
            <Space direction="vertical">
              <Text type="secondary">
                <LinkOutlined /> Certificate URL:
              </Text>
              <a
                href={item.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-link"
              >
                <Button type="link" icon={<RightCircleOutlined />}>
                  View Certificate
                </Button>
              </a>
            </Space>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="certificate-container" style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        bordered={false}
        style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)' }}
      >
        <Title level={2} style={{ marginBottom: '24px' }}>
          <FilePdfOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Certificate Management
        </Title>
        
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">Manage your professional certificates and qualifications</Text>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            size="large"
            onClick={() => {
              if (!userId) {
                console.error("❌ User ID is NULL or UNDEFINED!");
                message.error("User ID not found! Please log in again.");
                return;
              }
              navigate(`/uploadtutorcertificate/${userId}`);
            }}
          >
            Upload Certificate
          </Button>
        </div>
        
        <Divider style={{ margin: '8px 0 24px' }} />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Loading certificates..." />
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        ) : certificates.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No certificates available. Upload your first certificate to get started.
              </span>
            }
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={certificates}
            renderItem={renderCertificateItem}
            pagination={{
              onChange: page => {
                console.log(page);
              },
              pageSize: 5,
            }}
          />
        )}
      </Card>
      <ToastContainer />
    </div>
  );
};

export default ViewCertificate;