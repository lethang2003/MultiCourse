import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UpdateCourseModal from "./UpdateCourseModal";
import { useTheme } from "../context/ThemeContext";
import FullScreenLoader from "../../FullScreenLoader";
import {
  Button,
  Spin,
  Breadcrumb,
  Modal,
  message,
  Dropdown,
  Space,
  Card,
  Tag,
  Typography,
  Empty,
  Skeleton,
  Select,
  Row,
  Col,
  Slider,
  Input,
  Divider,
  Collapse,
  Form,
  Radio,
} from "antd";
import {
  HomeOutlined,
  MoreOutlined,
  FilterOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { Edit, Trash2, Eye, Filter, SlidersHorizontal, X } from "lucide-react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Search } = Input;

const CourseListForTutor = () => {
  const [courses, setCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const token = localStorage.getItem("authToken");
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loadingImage, setLoadingImage] = useState({});

  // Loading spinner
  const [navigating, setNavigating] = useState(false); // Kiểm soát hiển thị loading khi chuyển trang
  const [navigationTarget, setNavigationTarget] = useState(null); // Lưu địa chỉ trang đích

  // Filter states
  const [filterVisible, setFilterVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    priceRange: [0, 10000000],
    sortBy: "newest",
  });

  // useEffect(() => {
  //   setSpinning(true);
  //   let ptg = -10;
  //   const interval = setInterval(() => {
  //     ptg += 5;
  //     setPercent(ptg);
  //     if (ptg > 20) {
  //       clearInterval(interval);
  //       setSpinning(false);
  //       setPercent(0);
  //     }
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, []);

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchTutorCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("Please log in to view your courses.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          "https://multicourse-q1mn.onrender.com/api/courses/course-of-tutor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCourses(response.data);
          console.log("Courses:", response.data);
          setDisplayedCourses(response.data);

          // Extract unique categories
          const uniqueCategories = [
            ...new Set(response.data.map((course) => course.category)),
          ];
          setCategories(uniqueCategories);

          // Set initial price range
          if (response.data.length > 0) {
            const prices = response.data.map((course) => course.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setFilters((prev) => ({
              ...prev,
              priceRange: [minPrice, maxPrice],
            }));
          }
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "An error occurred while fetching courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutorCourses();
  }, [navigate]);

  // Apply filters when filters or search changes
  useEffect(() => {
    if (courses.length === 0) return;

    let filtered = [...courses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (course) => course.category === filters.category
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      const statusValue = filters.status === "available";
      filtered = filtered.filter((course) => course.status === statusValue);
    }

    // Apply price range filter
    filtered = filtered.filter(
      (course) =>
        course.price >= filters.priceRange[0] &&
        course.price <= filters.priceRange[1]
    );

    // Apply sorting
    if (filters.sortBy === "newest") {
      // Assuming courses have a 'createdAt' field
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else if (filters.sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "a-z") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "z-a") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    setDisplayedCourses(filtered);
  }, [courses, filters, searchQuery]);

  const handleDeleteCourse = async (courseId) => {
    Modal.confirm({
      title: "Confirm Course Deletion",
      content: "Are you sure you want to delete this course?",
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",
      centered: true,
      maskClosable: true,
      className: "custom-modal",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `https://multicourse-q1mn.onrender.com/api/courses/delete-course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 201) {
            message.success("Request delete course successfully.");
            // setCourses((prevCourses) =>
            //   prevCourses.filter((course) => course._id !== courseId)
            // );
          }
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error(
            error.response?.data?.message || "Failed to request delete course."
          );
        }
      },
    });
  };

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
  };

  const handleUpdateCourse = async (updatedCourse) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `https://multicourse-q1mn.onrender.com/api/courses/update-course/${updatedCourse._id}`,
        updatedCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === updatedCourse._id
              ? { ...course, ...response.data }
              : course
          )
        );

        handleCloseModal();
        message.success("Send request to admin successfully!");
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Send request to admin fail."
      );
    }
  };

  const handleUpdateImage = async (courseId, imageFile) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", imageFile);
    if (!imageFile) return;

    setLoadingImage((prev) => ({ ...prev, [courseId]: true }));

    try {
      const response = await axios.put(
        `https://multicourse-q1mn.onrender.com/api/courses/update-course-image/${courseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId ? response.data : course
          )
        );
        setLoadingImage((prev) => ({ ...prev, [courseId]: false }));
        message.success("Update image successfully!");
      }
    } catch (error) {
      setLoadingImage((prev) => ({ ...prev, [courseId]: false }));
      message.error("Update image fail.");
    }
  };

  const getDropdownItems = (course) => {
    return [
      {
        key: "1",
        label: (
          <div className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 px-2 py-1">
            <Edit size={16} /> <span>Update Info</span>
          </div>
        ),
        onClick: () => handleOpenModal(course),
      },
      {
        key: "2",
        label: (
          <div className="flex items-center space-x-2 text-red-500 hover:text-red-600 px-2 py-1">
            <Trash2 size={16} /> <span>Delete</span>
          </div>
        ),
        onClick: () => handleDeleteCourse(course._id),
      },
      {
        key: "3",
        label: (
          <div className="flex items-center space-x-2 text-green-500 hover:text-green-600 px-2 py-1">
            <Eye size={16} /> <span>View Details</span>
          </div>
        ),
        onClick: () =>
          handleNavigateWithLoading(`/courses-list-tutor/${course._id}`),
      },
    ];
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    const prices = courses.map((course) => course.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    setFilters({
      category: "all",
      status: "all",
      priceRange: [minPrice, maxPrice],
      sortBy: "newest",
    });
    setSearchQuery("");
  };
  // const handleLoadingComplete = () => {
  //   console.log('Loading complete!');
  //   // You can perform additional actions here
  // };

  //load

  const handleNavigateWithLoading = (path) => {
    setNavigating(true);
    setNavigationTarget(path);
  };

  const performNavigation = () => {
    if (navigationTarget) {
      navigate(navigationTarget);
    }
    setNavigating(false);
    setNavigationTarget(null);
  };

  if (initialLoading) {
    return (
      <FullScreenLoader
        message="Preparing Your Courses"
        description="Loading your educational content"
        duration={2000}
        onNavigate={() => {
          performNavigation();
        }}
      />
    );
  }

  return (
    <div
      className={`p-6 min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* <Spin spinning={spinning} fullscreen /> */}
      {/* {loading && (
        <FullScreenLoader 
          message="Loading Your Courses" 
          description="Please wait while we fetch your course data"
          showProgress={true}
          minDuration={2000}
          onComplete={handleLoadingComplete}
        />
      )} */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { title: <HomeOutlined />, href: "/" },
            { title: "Dashboard", href: "/dashboard" },
            { title: "My Courses" },
          ]}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Title
          level={2}
          className={`${
            theme === "dark" ? "text-white" : "text-gray-800"
          } mb-0`}
        >
          My Courses
        </Title>
        <div className="flex space-x-3">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
            className={`${
              filterVisible ? "bg-blue-50 text-blue-500 border-blue-200" : ""
            }`}
          >
            Filter
          </Button>
          {/* <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 border-none"
            onClick={() => navigate("/createcourse")}
          >
            Create New Course
          </Button> */}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div
        className={`mb-6 transition-all duration-300 ${
          filterVisible ? "block" : "hidden"
        }`}
      >
        <Card
          className={`${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <Title level={5} className="m-0">
              Filters
            </Title>
            <Button
              type="text"
              icon={<X size={16} />}
              onClick={resetFilters}
              className="flex items-center"
            >
              Reset
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <div className="mb-1">
                <Text strong>Search</Text>
              </div>
              <Input
                placeholder="Search by title or description"
                allowClear
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>

            <Col xs={24} md={12} lg={6}>
              <div className="mb-1">
                <Text strong>Category</Text>
              </div>
              <Select
                style={{ width: "100%" }}
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
              >
                <Option value="all">All Categories</Option>
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <div className="mb-1">
                <Text strong>Status</Text>
              </div>
              <Select
                style={{ width: "100%" }}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              >
                <Option value="all">All Status</Option>
                <Option value="available">Available</Option>
                <Option value="unavailable">Not Available</Option>
              </Select>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <div className="mb-1">
                <Text strong>Sort By</Text>
              </div>
              <Select
                style={{ width: "100%" }}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
              >
                <Option value="newest">Newest</Option>
                <Option value="price-low">Price: Low to High</Option>
                <Option value="price-high">Price: High to Low</Option>
                <Option value="a-z">Title: A to Z</Option>
                <Option value="z-a">Title: Z to A</Option>
              </Select>
            </Col>

            <Col span={24}>
              <div className="mb-1">
                <Text strong>Price Range</Text>
              </div>
              <Row>
                <Col span={24}>
                  <Slider
                    range
                    min={0}
                    max={10000000}
                    step={100000}
                    value={filters.priceRange}
                    onChange={(value) =>
                      handleFilterChange("priceRange", value)
                    }
                    tooltip={{
                      formatter: (value) =>
                        `${new Intl.NumberFormat("vi-VN").format(value)} VND`,
                    }}
                  />
                </Col>
                <Col span={24} className="flex justify-between">
                  <Text>
                    {new Intl.NumberFormat("vi-VN").format(
                      filters.priceRange[0]
                    )}{" "}
                    VND
                  </Text>
                  <Text>
                    {new Intl.NumberFormat("vi-VN").format(
                      filters.priceRange[1]
                    )}{" "}
                    VND
                  </Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Results counter */}
      {!loading && (
        <div className="mb-4 flex justify-between items-center">
          <Text
            className={`${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Showing {displayedCourses.length} of {courses.length} courses
          </Text>
          {displayedCourses.length !== courses.length && (
            <Button type="text" onClick={resetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{errorMessage}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <Skeleton loading active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      ) : displayedCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => (
            <Card
              key={course._id}
              className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
              }`}
              actions={[
                <Button
                  type="text"
                  className="flex items-center justify-center"
                  onClick={() => handleOpenModal(course)}
                >
                  <Edit size={16} className="mr-1" /> Update
                </Button>,
                <Button
                  type="text"
                  className="flex items-center justify-center text-red-500"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>,
                <Button
                  type="text"
                  className="flex items-center justify-center text-green-500"
                  onClick={() => navigate(`/courses-list-tutor/${course._id}`)}
                >
                  <Eye size={16} className="mr-1" /> View
                </Button>,
              ]}
              cover={
                <div className="h-48 relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    id={`upload-image-${course._id}`}
                    className="hidden"
                    onChange={(e) =>
                      handleUpdateImage(course._id, e.target.files[0])
                    }
                  />
                  <div
                    className="h-full cursor-pointer group relative"
                    onClick={() =>
                      document
                        .getElementById(`upload-image-${course._id}`)
                        .click()
                    }
                  >
                    {loadingImage[course._id] ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Spin size="large" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-medium">
                            Change Image
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              }
            >
              <div className="px-2">
                <div className="flex justify-between items-start mb-2">
                  <Title
                    level={4}
                    className="!mb-0 text-blue-600 truncate"
                    style={{ maxWidth: "70%" }}
                  >
                    {course.title}
                  </Title>
                  <Tag color={course.status ? "success" : "error"}>
                    {course.status ? "Available" : "Not Available"}
                  </Tag>
                </div>

                <Text type="secondary" className="block mb-2">
                  {course.category}
                </Text>

                <Paragraph
                  className="mb-3 text-gray-700 line-clamp-2"
                  ellipsis={{ rows: 2 }}
                >
                  {course.description}
                </Paragraph>

                <div className="flex justify-between items-center">
                  <Text strong className="text-lg text-blue-700">
                    {new Intl.NumberFormat("vi-VN").format(course.price)} VND
                  </Text>
                  <Dropdown
                    menu={{ items: getDropdownItems(course) }}
                    placement="bottomRight"
                    trigger={["click"]}
                    className="md:hidden"
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-lg font-medium text-gray-600">
              {courses.length > 0
                ? "No courses match your current filters."
                : "You have no courses at the moment."}
            </span>
          }
        >
          {courses.length > 0 ? (
            <Button onClick={resetFilters}>Clear Filters</Button>
          ) : (
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 border-none"
              onClick={() => navigate("/createcourse")}
            >
              Create Your First Course
            </Button>
          )}
        </Empty>
      )}

      {isModalOpen && selectedCourse && (
        <UpdateCourseModal
          course={selectedCourse}
          onClose={handleCloseModal}
          onUpdate={handleUpdateCourse}
        />
      )}
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default CourseListForTutor;
