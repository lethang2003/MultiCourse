import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { 
  Modal, 
  Form, 
  Input, 
  Upload, 
  Button, 
  Typography, 
  Divider, 
  Space, 
  Alert, 
  Spin, 
  Card
} from "antd";
import { 
  InboxOutlined, 
  UploadOutlined, 
  FilePdfOutlined, 
  VideoCameraOutlined, 
  SaveOutlined, 
  EditOutlined, 
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Dragger } = Upload;

const UpdateLessonModal = ({ lesson, onClose, onUpdate, visible = true }) => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoFileList, setVideoFileList] = useState([]);
  const [documentFileList, setDocumentFileList] = useState([]);

  // Initialize form with lesson data
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description);
      
      // Reset file lists when lesson changes
      setVideoFileList([]);
      setDocumentFileList([]);
    }
  }, [lesson]);

  const isDarkMode = theme === "dark";

  // Theme-based styling classes
  const getThemeClasses = () => {
    return {
      modal: isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900",
      input: isDarkMode 
        ? "bg-gray-700 border-gray-600 text-white" 
        : "bg-white border-gray-300 text-gray-900",
      upload: isDarkMode
        ? "bg-gray-700 border-gray-600 text-white hover:border-blue-400" 
        : "bg-white border-gray-300 text-gray-900 hover:border-blue-500",
      button: isDarkMode 
        ? "border-gray-600 text-gray-300 hover:text-white" 
        : "border-gray-300 text-gray-800 hover:text-black",
      primaryButton: "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white",
      dangerButton: "bg-red-500 hover:bg-red-600 border-red-500 text-white"
    };
  };

  const classes = getThemeClasses();

  // Video upload handler
  const handleVideoChange = (info) => {
    const { fileList } = info;
    setVideoFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[fileList.length - 1];
      
      if (file.status === 'done' || file.status === 'uploading' || !file.status) {
        setVideoFile(file.originFileObj);
      }
    } else {
      setVideoFile(null);
    }
  };

  // Document upload handler
  const handleDocumentChange = (info) => {
    const { fileList } = info;
    setDocumentFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[fileList.length - 1];
      
      if (file.status === 'done' || file.status === 'uploading' || !file.status) {
        setDocumentFile(file.originFileObj);
      }
    } else {
      setDocumentFile(null);
    }
  };

  // Show confirmation dialog
  const showConfirm = () => {
    Modal.confirm({
      title: 'Confirm Update',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to update this lesson?',
      okText: 'Update',
      cancelText: 'Cancel',
      onOk: handleSubmit,
      okButtonProps: {
        className: classes.primaryButton
      },
      className: isDarkMode ? 'dark-theme-modal' : '',
      styles: {
        body: isDarkMode ? { background: '#1f2937', color: 'white' } : {}
      }
    });
  };

  // Form submission handler
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (videoFile) formData.append("video", videoFile);
      if (documentFile) formData.append("document", documentFile);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3000/api/lessons/${lesson._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }

      const data = await response.json();
      
      // Call parent update function if provided
      if (onUpdate) {
        onUpdate(data);
      }
      
      // toast.success("Lesson updated successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
      // toast.error("Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  // Upload configurations
  const uploadProps = {
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3
    }
  };

  // Video upload configuration
  const videoUploadProps = {
    ...uploadProps,
    accept: 'video/*',
    fileList: videoFileList,
    onChange: handleVideoChange,
    maxCount: 1
  };

  // Document upload configuration
  const documentUploadProps = {
    ...uploadProps,
    accept: '.pdf,.docx,.txt',
    fileList: documentFileList,
    onChange: handleDocumentChange,
    maxCount: 1
  };

  return (
    <Modal
      title={
        <Space>
          <EditOutlined className="text-blue-500" />
          <Text strong className={isDarkMode ? "text-white" : ""}>Update Lesson</Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className={isDarkMode ? "dark-theme-modal" : ""}
      styles={{ 
        body: isDarkMode ? { background: '#1f2937', color: 'white' } : {},
        mask: { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)' }
      }}
      destroyOnClose
    >
      <Divider className={isDarkMode ? "bg-gray-700" : ""} />
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
          closable
        />
      )}
      
      <Spin spinning={loading} tip="Updating lesson...">
        <Form layout="vertical" initialValues={{ title, description }}>
          <Form.Item 
            label={<Text className={isDarkMode ? "text-white" : ""}>Lesson Title</Text>}
            required
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className={classes.input}
              size="large"
            />
          </Form.Item>
          
          <Form.Item 
            label={<Text className={isDarkMode ? "text-white" : ""}>Description</Text>}
            required
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter lesson description"
              className={classes.input}
              rows={4}
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
          
          <Form.Item
            label={
              <Space>
                <VideoCameraOutlined className="text-blue-500" />
                <Text className={isDarkMode ? "text-white" : ""}>Video Upload</Text>
              </Space>
            }
          >
            <Card className={`${classes.upload} border border-dashed`}>
              <Dragger {...videoUploadProps} className="bg-transparent">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-blue-500" />
                </p>
                <p className={`ant-upload-text ${isDarkMode ? "text-white" : ""}`}>
                  Click or drag to upload video
                </p>
                <p className={`ant-upload-hint text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {lesson?.video_url ? "Upload to replace existing video" : "Supported formats: MP4, WebM, etc."}
                </p>
              </Dragger>
            </Card>
            
            {lesson?.video_url && !videoFile && (
              <div className="mt-2 flex items-center">
                <VideoCameraOutlined className="mr-2 text-blue-500" />
                <Text type={isDarkMode ? "secondary" : ""} className={isDarkMode ? "text-gray-300" : ""}>
                  Current Video: 
                  <a 
                    href={lesson.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline"
                  >
                    {lesson.video_url.split('/').pop() || 'View current video'}
                  </a>
                </Text>
              </div>
            )}
          </Form.Item>
          
          <Form.Item
            label={
              <Space>
                <FilePdfOutlined className="text-blue-500" />
                <Text className={isDarkMode ? "text-white" : ""}>Document Upload</Text>
              </Space>
            }
          >
            <Card className={`${classes.upload} border border-dashed`}>
              <Dragger {...documentUploadProps} className="bg-transparent">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-blue-500" />
                </p>
                <p className={`ant-upload-text ${isDarkMode ? "text-white" : ""}`}>
                  Click or drag to upload document
                </p>
                <p className={`ant-upload-hint text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {lesson?.document_url ? "Upload to replace existing document" : "Supported formats: PDF, DOCX, TXT"}
                </p>
              </Dragger>
            </Card>
            
            {lesson?.document_url && !documentFile && (
              <div className="mt-2 flex items-center">
                <FilePdfOutlined className="mr-2 text-blue-500" />
                <Text type={isDarkMode ? "secondary" : ""} className={isDarkMode ? "text-gray-300" : ""}>
                  Current Document: 
                  <a 
                    href={lesson.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline"
                  >
                    {lesson.document_url.split('/').pop() || 'View current document'}
                  </a>
                </Text>
              </div>
            )}
          </Form.Item>
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              onClick={onClose}
              className={classes.button}
            >
              Cancel
            </Button>
            <Button 
              type="primary"
              onClick={showConfirm}
              loading={loading}
              icon={<SaveOutlined />}
              className={classes.primaryButton}
              disabled={!title || !description}
            >
              Update Lesson
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UpdateLessonModal;