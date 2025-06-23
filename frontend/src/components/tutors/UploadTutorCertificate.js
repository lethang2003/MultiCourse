import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  List, 
  Divider, 
  Space, 
  Alert, 
  message as antMessage,
  Tag,
  Tooltip,
  Badge
} from "antd";
import {
  LinkOutlined,
  FileAddOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
  PaperClipOutlined,
  FilePdfOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UploadTutorCertificate = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [form] = Form.useForm();
  const [certificateUrl, setCertificateUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "info"
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (userId) {
      console.log("User ID from URL: ", userId);
    }
  }, [userId]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
        setMessageType("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleUrlChange = (e) => {
    setCertificateUrl(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const showMessage = (type, content) => {
    setStatusMessage(content);
    setMessageType(type);
  };

  const handleSubmit = async (values) => {
    // Get values from the form
    const { title, certificateUrl } = values;

    if (!certificateUrl || !title) {
      showMessage("error", "Please provide both certificate title and URL.");
      return;
    }

    // Check if URL starts with http:// or https://
    if (
      !certificateUrl.startsWith("https://") &&
      !certificateUrl.startsWith("http://")
    ) {
      showMessage("error", "Certificate URL must start with http:// or https://");
      return;
    }

    const newCertificate = { title, certificate_url: certificateUrl };

    // Check if the certificate already exists
    const isExist = certificates.some(
      (cert) =>
        cert.title === newCertificate.title && 
        cert.certificate_url === newCertificate.certificate_url
    );

    if (isExist) {
      showMessage("error", "This certificate already exists.");
      return;
    }

    setLoading(true);
    try {
      // Send data to the API
      const response = await axios.post(
        `https://multicourse-q1mn.onrender.com/api/users/upload-certificate/${userId}`,
        { certificates: [...certificates, newCertificate] },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);
      // showMessage("success", response.data.message || "Certificate uploaded successfully!");

      // Update the certificates list and reset form
      setCertificates(response.data.certificates || [...certificates, newCertificate]);
      form.resetFields();
      
      // Show success message using Ant Design's message
      antMessage.success("Certificate added successfully!");
    } catch (error) {
      setLoading(false);
      // showMessage("error", "Failed to upload certificates. Please try again.");
      antMessage.error("Upload failed. Please try again.");
    }
  };

  // Determine if a URL is likely a PDF
  const isPDFUrl = (url) => {
    return url.toLowerCase().includes('.pdf');
  };

  return (
    <div style={{ background: "#f0f2f5", padding: "24px", minHeight: "100vh" }}>
      <Card 
        style={{ 
          maxWidth: "800px", 
          margin: "0 auto",
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)"
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
          <FileAddOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
          Upload Tutor Certificates
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ title: "", certificateUrl: "" }}
        >
          <Form.Item
            name="title"
            label="Certificate Title"
            rules={[
              { required: true, message: "Please enter certificate title" },
              { min: 3, message: "Title must be at least 3 characters" }
            ]}
          >
            <Input 
              placeholder="Enter certificate title (e.g. 'TESOL Certification')" 
              prefix={<PaperClipOutlined style={{ color: "#bfbfbf" }} />}
              value={title}
              onChange={handleTitleChange}
            />
          </Form.Item>

          <Form.Item
            name="certificateUrl"
            label="Certificate URL"
            rules={[
              { required: true, message: "Please enter certificate URL" },
              { 
                pattern: /^(https?:\/\/)/, 
                message: "URL must start with http:// or https://" 
              }
            ]}
            extra="Enter a link to your certificate PDF or verification page"
          >
            <Input 
              placeholder="https://example.com/my-certificate.pdf" 
              prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
              value={certificateUrl}
              onChange={handleUrlChange}
            />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "space-between", marginTop: "24px" }}>
            <Button 
              icon={<RollbackOutlined />} 
              onClick={() => navigate("/courses-list-tutor")}
            >
              Skip for now
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              {loading ? "Uploading..." : "Upload Certificate"}
            </Button>
          </Space>
        </Form>

        {statusMessage && (
          <Alert
            message={statusMessage}
            type={messageType}
            showIcon
            style={{ marginTop: "16px" }}
          />
        )}

        {certificates.length > 0 && (
          <>
            <Divider orientation="left" style={{ marginTop: "32px" }}>
              <Badge count={certificates.length} style={{ backgroundColor: '#1890ff' }}>
                <Text strong style={{ fontSize: "16px", marginRight: "8px" }}>
                  Uploaded Certificates
                </Text>
              </Badge>
            </Divider>
            
            <List
              itemLayout="horizontal"
              dataSource={certificates}
              renderItem={(cert, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      isPDFUrl(cert.certificate_url) ? 
                        <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} /> : 
                        <LinkOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    }
                    title={
                      <Space>
                        <Text strong>{cert.title}</Text>
                        <Tag color={isPDFUrl(cert.certificate_url) ? "red" : "blue"}>
                          {isPDFUrl(cert.certificate_url) ? "PDF" : "Certificate"}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Tooltip title="Open certificate link">
                        <a
                          href={cert.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1890ff" }}
                        >
                          {cert.certificate_url}
                        </a>
                      </Tooltip>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default UploadTutorCertificate;