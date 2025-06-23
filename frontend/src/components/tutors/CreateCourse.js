import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  Button, 
  Typography, 
  Alert, 
  Spin, 
  Progress, 
  Card, 
  message 
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateCourse = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const { theme } = useTheme();
  const [fileList, setFileList] = useState([]);

  const categories = {
    "Business & Economics": [
      "Digital Marketing (SEO, Google Ads, Facebook Ads)",
      "Entrepreneurship & Startups",
      "E-commerce (Shopify, Amazon, Shopee)",
      "Financial Management & Investment",
      "Human Resources (HR) & Recruitment",
      "Project Management (Agile, Scrum, PMP)",
      "Business Strategy & Consulting",
      "Supply Chain & Logistics",
      "Stock Market & Cryptocurrency",
      "Marketing",
      "Others",
    ],
    "Design & Multimedia": [
      "Graphic Design (Photoshop, Illustrator)",
      "UI/UX Design (Figma, Adobe XD)",
      "3D Modeling & Animation",
      "Video Editing & Production",
      "Motion Graphics",
      "Interior Design",
      "Fashion Design",
      "Game Design",
      "Design",
      "Others",
    ],
    "Languages & Linguistics": [
      "English for Business & Communication",
      "TOEIC, IELTS, TOEFL Preparation",
      "French, German, Spanish, Japanese, Chinese",
      "Vietnamese for Foreigners",
      "Translation & Interpretation",
      "Academic Writing & Research Skills",
      "Others",
    ],
    "Soft Skills": [
      "Communication Skills",
      "Public Speaking & Presentation",
      "Leadership & Management",
      "Emotional Intelligence",
      "Time Management",
      "Negotiation & Persuasion",
      "Teamwork & Collaboration",
      "Critical Thinking & Problem-Solving",
      "Stress Management & Resilience",
      "Creativity & Innovation",
      "Others",
    ],
    "Engineering & Technology": [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Artificial Intelligence & Machine Learning",
      "Data Science & Big Data",
      "Cybersecurity",
      "Cloud Computing",
      "Blockchain Technology",
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Robotics & Automation",
      "Networking & IT Security",
      "Embedded Systems",
      "Programming",
      "Others",
    ],
  };
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      message.error("Please log in to create a course");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [navigate]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/"); // Chỉ nhận file bắt đầu bằng "image/"
    
    if (!isImage) {
      message.error("Only image files (JPG, PNG, JPEG) are allowed!");
      return Upload.LIST_IGNORE; // Chặn file không hợp lệ
    }
  
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
  
    return true; // Cho phép upload file hợp lệ
  };
  

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setImagePreview(file.url || file.preview);
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      handlePreview(fileList[0]);
    } else {
      setImagePreview(null);
    }
  };

  const onFinish = async (values) => {
    if (!fileList.length) {
      message.error("Please upload an image");
      return;
    }
  
    try {
      setIsSubmitting(true);
      setSpinning(true);
      setErrorMessage(null);
      setPercent(0);
  
      let ptg = 0;
      const interval = setInterval(() => {
        ptg += 5;
        setPercent(ptg);
        if (ptg >= 100) {
          clearInterval(interval);
        }
      }, 100);
  
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("category", values.category);
      formData.append("image", fileList[0].originFileObj);
  
      await axios.post(
        "https://multicourse-q1mn.onrender.com/api/courses/create-course",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
  
      message.success("Course created successfully!");
      form.resetFields();
      setFileList([]);
      setImagePreview(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred";
      setErrorMessage(errorMsg);
      message.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSpinning(false);
      setPercent(100);
    }
  };
  
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="mt-2">Upload</div>
    </div>
  );

  return (
    <div className={`min-h-screen px-4 py-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      {spinning && <Spin spinning={spinning} tip={`Uploading... ${percent}%`}>
        <Progress percent={percent} status="active" />
      </Spin>}
      
      <Card 
        bordered={false} 
        className={`w-full max-w-2xl mx-auto shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        <Title level={2} className={`mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          Create New Course
        </Title>

        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="w-full"
        >
          <Form.Item
            name="title"
            label={<Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Course Title</Text>}
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input size="large" placeholder="Enter course title" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Description</Text>}
            rules={[{ required: true, message: "Please enter course description" }]}
          >
            <TextArea rows={4} placeholder="Enter course description" />
          </Form.Item>

          <Form.Item
            name="price"
            label={<Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Price</Text>}
            rules={[
              { required: true, message: "Please enter course price" },
              { type: "number", min: 0, message: "Price cannot be negative" }
            ]}
          >
            <InputNumber
              size="large"
              min={0}
              placeholder="Enter price"
              className="w-full"
              formatter={value => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/VND\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={<Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Category</Text>}
            rules={[{ required: true, message: "Please select a category" }]}
          >
      <Select size="large" placeholder="Select category" className="w-64">
      <Select.Option value="Programming">Programming</Select.Option>
      <Select.Option value="Design">Design</Select.Option>
      <Select.Option value="Marketing">Marketing</Select.Option>
      <Select.Option value="Business">Business</Select.Option>
      <Select.Option value="Photography">Photography</Select.Option>
      <Select.Option value="Music">Music</Select.Option>
      <Select.Option value="Education">Education</Select.Option>
      <Select.Option value="Healthcare">Healthcare</Select.Option>
      <Select.Option value="Finance">Finance</Select.Option>
      <Select.Option value="Engineering">Engineering</Select.Option>
      <Select.Option value="Science">Science</Select.Option>
      <Select.Option value="Art">Art</Select.Option>
      <Select.Option value="Literature">Literature</Select.Option>
      <Select.Option value="Culinary">Culinary</Select.Option>
      <Select.Option value="Sports">Sports</Select.Option>
      <Select.Option value="Agriculture">Agriculture</Select.Option>
      <Select.Option value="Tourism">Tourism</Select.Option>
      <Select.Option value="Technology">Technology</Select.Option>
      <Select.Option value="Manufacturing">Manufacturing</Select.Option>
      <Select.Option value="Architecture">Architecture</Select.Option>
      <Select.Option value="Journalism">Journalism</Select.Option>
      <Select.Option value="Law">Law</Select.Option>
      <Select.Option value="Psychology">Psychology</Select.Option>
      <Select.Option value="Film">Film & Media</Select.Option>
      <Select.Option value="Retail">Retail</Select.Option>
      <Select.Option value="Transportation">Transportation</Select.Option>
      <Select.Option value="Environmental">Environmental</Select.Option>
      <Select.Option value="Fashion">Fashion</Select.Option>
      <Select.Option value="Real Estate">Real Estate</Select.Option>
      <Select.Option value="Telecommunications">Telecommunications</Select.Option>
    </Select>
          </Form.Item>

          <Form.Item
  name="image"
  label={<Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Course Image</Text>}
  valuePropName="fileList"
  getValueFromEvent={normFile}
  rules={[{ required: true, message: "Please upload an image" }]}
  validateStatus={fileList.length === 0 ? "error" : ""}
  // help={fileList.length === 0 ? "Please upload an image" : ""}
>
  <Upload
    listType="picture-card"
    fileList={fileList}
    onPreview={handlePreview}
    onChange={handleChange}
    beforeUpload={beforeUpload} // Kiểm tra file trước khi upload
    maxCount={1}
  >
    {fileList.length >= 1 ? null : uploadButton}
  </Upload>
</Form.Item>



          {imagePreview && (
            <div className="mb-6">
              <Text className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Image Preview</Text>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className=" w-full h-12 text-lg"
              loading={isSubmitting}
              icon={<UploadOutlined />}
            >
              {isSubmitting ? "Creating Course..." :"Create Course"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default CreateCourse;