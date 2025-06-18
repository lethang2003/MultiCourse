import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { 
  Card, 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Space, 
  Divider, 
  Skeleton, 
  Tag, 
  Empty,
  PageHeader,
  Breadcrumb,
  message
} from "antd";
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  VideoCameraOutlined, 
  FileOutlined, 
  FileTextOutlined,
  DownloadOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [showDocument, setShowDocument] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `http://localhost:3000/api/lessons/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLesson(response.data);
        // message.success("Lesson loaded successfully!");
      } catch (err) {
        setError("Failed to load lesson. Please try again later.");
        message.error("Failed to load lesson. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Formatting date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Check if file is PDF
  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  // Extract filename from URL
  const getFilenameFromUrl = (url) => {
    if (!url) return "document";
    return url.split('/').pop() || "document";
  };

  // Handle file download
  const handleDownload = (url) => {
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFilenameFromUrl(url));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Theme-based styling
  const getThemeStyles = () => {
    return {
      container: theme === "dark" ? "bg-gray-900" : "bg-gray-50",
      card: theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
      title: theme === "dark" ? "text-white" : "text-gray-800",
      subtitle: theme === "dark" ? "text-gray-300" : "text-gray-600",
      divider: theme === "dark" ? "bg-gray-700" : "bg-gray-200",
      description: theme === "dark" ? "text-gray-300" : "text-gray-700",
    };
  };

  const styles = getThemeStyles();

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${styles.container}`}>
        <Card className="w-full max-w-4xl shadow-lg">
          <div className="flex justify-center py-8">
            <Spin size="large" tip="Loading lesson content..." />
          </div>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${styles.container}`}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="max-w-lg"
          action={
            <Button type="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!lesson) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${styles.container}`}>
        <Empty
          description="Lesson not found"
          className="my-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back to Lessons
          </Button>
        </Empty>
      </div>
    );
  }

  // Main content
  return (
    <div className={`min-h-screen py-8 px-4 ${styles.container}`}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <a onClick={() => navigate("/dashboard")}>Dashboard</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => navigate(-1)}>Lessons</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{lesson.title}</Breadcrumb.Item>
        </Breadcrumb>
        
        {/* Main content card */}
        <Card 
          className={`shadow-lg rounded-lg overflow-hidden ${styles.card}`}
          bordered={false}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <Button 
              // type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              className="mb-4 md:mb-0"
            >
              
            </Button>
            <div className="flex-1 md:ml-8 md:text-center">
          <Tag color="blue" className="mr-2">#{lesson.number || 'N/A'}</Tag>
              <Title level={2} className={styles.title}>
                {lesson.title}
              </Title>
              <div className="flex items-center mt-2 justify-center">
                <CalendarOutlined className="mr-2" />
                <Text type="secondary" className={styles.subtitle}>
                  {formatDate(lesson.created_at)}
                </Text>
                {lesson.tags && lesson.tags.map(tag => (
                  <Tag color="blue" className="ml-2" key={tag}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
          
          <Divider className={styles.divider} />
          
          {/* Lesson description */}
          <div className="mb-8">
            <Paragraph className={`text-lg leading-relaxed ${styles.description}`}>
              {lesson.description}
            </Paragraph>
          </div>
          
          {/* Video content */}
          {lesson.video_url && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <VideoCameraOutlined className="text-xl mr-2" />
                <Title level={4} className={styles.title}>Video Lecture</Title>
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <video 
                  width="100%" 
                  controls 
                  className="w-full"
                  poster={lesson.thumbnail_url || ""}
                >
                  <source src={lesson.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          
          {/* Document content */}
          {lesson.document_url && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <FileTextOutlined className="text-xl mr-2" />
                <Title level={4} className={styles.title}>Document Resources</Title>
              </div>
              <Card className="border border-gray-200 rounded-lg">
                {isPdfFile(lesson.document_url) ? (
                  // Display PDF inline with viewer
                  <embed
                    src={lesson.document_url}
                    width="100%"
                    height="600px"
                    type="application/pdf"
                    className="rounded-lg"
                  />
                ) : (
                  // Display download button for non-PDF files
                  <div className="p-8 text-center">
                    <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div className="mb-4">
                      <Text className="block mb-2">
                        {getFilenameFromUrl(lesson.document_url)}
                      </Text>
                      <Text type="secondary" className="block">
                        This file type cannot be previewed directly.
                      </Text>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      size="large"
                      onClick={() => handleDownload(lesson.document_url)}
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Additional resources if available */}
          {lesson.resources && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <FileOutlined className="text-xl mr-2" />
                <Title level={4} className={styles.title}>Additional Resources</Title>
              </div>
              <Space direction="vertical" className="w-full">
                {lesson.resources.map((resource, index) => (
                  <Button 
                    key={index}
                    type="default"
                    icon={<FileOutlined />}
                    className="text-left w-full flex items-center"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    <span className="truncate">{resource.name}</span>
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </Card>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {/* <Button 
            type="default"
            onClick={() => navigate(-1)}
          >
            Return to Lessons
          </Button> */}
          
          {/* These buttons would need to be conditionally rendered based on prev/next data */}
          {lesson.prevLessonId && (
            <Button 
              onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}
              icon={<ArrowLeftOutlined />}
            >
              Previous Lesson
            </Button>
          )}
          
          {lesson.nextLessonId && (
            <Button 
              type="primary"
              onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}
            >
              Next Lesson <ArrowLeftOutlined className="transform rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;