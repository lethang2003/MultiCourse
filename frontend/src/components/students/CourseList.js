import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  Spin, 
  Input, 
  Select, 
  Slider, 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Avatar, 
  Tag, 
  Divider, 
  Modal, 
  Empty, 
  Badge, 
  Rate, 
  Layout, 
  message 
} from "antd";
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import FullScreenLoader from "../../FullScreenLoader";

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;

const CourseList = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [tutors, setTutors] = useState({});
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [studentsCount, setStudentsCount] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const categories = [
    "Programming",
    "Design",
    "Marketing",
    "Business",
    "Photography",
    "Music",
    "Education",
    "Healthcare",
    "Finance",
    "Engineering",
    "Science",
    "Art",
    "Literature",
    "Culinary",
    "Sports",
    "Agriculture",
    "Tourism",
    "Technology",
    "Manufacturing",
    "Architecture",
    "Journalism",
    "Law",
    "Psychology",
    "Film & Media",
    "Retail",
    "Transportation",
    "Environmental",
    "Fashion",
    "Real Estate",
    "Telecommunications"
  ];

    // Loading spinner
    const [navigating, setNavigating] = useState(false); // Kiểm soát hiển thị loading khi chuyển trang
  const [navigationTarget, setNavigationTarget] = useState(null); // Lưu địa chỉ trang đích
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
  }, []);

  const updateFilters = (type, value) => {
    setActiveFilters((prevFilters) => {
      const existingFilterIndex = prevFilters.findIndex(
        (filter) => filter.type === type
      );

      if (existingFilterIndex !== -1) {
        const updatedFilters = [...prevFilters];
        updatedFilters[existingFilterIndex] = { type, value };
        return updatedFilters;
      } else {
        return [...prevFilters, { type, value }];
      }
    });
  };

  const removeFilter = (type, value) => {
    setActiveFilters(
      activeFilters.filter(
        (filter) => !(filter.type === type && filter.value === value)
      )
    );

    switch (type) {
      case "search":
        setFilter("");
        break;
      case "sort":
        setSortOption("default");
        break;
      case "rating":
        setRatingFilter(0);
        break;
      case "price":
        setPriceRange([0, 1000000]);
        break;
      case "category":
        setSelectedCategory("");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const authToken = localStorage.getItem("authToken");

        const coursesResponse = await fetch(
          "http://localhost:3000/api/courses/active-courses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }
        );

        const coursesData = await coursesResponse.json();

        if (!coursesResponse.ok) {
          console.error("Error fetching courses:", coursesData.message);
          return;
        }

        let filteredCourses = coursesData;

        if (authToken) {
          const ordersResponse = await fetch(
            "http://localhost:3000/api/orders/my-orders",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const ordersData = await ordersResponse.json();

          if (!ordersResponse.ok) {
            return;
          }

          const purchasedCourseIds = new Set(
            ordersData.flatMap((order) =>
              order.order_items.map((item) => item.course._id)
            )
          );

          filteredCourses = coursesData.filter(
            (course) => !purchasedCourseIds.has(course._id)
          );
        }

        const maxCoursePrice = Math.max(
          ...filteredCourses.map((course) => course.price)
        );
        setMaxPrice(maxCoursePrice);
        setPriceRange([0, maxCoursePrice]);

        setCourses(filteredCourses);
        const studentCounts = {};
        await Promise.all(
          filteredCourses.map(async (course) => {
            const studentResponse = await fetch(
              `http://localhost:3000/api/courses/student-of-course/${course._id}`
            );
            const studentData = await studentResponse.json();

            if (studentResponse.ok) {
              studentCounts[course._id] = studentData.students.length;
            } else {
              console.error(
                `Error fetching students for course ${course._id}:`,
                studentData.message
              );
            }
          })
        );

        setStudentsCount(studentCounts);
        const uniqueTutorIds = [
          ...new Set(filteredCourses.map((course) => course.tutorId)),
        ];

        console.log("Unique tutor IDs:", uniqueTutorIds);

        const tutorsData = {};
        await Promise.all(
          uniqueTutorIds.map(async (tutorId) => {
            if (tutorId) {
              console.log(`Fetching tutor data for ID: ${tutorId}`);
              const tutorResponse = await fetch(
                `http://localhost:3000/api/tutors/${tutorId}`
              );
              const tutorData = await tutorResponse.json();
              if (tutorResponse.ok) {
                tutorsData[tutorId] = tutorData.fullname;
              } else {
                console.error(
                  `Error fetching tutor ${tutorId}:`,
                  tutorData.message
                );
              }
            }
          })
        );

        setTutors(tutorsData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/coursedetail/${id}`);
  };

  const handleAddToCart = async (courseId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    const newCartCount = cartCount + 1;
    setCartCount(newCartCount);
    localStorage.setItem("cartCount", newCartCount);

    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/add-to-cart/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        message.success("Add product to cart successfully");
      } else {
        message.error(`Error: ${data.message}`);
      }
    } catch (error) {
      message.error("Error, please try again!");
    }
  };

  const ratingCounts = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => ({
    rating,
    count: courses.filter((course) => (course.average_rating ?? 0) >= rating)
      .length,
  }));

  const filteredCourses = courses
    .filter((course) => {
      const titleMatch = course.title
        .toLowerCase()
        .includes(filter.toLowerCase());
      const tutorMatch = course.tutor?.fullname
        ?.toLowerCase()
        .includes(filter.toLowerCase());
      const priceMatch =
        course.price >= priceRange[0] && course.price <= priceRange[1];
      const ratingMatch = (course.average_rating ?? 0) >= ratingFilter;
      const categoryMatch =
        !selectedCategory ||
        course.category === selectedCategory;

      return (
        (titleMatch || tutorMatch) && priceMatch && ratingMatch && categoryMatch
      );
    })
    .sort((a, b) => {
      if (sortOption === "asc") return a.price - b.price;
      if (sortOption === "desc") return b.price - a.price;
      if (sortOption === "rating-asc")
        return (a.average_rating ?? 0) - (b.average_rating ?? 0);
      if (sortOption === "rating-desc")
        return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      return 0;
    });

  const renderCategoryDropdown = () => (
    <Select
      placeholder="Select Category"
      style={{ width: "100%" }}
      value={selectedCategory || undefined}
      onChange={(value) => {
        setSelectedCategory(value);
        updateFilters("category", value);
      }}
    >
      {categories.map(category => (
        <Select.Option key={category} value={category}>{category}</Select.Option>
      ))}
    </Select>
  );

  const handleClearFilters = () => {
    setFilter("");
    setSortOption("default");
    setPriceRange([0, maxPrice]);
    setRatingFilter(0);
    setSelectedCategory("");
    setActiveFilters([]);
  };


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
        onNavigate={() => {performNavigation()}}
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Spin spinning={spinning} tip="Loading..." size="large" />
      
      <Content style={{ padding: "24px", width: 1200, margin: "0 auto" }}>
        <Card style={{ marginBottom: 24 }} title={<Title level={4}>Course List</Title>}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Search and Filter Section */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Input
                  placeholder="Search by course or tutor name..."
                  value={filter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter(value);
                    if (value) {
                      updateFilters("search", value);
                    } else {
                      removeFilter("search", "");
                    }
                  }}
                  prefix={<SearchOutlined />}
                  size="large"
                />
              </Col>
              <Col xs={12} md={6}>
                <Select
                  style={{ width: "100%" }}
                  value={sortOption}
                  onChange={(value) => {
                    setSortOption(value);
                    updateFilters("sort", value);
                  }}
                  size="large"
                >
                  <Option value="default">Sort by</Option>
                  <Option value="asc">Price Low to High</Option>
                  <Option value="desc">Price High to Low</Option>
                  <Option value="rating-asc">Rating Low to High</Option>
                  <Option value="rating-desc">Rating High to Low</Option>
                </Select>
              </Col>
              <Col xs={12} md={6}>
                <Select
                  style={{ width: "100%" }}
                  value={ratingFilter}
                  onChange={(value) => {
                    setRatingFilter(value);
                    if (value > 0) {
                      updateFilters("rating", `From ${value} ★`);
                    } else {
                      removeFilter("rating", "");
                    }
                  }}
                  size="large"
                >
                  <Option value={0}>All Rating</Option>
                  {ratingCounts.map(({ rating, count }) => (
                    <Option key={rating} value={rating}>
                      From {rating} ★ ({count})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>
                  Price: ${priceRange[0]} - {priceRange[1] >= maxPrice ? "All" : `$${priceRange[1]}`}
                </Text>
                <Slider
                  range
                  min={0}
                  max={maxPrice}
                  step={10000}
                  value={priceRange}
                  onChange={(value) => {
                    if (value[1] >= maxPrice) {
                      setPriceRange([value[0], maxPrice]);
                      updateFilters("price", `$${value[0]} - All`);
                    } else {
                      setPriceRange(value);
                      updateFilters("price", `$${value[0]} - $${value[1]}`);
                    }
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                {renderCategoryDropdown()}
              </Col>
            </Row>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Space wrap>
                  {activeFilters.map((filter, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      closable
                      onClose={() => removeFilter(filter.type, filter.value)}
                    >
                      {filter.value}
                    </Tag>
                  ))}
                  <Button 
                    type="primary" 
                    danger
                    icon={<ReloadOutlined />} 
                    onClick={handleClearFilters}
                  >
                    Reset All
                  </Button>
                </Space>
              </div>
            )}

            <Row justify="end">
              <Col>
                <Text type="secondary">
                  Found {filteredCourses.length} courses
                </Text>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Course Listing */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Loading courses...</Text>
              </div>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
                    <Badge.Ribbon 
                      text={`$${course.price}`} 
                      color="cyan"
                    >
                      <Card
                        hoverable
                        onClick={() => handleCourseClick(course._id)}
                        cover={
                          <img
                            alt={course.title}
                            src={course.image}
                            style={{ height: 180, objectFit: "cover" }}
                          />
                        }
                        actions={[
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(course._id);
                            }}
                          >
                            Add to Cart
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={<Text strong style={{ color: "#1890ff" }}>{course.title}</Text>}
                          description={
                            <>
                              <Tag color="geekblue">{course.category}</Tag>
                              <div style={{ marginTop: 8 }}>
                                <Rate 
                                  disabled 
                                  allowHalf 
                                  defaultValue={course.average_rating || 0} 
                                />
                                <Text type="secondary"> ({course.comments.length})</Text>
                              </div>
                              
                              {course.tutor && (
                                <div style={{ marginTop: 16, display: "flex", alignItems: "center" }}>
                                  <Avatar 
                                    src={course.tutor.avatar} 
                                    size="large"
                                    icon={!course.tutor.avatar && <UserOutlined />}
                                  />
                                  <div style={{ marginLeft: 12 }}>
                                    <Text strong>{course.tutor.fullname}</Text>
                                    <div>
                                      <Text type="secondary">
                                        {studentsCount[course._id] || 0} students
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          }
                        />
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty
                    description="No courses match your filters"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </Empty>
                </Col>
              )}
            </Row>
          )}
        </div>
      </Content>

      {/* Login Required Modal */}
      <Modal
        title="Login Required"
        open={showLoginPopup}
        onCancel={() => setShowLoginPopup(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLoginPopup(false)}>
            Cancel
          </Button>,
          <Button
            key="login"
            type="primary"
            onClick={() => {
              setShowLoginPopup(false);
              navigate("/login");
            }}
          >
            Login Now
          </Button>,
        ]}
      >
        <p>You need to log in to add courses to your cart.</p>
      </Modal>
    </Layout>
  );
};

export default CourseList;