import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  Typography,
  Space,
  Divider,
  Alert,
  Spin
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  SaveOutlined,
  RollbackOutlined
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    address: "",
    birthday: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  // Fetch user data on component mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setInitializing(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { fullname, phone, gender, address, birthday } = response.data;
        const formattedBirthday = birthday ? birthday.split("T")[0] : "";
        
        const userData = {
          fullname: fullname || "",
          phone: phone || "",
          gender: gender || "",
          address: address || "",
          birthday: formattedBirthday ? moment(formattedBirthday) : null,
        };
        
        setFormData(userData);
        form.setFieldsValue(userData);
      } catch (error) {
        setErrorMessage("Unable to retrieve user information.");
        message.error("Failed to load profile data");
      } finally {
        setInitializing(false);
      }
    };

    fetchUserData();
  }, [token, form]);

  // Improved validation rules
  const validateFullName = (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject("Please enter your full name");
    }
    if (value.trim().length < 2) {
      return Promise.reject("Full name must be at least 2 characters");
    }
    if (value.trim().length > 100) {
      return Promise.reject("Full name cannot exceed 100 characters");
    }
    if (!/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF\u0370-\u03FF\u0400-\u04FF]+$/.test(value)) {
      return Promise.reject("Full name should only contain letters and spaces");
    }
    return Promise.resolve();
  };

  // Improved phone validation for Vietnamese phone numbers
  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject("Please enter your phone number");
    }
    
    // Remove any spaces, dashes, parentheses for validation
    const cleanedValue = value.replace(/[\s\-()]/g, '');
    
    // Check if starts with 0
    if (!cleanedValue.startsWith('0')) {
      return Promise.reject("Phone number must start with 0");
    }
    
    // Check for valid length (10 digits for Vietnamese mobile numbers)
    if (cleanedValue.length !== 10) {
      return Promise.reject("Phone number must be exactly 10 digits");
    }
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanedValue)) {
      return Promise.reject("Phone number must contain only digits");
    }
    
    // Check for valid Vietnamese mobile prefixes
    const validPrefixes = ['03', '05', '07', '08', '09'];
    const prefix = cleanedValue.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      return Promise.reject("Invalid phone number prefix");
    }
    
    return Promise.resolve();
  };

  // Improved address validation
  const validateAddress = (_, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject("Please enter your address");
    }
    if (value.trim().length < 5) {
      return Promise.reject("Address must be at least 5 characters");
    }
    if (value.trim().length > 200) {
      return Promise.reject("Address cannot exceed 200 characters");
    }
    return Promise.resolve();
  };

  // Validate birthday
  const validateBirthday = (_, value) => {
    if (!value) {
      return Promise.reject("Please select your birthday");
    }
    
    // Check if user is at least 13 years old
    const thirteenYearsAgo = moment().subtract(13, 'years');
    if (value.isAfter(thirteenYearsAgo)) {
      return Promise.reject("You must be at least 13 years old");
    }
    
    // Check if birthdate is not too far in the past (e.g., 120 years)
    const tooOld = moment().subtract(120, 'years');
    if (value.isBefore(tooOld)) {
      return Promise.reject("Please enter a valid birth date");
    }
    
    return Promise.resolve();
  };

  // Birthday picker settings
  const disabledDate = (current) => {
    // Can't select days in the future
    return current && current > moment().endOf('day');
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setLoading(false);
      return;
    }
    
    // Format the date for the API
    const formattedData = {
      ...values,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
    };

    try {
      await axios.post(
        "http://localhost:3000/api/users/update-profile",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Profile updated successfully!");
      setErrorMessage("");
      message.success("Profile updated successfully!");

      // Navigate after delay
      setTimeout(() => {
        navigate("/userprofile");
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.message || "Failed to update profile. Please try again.";
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      } else {
        setErrorMessage("Network error occurred. Please check your connection.");
        message.error("Network error occurred. Please check your connection.");
      }
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" tip="Loading profile data..." />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <Card 
        style={{ 
          maxWidth: '800px', 
          width: '100%', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#1890ff', marginBottom: '24px' }}>
          Update Profile
        </Title>
        
        <Divider style={{ margin: '0 0 24px 0' }} />
        
        {successMessage && (
          <Alert
            message="Success"
            description={successMessage}
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        
        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formData}
          validateTrigger={["onChange", "onBlur"]}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="fullname"
              label="Full Name"
              rules={[{ validator: validateFullName }]}
              hasFeedback
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                placeholder="Enter your full name" 
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ validator: validatePhone }]}
              hasFeedback
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Enter your phone number" 
                maxLength={15}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select your gender' }]}
              hasFeedback
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
              rules={[{ validator: validateBirthday }]}
              hasFeedback
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                placeholder="Select your birthday"
                suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ validator: validateAddress }]}
            hasFeedback
          >
            <Input 
              prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your address" 
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space size="middle">
              <Button 
                icon={<RollbackOutlined />} 
                onClick={() => navigate('/userprofile')}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                Update Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateProfile;