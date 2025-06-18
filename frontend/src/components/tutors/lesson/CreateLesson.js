import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { 
  InboxOutlined, 
  UploadOutlined, 
  FileOutlined, 
  VideoCameraOutlined, 
  NumberOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Upload,
  Spin,
  Card,
  Typography,
  Divider,
  Alert,
  Progress,
  message,
  Space,
  Layout,
  Breadcrumb,
  Modal
} from 'antd';
import { toast, ToastContainer } from "react-toastify";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Header, Content } = Layout;

const CreateLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const isDarkMode = theme === "dark";

  // Theme-based styling
  const getThemeClasses = () => {
    return {
      layout: isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
      card: isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      input: isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300",
      button: isDarkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-500 hover:bg-blue-600",
      secondaryButton: isDarkMode ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-600",
      upload: isDarkMode ? "bg-gray-700 border-gray-600 hover:border-teal-500" : "bg-white border-gray-300 hover:border-blue-500",
      title: isDarkMode ? "text-white" : "text-gray-800",
      text: isDarkMode ? "text-gray-300" : "text-gray-600",
      divider: isDarkMode ? "bg-gray-700" : "bg-gray-200"
    };
  };

  const classes = getThemeClasses();

  // Handle form submission
  const onFinish = async (values) => {
    // Check if required files are selected
    if (!videoFile || !documentFile) {
      Modal.error({
        title: 'Missing Required Files',
        content: 'Both video and document files are required to create a lesson. Please upload both files before submitting.',
        okText: 'OK',
        okButtonProps: {
          className: isDarkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-500 hover:bg-blue-600'
        }
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("number", values.number);
      formData.append("title", values.title);
      formData.append("description", values.description);
      
      // Append files (required)
      formData.append("video", videoFile);
      formData.append("document", documentFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Send API request
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:3000/api/lessons/create-lesson/${courseId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      // Complete progress and show success notification
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      message.success("Lesson created successfully!");
      
      // Show additional confirmation notification
      // notification.success({
      //   message: 'Success',
      //   description: 'New lesson has been created successfully.',
      //   icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      //   placement: 'topRight',
      // });
      
      // Redirect to course details
      setTimeout(() => {
        navigate(`/courses-list-tutor/${courseId}`);
      }, 1500);
    } catch (err) {
      setUploadProgress(0);
      const errorMessage = err.response?.data?.message || err.message;
      message.error("Failed to create lesson. Please try again later.");
      
      // Show error notification
      // notification.error({
      //   message: 'Error Creating Lesson',
      //   description: errorMessage,
      //   placement: 'topRight',
      // });
    } finally {
      setLoading(false);
    }
  };

  // Handle form validation failure
  const onFinishFailed = (errorInfo) => {
    // Enhanced error message with more specific information
    const errorFields = errorInfo.errorFields.map(field => field.name[0]).join(', ');
    // notification.warning({
    //   message: 'Validation Failed',
    //   description: `Please check the following fields: ${errorFields}`,
    //   placement: 'topRight',
    // });
  };

  // Video upload configuration
  const videoUploadProps = {
    name: 'video',
    multiple: false,
    maxCount: 1,
    accept: 'video/*',
    beforeUpload: (file) => {
      setVideoFile(file);
      return false;
    },
    onRemove: () => {
      setVideoFile(null);
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': isDarkMode ? '#10B981' : '#1677ff',
      },
      strokeWidth: 3,
    },
  };

  // Document upload configuration
  const documentUploadProps = {
    name: 'document',
    multiple: false,
    maxCount: 1,
    accept: '.docx,.doc,.pdf',
    beforeUpload: (file) => {
      setDocumentFile(file);
      return false;
    },
    onRemove: () => {
      setDocumentFile(null);
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': isDarkMode ? '#10B981' : '#1677ff',
      },
      strokeWidth: 3,
    },
  };

  return (
    <Layout className={`min-h-screen ${classes.layout}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Header className="bg-transparent flex items-center px-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/courses-list-tutor/${courseId}`)}
          className={`mr-4 ${classes.secondaryButton}`}
        >
          Back to Course
        </Button>
      </Header>
      
      <Content className="px-4 py-6 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={() => navigate(`/courses-list-tutor/${courseId}`)}>Course</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create Lesson</Breadcrumb.Item>
          </Breadcrumb>
          
          <Card 
            className={`shadow-md rounded-lg ${classes.card}`}
            bordered={false}
          >
            <Title level={2} className={`mb-6 ${classes.title}`}>
              Create New Lesson
            </Title>
            
            <Divider className={classes.divider} />
            
            <Alert
              message="Important"
              description="Both video and document files are required to create a lesson."
              type="info"
              showIcon
              className="mb-6"
            />
            
            {loading && (
              <div className="mb-6">
                <Progress 
                  percent={uploadProgress} 
                  status={uploadProgress === 100 ? "success" : "active"}
                  strokeColor={isDarkMode ? "#10B981" : "#1677ff"}
                />
                <Text className={`block text-center mt-2 ${classes.text}`}>
                  {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
                </Text>
              </div>
            )}
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              className="mt-4"
              disabled={loading}
            >
              <Form.Item
                label={<Text className={classes.title}>Lesson Number</Text>}
                name="number"
                rules={[
                  { required: true, message: 'Please input the lesson number!' },
                  { type: 'number', min: 1, message: 'Lesson number must be greater than 0!' }
                ]}
              >
                <InputNumber 
                  className={`w-full ${classes.input}`}
                  placeholder="Enter lesson number"
                  min={1}
                  size="large"
                  prefix={<NumberOutlined className="mr-2 opacity-50" />}
                />
              </Form.Item>
              
              <Form.Item
                label={<Text className={classes.title}>Lesson Title</Text>}
                name="title"
                rules={[{ required: true, message: 'Please input the lesson title!' }]}
              >
                <Input 
                  className={classes.input}
                  placeholder="Enter lesson title"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                label={<Text className={classes.title}>Description</Text>}
                name="description"
                rules={[{ required: true, message: 'Please input the lesson description!' }]}
              >
                <TextArea 
                  className={classes.input}
                  placeholder="Enter lesson description"
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
              </Form.Item>
              
              <Form.Item
                label={
                  <Space>
                    <VideoCameraOutlined />
                    <Text className={classes.title}>Video Upload</Text>
                    <Text type="danger">*</Text>
                  </Space>
                }
                name="video"
                rules={[{ required: true, message: 'Please upload a video file!' }]}
              >
                <Dragger 
                  {...videoUploadProps}
                  className={`${classes.upload} border border-dashed`}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className={isDarkMode ? "text-teal-500" : "text-blue-500"} />
                  </p>
                  <p className={`ant-upload-text ${classes.title}`}>
                    Click or drag video file to upload
                  </p>
                  <p className={`ant-upload-hint ${classes.text}`}>
                    Support for video files like MP4, MOV, etc.
                  </p>
                </Dragger>
              </Form.Item>
              
              <Form.Item
                label={
                  <Space>
                    <FileOutlined />
                    <Text className={classes.title}>Document Upload</Text>
                    <Text type="danger">*</Text>
                  </Space>
                }
                name="document"
                rules={[{ required: true, message: 'Please upload a document file!' }]}
              >
                <Dragger 
                  {...documentUploadProps}
                  className={`${classes.upload} border border-dashed`}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className={isDarkMode ? "text-teal-500" : "text-blue-500"} />
                  </p>
                  <p className={`ant-upload-text ${classes.title}`}>
                    Click or drag document file to upload
                  </p>
                  <p className={`ant-upload-hint ${classes.text}`}>
                    Support for document files like PDF, DOC, DOCX
                  </p>
                </Dragger>
              </Form.Item>
              
              <Form.Item className="mt-8">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  block
                  loading={loading}
                  className={classes.button}
                >
                  Create Lesson
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CreateLesson;