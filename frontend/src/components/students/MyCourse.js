import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, 
  Typography, 
  Input, 
  Card, 
  Button, 
  Row, 
  Col, 
  Spin, 
  Empty, 
  Progress, 
  Tag, 
  Modal, 
  Tabs, 
  message, 
  Statistic, 
  Dropdown,
  Menu,
  Skeleton,
  Tooltip,
  Select
} from "antd";
import { 
  SearchOutlined, 
  AppstoreOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  HeartOutlined,
  HeartFilled,
  MoreOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Meta } = Card;
const { TabPane } = Tabs;
const { Option } = Select;

const MyCourses = () => {
  const [orders, setOrders] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    certified: 0
  });

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `https://multicourse-q1mn.onrender.com/api/certificates/get-all-certificates`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCertificates(data.certificates || []);
        }
      } catch (error) {
        console.log("Error fetching certificates");
      }
    };

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favoriteCourses");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    fetchCertificates();
  }, []);

  useEffect(() => {
    const fetchOrdersAndProgress = async () => {
      try {
        setLoading(true);
        const [ordersResponse, progressResponse] = await Promise.all([
          fetch("https://multicourse-q1mn.onrender.com/api/orders/my-orders", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
          fetch("https://multicourse-q1mn.onrender.com/api/progress", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
        ]);

        const ordersData = await ordersResponse.json();
        let progressDataResponse = [];
        
        if (progressResponse.ok) {
          progressDataResponse = await progressResponse.json();
          if (!Array.isArray(progressDataResponse)) {
            progressDataResponse = [];
          }
        }

        setProgressData(progressDataResponse);
        setOrders(ordersData);
        
        // Extract all unique categories
        const allCourses = ordersData.flatMap(order => order.order_items.map(item => item.course));
        const categories = [...new Set(allCourses.map(course => course.category).filter(Boolean))];
        setAvailableCategories(categories);
        
        // Calculate stats
        const completedCourses = progressDataResponse.filter(p => p.final_exam?.status === "Completed");
        const inProgressCourses = progressDataResponse.filter(p => p.final_exam?.status !== "Completed");
        const certifiedCourses = certificates.filter(cert => cert.isPassed);
        
        setStats({
          total: allCourses.length,
          completed: completedCourses.length,
          inProgress: inProgressCourses.length,
          notStarted: allCourses.length - progressDataResponse.length,
          certified: certifiedCourses.length
        });

      } catch (err) {
        setError("Failed to fetch data");
        message.error("Failed to load your courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProgress();
  }, [certificates]);

  const toggleFavorite = (courseId) => {
    let newFavorites;
    if (favorites.includes(courseId)) {
      newFavorites = favorites.filter(id => id !== courseId);
      message.info("Removed from favorites");
    } else {
      newFavorites = [...favorites, courseId];
      message.success("Added to favorites");
    }
    setFavorites(newFavorites);
    localStorage.setItem("favoriteCourses", JSON.stringify(newFavorites));
  };

  const handleCourseClick = (courseId) => {
    if (!isEnrolled(courseId)) {
      Modal.info({
        title: "Enrollment Required",
        content: "You need to enroll in this course before accessing it.",
        okText: "Got it",
      });
      return;
    }

    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress) {
        navigate(`/courses/${courseId}?progressId=${courseProgress._id}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(
        `https://multicourse-q1mn.onrender.com/api/progress/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        message.success("You've successfully enrolled in this course!");
        setProgressData((prev) => [...prev, data]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          inProgress: prev.inProgress + 1,
          notStarted: prev.notStarted - 1
        }));
      } else {
        message.error(data.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      message.error("An error occurred while enrolling.");
    }
  };

  const getProgressForCourse = (courseId) => {
    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );

      if (courseProgress && courseProgress.lesson.length > 0) {
        const totalLessons = courseProgress.lesson.length + 1;
        const completedLessons = courseProgress.lesson.filter(
          (lesson) => lesson.status === "Completed"
        ).length;

        if (courseProgress.final_exam?.status === "Completed") {
          return 100;
        }

        const progress = (completedLessons / totalLessons) * 100;
        return progress;
      }
    }
    return 0;
  };

  const isEnrolled = (courseId) => {
    if (Array.isArray(progressData)) {
      return progressData.some((progress) => progress.course_id === courseId);
    }
    return false;
  };

  const isCourseCompleted = (courseId) => {
    if (Array.isArray(progressData)) {
      const courseProgress = progressData.find(
        (progress) => progress.course_id === courseId
      );
      return courseProgress && courseProgress.final_exam?.status === "Completed";
    }
    return false;
  };

  const hasCertificate = (courseId) => {
    return certificates.some(
      (certificate) =>
        certificate.course._id === courseId &&
        certificate.isPassed
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setSortBy("recent");
    setActiveTab("all");
    setShowCategoryFilter(false);
  };

  // Get filtered and sorted courses
  const getFilteredCourses = () => {
    let allCourses = [];
    
    // Extract all courses first
    orders.forEach(order => {
      order.order_items.forEach(item => {
        allCourses.push(item);
      });
    });
    
    // Apply search filter
    if (searchTerm) {
      allCourses = allCourses.filter(item => 
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab === "favorites") {
      allCourses = allCourses.filter(item => favorites.includes(item.course._id));
    } else if (activeTab === "inProgress") {
      allCourses = allCourses.filter(item => 
        isEnrolled(item.course._id) && !isCourseCompleted(item.course._id)
      );
    } else if (activeTab === "completed") {
      allCourses = allCourses.filter(item => isCourseCompleted(item.course._id));
    } else if (activeTab === "notStarted") {
      allCourses = allCourses.filter(item => !isEnrolled(item.course._id));
    } else if (activeTab === "certified") {
      allCourses = allCourses.filter(item => hasCertificate(item.course._id));
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      allCourses = allCourses.filter(item => item.course.category === categoryFilter);
    }
    
    // Apply sorting
    if (sortBy === "recent") {
      // Most recent purchases first (already sorted this way from API)
    } else if (sortBy === "title") {
      allCourses.sort((a, b) => a.course.title.localeCompare(b.course.title));
    } else if (sortBy === "progress") {
      allCourses.sort((a, b) => getProgressForCourse(b.course._id) - getProgressForCourse(a.course._id));
    }
    
    return allCourses;
  };

  // Course card component
  const CourseCard = ({ item }) => {
    const progress = getProgressForCourse(item.course._id);
    const completed = isCourseCompleted(item.course._id);
    const certified = hasCertificate(item.course._id);
    const isFavorite = favorites.includes(item.course._id);
    
    // Course difficulty indicator (example - you would replace this with actual data)
    const getDifficultyBadge = () => {
      // This would ideally come from your course data
      const difficulty = item.course.difficulty || "Beginner";
      
      if (difficulty === "Advanced") {
        return <Tag color="red">Advanced</Tag>;
      } else if (difficulty === "Intermediate") {
        return <Tag color="blue">Intermediate</Tag>;
      } else {
        return <Tag color="green">Beginner</Tag>;
      }
    };

    const moreMenu = (
      <Menu>
        <Menu.Item key="details" onClick={() => navigate(`/purchased-course-detail/${item.course._id}`)}>
          <EyeOutlined /> View Details
        </Menu.Item>
        <Menu.Item key="favorite" onClick={() => toggleFavorite(item.course._id)}>
          {isFavorite ? <><HeartFilled /> Remove from Favorites</> : <><HeartOutlined /> Add to Favorites</>}
        </Menu.Item>
      </Menu>
    );

    return (
      <Card
        className="course-card"
        hoverable
        style={{ 
          height: '100%',
          borderRadius: '12px', 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
        cover={
          <div style={{ position: 'relative', height: 180 }}>
            <img
              alt={item.course.title}
              src={item.course.image || "https://via.placeholder.com/300x180?text=Course+Image"}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x180?text=Course+Image";
              }}
            />
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.7))',
                zIndex: 1
              }}
            />
            {certified && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12, 
                  zIndex: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  padding: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} />
              </div>
            )}
            <Button
              shape="circle"
              icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.course._id);
              }}
              style={{ 
                position: 'absolute', 
                top: 12, 
                left: 12, 
                zIndex: 2,
                background: isFavorite ? '#ff4d4f' : 'rgba(255, 255, 255, 0.9)',
                color: isFavorite ? '#fff' : '#ff4d4f'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              bottom: 12, 
              left: 12, 
              zIndex: 2,
              display: 'flex',
              gap: '8px'
            }}>
              <Tag color="blue" style={{ margin: 0 }}>
                {item.course.category || "General"}
              </Tag>
              {getDifficultyBadge()}
            </div>
          </div>
        }
        actions={[
          isEnrolled(item.course._id) ? (
            <Tooltip title="Continue Learning">
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                style={{ width: '90%' }}
                onClick={() => handleCourseClick(item.course._id)}
              >
                {completed ? "Review" : "Continue"}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Start Learning">
              <Button 
                type="primary"
                icon={<ThunderboltOutlined />}
                style={{ width: '90%' }}
                onClick={() => handleEnroll(item.course._id)}
              >
                Start Now
              </Button>
            </Tooltip>
          ),
          <Dropdown overlay={moreMenu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>,
        ]}
      >
        <Meta
          title={
            <div style={{ marginBottom: 6 }}>
              <Tooltip title={item.course.title}>
                <div style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {item.course.title}
                </div>
              </Tooltip>
            </div>
          }
          description={
            <div>
              {/* Course status indicator */}
              <div style={{ marginBottom: 12 }}>
                {certified ? (
                  <Tag color="gold" icon={<TrophyOutlined />}>Certified</Tag>
                ) : completed ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>
                ) : isEnrolled(item.course._id) ? (
                  <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>
                ) : (
                  <Tag icon={<BookOutlined />}>Not Started</Tag>
                )}
              </div>
              
              {/* Progress bar for enrolled courses */}
              {isEnrolled(item.course._id) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 4 
                  }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Progress
                    </Text>
                    {/* <Text strong style={{ fontSize: '12px' }}>{progress.toFixed(0)}%</Text> */}
                  </div>
                  <Progress 
                    percent={progress} 
                    size="small" 
                    status={completed ? "success" : "active"}
                    strokeColor={
                      completed ? "#52c41a" : {
                        from: '#108ee9',
                        to: '#1890ff',
                      }
                    }
                     format={(percent) => `${percent.toFixed(0)}%`}
                  />
                </div>
              )}
            </div>
          }
        />
      </Card>
    );
  };

  const filteredCourses = getFilteredCourses();

  return (
    <Layout style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Content style={{ 
        width: '98%', 
        margin: '0 auto',
        padding: '16px'
      }}>
        {/* Header section */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            My Learning Journey
          </Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 16 }}>
            Track your progress and continue your learning
          </Text>
        </div>
        
        {/* Stats cards */}
        {!loading && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="Total Courses" 
                  value={stats.total} 
                  prefix={<BookOutlined />} 
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="In Progress" 
                  value={stats.inProgress} 
                  prefix={<ClockCircleOutlined />} 
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="Completed" 
                  value={stats.completed} 
                  prefix={<CheckCircleOutlined />} 
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="Not Started" 
                  value={stats.notStarted} 
                  prefix={<BookOutlined />} 
                  valueStyle={{ color: '#d9d9d9' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="Certified" 
                  value={stats.certified} 
                  prefix={<TrophyOutlined />} 
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={4} xl={4}>
              <Card>
                <Statistic 
                  title="Favorites" 
                  value={favorites.length} 
                  prefix={<HeartFilled />} 
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        )}
        
        {/* Search and filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Input
              size="large"
              placeholder="Search your courses..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Dropdown overlay={
              <Menu onClick={({key}) => setSortBy(key)}>
                <Menu.Item key="recent">Recent Purchase</Menu.Item>
                <Menu.Item key="title">Course Title</Menu.Item>
                <Menu.Item key="progress">Progress</Menu.Item>
              </Menu>
            } trigger={["click"]}>
              <Button size="large" style={{ width: '100%' }} icon={<SortAscendingOutlined />}>
                Sort By <MoreOutlined />
              </Button>
            </Dropdown>
          </Col>
          <Col xs={12} md={4}>
            <Button 
              size="large" 
              style={{ width: '100%' }} 
              icon={<FilterOutlined />} 
              type={showCategoryFilter ? "primary" : "default"}
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            >
              Category Filter
            </Button>
          </Col>
          <Col xs={24} md={4}>
            <Button 
              size="large" 
              style={{ width: '100%' }} 
              onClick={resetFilters}
            >
              Reset All Filters
            </Button>
          </Col>
        </Row>

        {/* Category filter dropdown */}
        {showCategoryFilter && (
          <Row style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card>
                <Select
                  size="large"
                  placeholder="Filter by Category"
                  style={{ width: '100%' }}
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value)}
                >
                  <Option value="all">All Categories</Option>
                  <Option value="Programming">Programming</Option>
                  <Option value="Design">Design</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Business">Business</Option>
                  <Option value="Photography">Photography</Option>
                  <Option value="Music">Music</Option>
                  <Option value="Education">Education</Option>
                  <Option value="Healthcare">Healthcare</Option>
                  <Option value="Finance">Finance</Option>
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Science">Science</Option>
                  <Option value="Art">Art</Option>
                  <Option value="Literature">Literature</Option>
                  <Option value="Culinary">Culinary</Option>
                  <Option value="Sports">Sports</Option>
                  <Option value="Agriculture">Agriculture</Option>
                  <Option value="Tourism">Tourism</Option>
                  <Option value="Technology">Technology</Option>
                  <Option value="Manufacturing">Manufacturing</Option>
                  <Option value="Architecture">Architecture</Option>
                  <Option value="Journalism">Journalism</Option>
                  <Option value="Law">Law</Option>
                  <Option value="Psychology">Psychology</Option>
                  <Option value="Film">Film & Media</Option>
                  <Option value="Retail">Retail</Option>
                  <Option value="Transportation">Transportation</Option>
                  <Option value="Environmental">Environmental</Option>
                  <Option value="Fashion">Fashion</Option>
                  <Option value="Real Estate">Real Estate</Option>
                  <Option value="Telecommunications">Telecommunications</Option>
                </Select>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* Tabs for different views */}
        <Card style={{ marginBottom: 24 }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            size="large"
            centered
            style={{ marginBottom: 24 }}
          >
            <TabPane 
              tab={<><AppstoreOutlined /> All Courses</>} 
              key="all"
            />
            <TabPane 
              tab={<><ClockCircleOutlined /> In Progress</>} 
              key="inProgress"
            />
            <TabPane 
              tab={<><CheckCircleOutlined /> Completed</>} 
              key="completed"
            />
            <TabPane 
              tab={<><BookOutlined /> Not Started</>} 
              key="notStarted"
            />
            <TabPane 
              tab={<><TrophyOutlined /> Certified</>} 
              key="certified"
            />
            <TabPane 
              tab={<><HeartFilled /> Favorites</>} 
              key="favorites"
            />
          </Tabs>

          {/* Applied filters display */}
          {(searchTerm || categoryFilter !== 'all') && (
            <div style={{ marginBottom: 16, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Text strong>Applied Filters:</Text>
              {searchTerm && (
                <Tag closable onClose={() => setSearchTerm("")} color="blue">
                  Search: {searchTerm}
                </Tag>
              )}
              {categoryFilter !== 'all' && (
                <Tag closable onClose={() => setCategoryFilter("all")} color="green">
                  Category: {categoryFilter}
                </Tag>
              )}
            </div>
          )}
          
          {/* Course grid */}
          {loading ? (
            <div style={{ padding: '20px 0' }}>
              <Row gutter={[24, 24]}>
                {/* Show exactly 4 skeleton cards per row */}
                {[...Array(8)].map((_, index) => (
                  <Col xs={24} sm={12} md={6} lg={6} xl={6} key={index}>
                    <Card>
                      <Skeleton active avatar paragraph={{ rows: 4 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ fontSize: 16 }}>
                  {searchTerm || categoryFilter !== 'all'
                    ? "No courses match your search criteria"
                    : activeTab === "favorites"
                    ? "You haven't added any courses to favorites yet"
                    : activeTab === "inProgress"
                    ? "You don't have any courses in progress"
                    : activeTab === "completed"
                    ? "You haven't completed any courses yet"
                    : activeTab === "notStarted"
                    ? "All your courses have been started"
                    : activeTab === "certified"
                    ? "You don't have any certifications yet"
                    : "You don't have any courses"}
                </Text>
              }
            >
              {activeTab === "all" && !searchTerm && categoryFilter === 'all' && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/courses')}
                  icon={<ShoppingCartOutlined />}
                >
                  Browse Courses
                </Button>
              )}
              {(searchTerm || categoryFilter !== 'all') && (
                <Button 
                  type="default" 
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Empty>
          ) : (
            <Row gutter={[24, 24]}>
              {/* Set to show exactly 4 course cards per row */}
              {filteredCourses.map((item) => (
                <Col xs={24} sm={12} md={6} lg={6} xl={6} key={item._id}>
                  <CourseCard item={item} />
                </Col>
              ))}
            </Row>
          )}
        </Card>
        
        {/* Recommendations section - this could be added later */}
        {/* <Card title={<><FireOutlined /> Recommended Next Steps</>} style={{ marginBottom: 24 }}>
          <Empty 
            description={
              <Text type="secondary">
                Personalized course recommendations will appear here based on your learning patterns
              </Text>
            }
          />
        </Card> */}
      </Content>
    </Layout>
  );
};

export default MyCourses;