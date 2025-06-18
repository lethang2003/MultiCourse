import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Dropdown, Table, Tag, Modal, Input, Space, Select, Card, Typography, Row, Col, Progress, message as antMessage } from "antd";
import { 
  EllipsisOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FireOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { CheckOutlined, StopOutlined, EyeOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

const CourseListForAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    tutor: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });
  const [tutors, setTutors] = useState([]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://localhost:3000/api/courses/all-courses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(response.data);
      
      // Extract unique tutors for filter dropdown
      const uniqueTutors = [...new Set(response.data.map(course => course.tutor.fullname))];
      setTutors(uniqueTutors);
      //  antMessage.success("Courses loaded successfully");
       
     
    } catch (err) {
      setError("Error loading course list.");
      // antMessage.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
   
  }, []);

  // Advanced course statistics
  const totalCourses = courses.length;
  const activeCourses = courses.filter(course => course.status).length;
  const inactiveCourses = totalCourses - activeCourses;
  const activePercentage = totalCourses > 0 ? Math.round((activeCourses / totalCourses) * 100) : 0;
  
  // Get unique tutors count
  const uniqueTutorsCount = new Set(courses.map(course => course.tutor._id)).size;
  
  // Find most popular course (this is a placeholder - you might want to add actual view/enrollment counts to your data)
  const mostPopularCourse = courses.length > 0 ? 
    courses.reduce((prev, current) => (prev.views > current.views) ? prev : current) : 
    null;

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <SortAscendingOutlined className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <SortAscendingOutlined />
    ) : (
      <SortAscendingOutlined className="rotate-180" />
    );
  };

  // Apply filters and search
  const filteredData = courses.filter(course => {
    // Text search
    const matchesSearch = 
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.tutor.fullname.toLowerCase().includes(searchText.toLowerCase());

    // Status filter
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'active' && course.status) ||
      (filters.status === 'inactive' && !course.status);

    // Tutor filter
    const matchesTutor = 
      filters.tutor === 'all' || 
      course.tutor.fullname === filters.tutor;

    return matchesSearch && matchesStatus && matchesTutor;
  });

  // Apply sorting
  const sortedData = sortConfig.key
    ? [...filteredData].sort((a, b) => {
        let valueA, valueB;
        
        if (sortConfig.key === 'title') {
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
        } else if (sortConfig.key === 'tutor') {
          valueA = a.tutor.fullname.toLowerCase();
          valueB = b.tutor.fullname.toLowerCase();
        } else if (sortConfig.key === 'status') {
          valueA = a.status ? 1 : 0;
          valueB = b.status ? 1 : 0;
        } else {
          valueA = a[sortConfig.key];
          valueB = b[sortConfig.key];
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  const columns = [
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
          Course Name 
          {/* {getSortIcon('title')} */}
        </div>
      ),
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (title, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600 font-bold">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <a 
              href={`/courses-list-for-admin/${record._id}`} 
              className="text-blue-600 hover:text-blue-800 transition-colors font-semibold"
            >
              {title}
            </a>
            <p className="text-xs text-gray-500 mt-1">
              {record.description && record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('tutor')}>
          Tutor 
          {/* {getSortIcon('tutor')} */}
        </div>
      ),
      dataIndex: "tutor",
      key: "tutor",
      sorter: true,
      render: (tutor) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
            <span className="text-green-600 font-bold">
              {tutor.fullname.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-700">{tutor.fullname}</span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
          Status 
          {/* {getSortIcon('status')} */}
        </div>
      ),
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status) => (
        status 
        ? <Tag color="success" icon={<CheckOutlined />} className="px-3 py-1">Active</Tag>
        : <Tag color="error" icon={<StopOutlined />} className="px-3 py-1">Inactive</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <DropDownMenu 
          record={record} 
          setCourses={setCourses} 
          courses={courses}
          fetchCourses={fetchCourses}
        />  
      ),
    },
  ];

  const data = sortedData.map((course) => ({
    key: course._id,
    ...course,
  }));

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            className="w-16 h-16 text-blue-600 mx-auto"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25"
            ></circle>
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="text-blue-600"
            ></path>
          </svg>
        </div>
        <p className="text-gray-600 text-lg">Loading Courses...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen bg-red-50">
      <div className="text-center">
        <div className="mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-red-600 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <p className="text-red-600 text-xl mb-2">Oops! Something went wrong</p>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <BookOutlined className="text-blue-600 mr-3" />
            Course Management
          </h2>
          <div className="flex space-x-4">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchCourses}
              className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Course Statistics */}
        <div className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-md h-full overflow-hidden">
                <div className="relative">
                  <BookOutlined className="absolute right-0 top-0 text-4xl text-blue-300 opacity-50" />
                  <div>
                    <Text className="text-gray-600 block text-sm mb-1">Total Courses</Text>
                    <div className="flex items-baseline">
                      <Title level={2} className="text-blue-700 m-0">{totalCourses}</Title>
                      <Text className="ml-2 text-blue-700 opacity-70">courses</Text>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Course Status Distribution</span>
                      <span>{activePercentage}% Active</span>
                    </div>
                    <Progress 
                      percent={activePercentage} 
                      showInfo={false}
                      strokeColor="#3B82F6"
                      trailColor="#EFF6FF"
                      strokeWidth={8}
                      className="custom-progress"
                    />
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-md h-full overflow-hidden">
                <div className="relative">
                  <CheckCircleOutlined className="absolute right-0 top-0 text-4xl text-green-300 opacity-50" />
                  <div>
                    <Text className="text-gray-600 block text-sm mb-1">Active Courses</Text>
                    <div className="flex items-baseline">
                      <Title level={2} className="text-green-700 m-0">{activeCourses}</Title>
                      <Text className="ml-2 text-green-700 opacity-70">
                        ({totalCourses > 0 ? ((activeCourses/totalCourses)*100).toFixed(1) : 0}%)
                      </Text>
                    </div>
                    <Text className="text-gray-500 text-sm mt-2 block">
                      {uniqueTutorsCount} {uniqueTutorsCount === 1 ? 'tutor' : 'tutors'} contributing
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-md h-full overflow-hidden">
                <div className="relative">
                  <CloseCircleOutlined className="absolute right-0 top-0 text-4xl text-red-300 opacity-50" />
                  <div>
                    <Text className="text-gray-600 block text-sm mb-1">Inactive Courses</Text>
                    <div className="flex items-baseline">
                      <Title level={2} className="text-red-700 m-0">{inactiveCourses}</Title>
                      <Text className="ml-2 text-red-700 opacity-70">
                        ({totalCourses > 0 ? ((inactiveCourses/totalCourses)*100).toFixed(1) : 0}%)
                      </Text>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Button 
                        size="small" 
                        type="text"
                        className="p-0 text-red-700 text-sm hover:text-red-800"
                        onClick={() => handleFilterChange('status', 'inactive')}
                      >
                        View Inactive Courses →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-4 w-full sm:w-auto">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search courses by name or tutor"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center ${showFilterPanel ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-600 border-gray-300'}`}
            >
              Filters
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Text className="text-gray-500">
              {data.length} {data.length === 1 ? 'course' : 'courses'} found
            </Text>
          </div>
        </div>

        {showFilterPanel && (
          <Card className="mb-6 bg-gray-50 border border-gray-200">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text className="block mb-2 text-gray-500">Status</Text>
                  <Select
                    value={filters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">All Statuses</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text className="block mb-2 text-gray-500">Tutor</Text>
                  <Select
                    value={filters.tutor}
                    onChange={(value) => handleFilterChange('tutor', value)}
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="all">All Tutors</Option>
                    {tutors.map((tutor, index) => (
                      <Option key={index} value={tutor}>{tutor}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={24} md={12} className="flex items-end justify-end">
                <Button
                  onClick={() => {
                    setFilters({ status: 'all', tutor: 'all' });
                    setSearchText('');
                  }}
                  className="mr-2"
                >
                  Clear Filters
                </Button>
                <Button
                  type="primary"
                  className="bg-blue-600"
                  onClick={() => setShowFilterPanel(false)}
                >
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`
          }}
          className="w-full"
          scroll={{ x: 600 }}
        />
      </div>
      <ToastContainer />
    </div>
  );
};  

// Dropdown Menu Component (kept mostly the same as previous implementation)
const DropDownMenu = ({record, setCourses, courses, fetchCourses}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  // Fixed version: renamed the parameter to avoid conflict with antMessage
  const toggleCourseStatus = async (courseId, status = "", reasonMsg = "") => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/change-course-status/${courseId}`,
        { status, message: reasonMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     
      // Update the local state
      setCourses(prevCourses => 
        prevCourses.map((course) =>
          course._id === courseId ? { ...course, status: !course.status } : course
        )
      );
      
      fetchCourses();
  
      setIsModalOpen(false);
      setRejectReason("");
      antMessage.success(
        status === "Rejected" 
          ? "Course rejected successfully." 
          : "Course status updated successfully."
      );
    } catch (err) {
      console.log(err);
      antMessage.error("Error changing course status.");
    }
  };

  const handleStatusToggleClick = () => {
    if (record.status) {
      setIsModalOpen(true);
    } else {
      toggleCourseStatus(record.key);
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <div 
          onClick={handleStatusToggleClick}
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-150"
        >
          {record.status ? (
            <>
              <StopOutlined className="h-4 w-4 text-red-500"/>
              <span>Ban Course</span>
            </>
          ) : (
            <>
              <CheckOutlined className="h-4 w-4 text-green-500" />
              <span>Activate Course</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div 
          onClick={() => navigate(`/courses-list-for-admin/${record._id}`)}
          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150 cursor-pointer"
        >
          <EyeOutlined className="h-4 w-4 mr-2" />
          View Details
        </div>
      ),
    },
  ];

  return(
    <div>
      <Dropdown menu={{items}} trigger={['click']}>
        <Button 
          type="text" 
          icon={<EllipsisOutlined />} 
          className="hover:bg-gray-100 rounded-full"
        />
      </Dropdown>

      <Modal
        title="Course Rejection"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger
            onClick={() => toggleCourseStatus(record.key, "Rejected", rejectReason)}
            disabled={!rejectReason.trim()}
          >
            
            Ban Course
          </Button>,
        ]}
      >
        <div className="mb-4">
          <p className="mb-2 text-gray-600">
            Please provide a reason for banning this course:
          </p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter detailed reason for course ban..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default CourseListForAdmin;