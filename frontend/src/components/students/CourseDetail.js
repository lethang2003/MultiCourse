import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Divider, 
  Spin, 
  Tag, 
  Avatar, 
  Row, 
  Col, 
  Rate, 
  Input, 
  List, 
  Modal, 
  Space, 
  message, 
  Descriptions,
  Alert,
  Pagination
} from "antd";
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  CalendarOutlined,
  DollarOutlined,
  TagOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const DetailCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [hasCommented, setHasCommented] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showTutorPopup, setShowTutorPopup] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Check login and get fullname
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      const savedFullname = localStorage.getItem("fullname");
      setFullname(savedFullname || "User");
      
      // Check if user has purchased this course
      const checkPurchaseStatus = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/orders/check-purchase/${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok && data.purchased) {
            setHasPurchased(true);
            
            // Check if user has already commented
            if (course?.comments) {
              const userCommented = course.comments.some(
                comment => comment.userId === data.userId
              );
              setHasCommented(userCommented);
            }
          }
        } catch (error) {
          console.error("Error checking purchase status:", error);
        }
      };
      
      checkPurchaseStatus();
    } else {
      setIsAuthenticated(false);
    }
  }, [id, course?.comments]);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetail = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/detail/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data.courseDetail);
          setCourse(data.courseDetail);
        } else {
          console.error("Error fetching course detail:", data.message);
          message.error("Failed to load course details");
        }
      } catch (error) {
        console.error("Error:", error);
        message.error("An error occurred while loading the course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id]);

  // Fetch tutor details
  useEffect(() => {
    const fetchTutorDetails = async () => {
      if (course?.tutor) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/users/profile/${course.tutor}`
          );
          console.log("Response Status:", response.status);
          const data = await response.json();
          console.log("Tutor Data:", data);
          if (response.ok) {
            setCourse((prevCourse) => ({
              ...prevCourse,
              tutorName: data.fullname,
              tutorAvatar: data.avatar,
            }));
          } else {
            console.error("Error fetching tutor details:", data.message);
          }
        } catch (error) {
          console.error("Error fetching tutor details:", error);
        }
      }
    };

    fetchTutorDetails();
  }, [course]);

  const handleAddToCart = async (courseId) => {
    if (!isAuthenticated) {
      message.warning("Please log in to add this course to your cart");
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
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        message.success("Course added to cart successfully!");
      } else {
        message.error(`Error: ${data.message}`);
      }
    } catch (error) {
      message.error("An error occurred. Please try again.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      message.warning("Comments cannot be left blank!");
      return;
    }

    if (hasCommented) {
      message.warning("You have already reviewed this course");
      return;
    }

    const commentData = {
      courseId: id,
      rating: newRating,
      comment: newComment,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/create-course-comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(commentData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCourse((prevCourse) => ({
          ...prevCourse,
          comments: [
            ...prevCourse.comments,
            {
              author: fullname,
              rating: newRating,
              comment: newComment,
              date: new Date(),
              userId: data.userId || "current-user", // Store userId for comment identification
            },
          ],
        }));

        setNewComment("");
        setNewRating(5);
        setHasCommented(true);
        message.success("Your review has been added!");
      } else {
        message.error(`Error: ${data.message}`);
      }
    } catch (error) {
      message.error("An error occurred while submitting the review!");
    }
  };

  const toggleTutorPopup = () => {
    setShowTutorPopup(!showTutorPopup);
  };

  const renderComments = () => {
    if (!course?.comments?.length) {
      return <Empty description="No comments yet" />;
    }

    // Calculate paginated data
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = course.comments.slice(startIndex, endIndex);
    const total = course.comments.length;

    return (
      <>
        <List
          itemLayout="horizontal"
          dataSource={paginatedComments}
          renderItem={comment => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#1890ff' }}>
                    {comment.author?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                }
                title={
                  <div>
                    <Text strong>{comment.author || "Anonymous User"}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Rate disabled value={comment.rating} />
                    </div>
                  </div>
                }
                description={
                  <>
                    <Paragraph>{comment.comment}</Paragraph>
                    <Text type="secondary">
                      {new Date(comment.date).toLocaleDateString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
        
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            pageSizeOptions={['5', '10', '20']}
            showTotal={(total) => `Total ${total} reviews`}
          />
        </div>
      </>
    );
  };

  const renderTutorModal = () => {
    if (!course?.tutor) return null;

    return (
      <Modal
        title={<Title level={3} style={{ textAlign: 'center' }}>Tutor Profile</Title>}
        open={showTutorPopup}
        onCancel={toggleTutorPopup}
        footer={[
          <Button key="close" type="primary" size="large" onClick={toggleTutorPopup}>
            Close
          </Button>
        ]}
        width={700}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Avatar 
            src={course.tutor.avatar} 
            size={100} 
            icon={!course.tutor.avatar && <UserOutlined />}
            style={{ marginBottom: 16 }}
          />
          <Title level={3} style={{ marginBottom: 4 }}>
            {course.tutor.fullname}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>{course.tutor.email}</Text>
        </div>
        
        <Divider style={{ marginBottom: 24 }} />
        
        <Card title={<Title level={4}>Tutor Information</Title>} bordered={false}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                <Text strong style={{ fontSize: 16 }}>Address</Text>
                <Text style={{ fontSize: 16 }}>{course.tutor.address || "Not provided"}</Text>
              </Space>
            </Col>
            
            <Col span={24}>
              <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                <Text strong style={{ fontSize: 16 }}>Phone</Text>
                <Text style={{ fontSize: 16 }}>{course.tutor.phone || "Not provided"}</Text>
              </Space>
            </Col>
            
            <Col span={24}>
              <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                <Text strong style={{ fontSize: 16 }}>Gender</Text>
                <Text style={{ fontSize: 16 }}>{course.tutor.gender || "Not provided"}</Text>
              </Space>
            </Col>
            
            <Col span={24}>
              <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                <Text strong style={{ fontSize: 16 }}>Birthday</Text>
                <Text style={{ fontSize: 16 }}>
                  {course.tutor.birthday
                    ? new Date(course.tutor.birthday).toLocaleDateString("en-GB")
                    : "Not provided"}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </Modal>
    );
  };

  const Empty = ({ description }) => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <Text type="secondary">{description}</Text>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "24px", width: 1200, margin: "0 auto" }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/course-list")}
          style={{ marginBottom: 16, fontSize: 16 }}
        >
          Back to Courses
        </Button>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading course details...</Text>
            </div>
          </div>
        ) : course ? (
          <>
            <Card bordered={false} style={{ marginBottom: 24 }}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
                    <img
                      src={course.image}
                      alt={course.title}
                      style={{ 
                        width: '100%', 
                        height: 300, 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        ':hover': { transform: 'scale(1.05)' }
                      }}
                    />
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <Title level={2} style={{ color: '#096dd9' }}>
                    {course.title}
                  </Title>
                  
                  <Paragraph style={{ fontSize: 16 }}>
                    {course.description}
                  </Paragraph>
                  
                  <Space style={{ marginTop: 16 }}>
                    <Tag color="blue" icon={<TagOutlined />}>
                      {course.category}
                    </Tag>
                    <Tag icon={<CalendarOutlined />}>
                      Created: {new Date(course.createAt).toLocaleDateString()}
                    </Tag>
                  </Space>
                  
                  <div style={{ marginTop: 24 }}>
                    <Title level={3} style={{ color: '#1890ff' }} type="secondary" icon={<DollarOutlined />}>
                      ${course.price}
                    </Title>
                  </div>
                  
                  {course.tutor && (
                    <Card 
                      style={{ marginTop: 24, borderRadius: 8 }} 
                      size="small" 
                      type="inner"
                    >
                      <Space align="center" size="middle">
                        <Avatar 
                          size={64} 
                          src={course.tutor.avatar || undefined} 
                          icon={!course.tutor.avatar && <UserOutlined />}
                        />
                        <div>
                          <Text type="secondary">Tutor</Text>
                          <div>
                            <Button 
                              type="link" 
                              onClick={toggleTutorPopup} 
                              style={{ padding: 0, fontSize: 18, fontWeight: 'bold' }}
                            >
                              {course.tutor.fullname}
                            </Button>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  )}
                  
                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(course._id)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card 
              title={<Title level={4}>Comments and Reviews</Title>}
              bordered={false}
            >
              {/* Only show comment form to users who purchased the course */}
              {hasPurchased && isAuthenticated && !hasCommented && (
                <div style={{ marginBottom: 24 }}>
                  <Card type="inner" title="Write a Review">
                    <TextArea
                      rows={4}
                      placeholder="Enter your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ marginBottom: 16 }}
                    />
                    
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div>
                        <Text style={{ marginRight: 8 }}>Rating:</Text>
                        <Rate value={newRating} onChange={setNewRating} />
                      </div>
                      
                      <Button type="primary" onClick={handleCommentSubmit}>
                        Submit Comment
                      </Button>
                    </Space>
                  </Card>
                </div>
              )}
              
              {/* Show message if user already commented */}
              {hasPurchased && hasCommented && (
                <Alert
                  message="You have already reviewed this course"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              
              {/* Show message if user has not purchased but is logged in */}
              {isAuthenticated && !hasPurchased && (
                <Alert
                  message="Purchase this course to add your review"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              
              {/* Always show comments for everyone */}
              {renderComments()}
            </Card>
          </>
        ) : (
          <Empty description="No course information found" />
        )}
      </Content>
      
      {renderTutorModal()}
    </Layout>
  );
};

export default DetailCourse;