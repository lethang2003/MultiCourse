import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Divider,
  Form,
  Input,
  Rate,
  List,
  Avatar,
  Tag,
  Tooltip,
  Modal,
  message,
  Result,
  Collapse,
  Space,
  Statistic,
  Tabs,
  Descriptions,
  Drawer,
  Badge,
  Empty,
  Skeleton,
  Pagination
} from "antd";
import {
  LeftOutlined,
  BookOutlined,
  DollarOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  CommentOutlined,
  FileTextOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  FileOutlined,
  TrophyOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// Custom Comment component since Comment was removed from antd v5
const CustomComment = ({ author, avatar, content, datetime, actions }) => {
  return (
    <div style={{ display: 'flex', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ marginRight: 16 }}>
        {avatar}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text strong>{author}</Text>
          <div>{datetime}</div>
        </div>
        <div style={{ margin: '8px 0' }}>{content}</div>
        {actions && actions.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {actions.map((action, index) => (
              <span key={index} style={{ marginRight: 16 }}>{action}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PurchasedCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isTutorDrawerVisible, setIsTutorDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Pagination states
  const [commentPage, setCommentPage] = useState(1);
  const [commentsPerPage, setCommentsPerPage] = useState(3);
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonsPerPage, setLessonsPerPage] = useState(3);
  const [activeCollapsePanel, setActiveCollapsePanel] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        messageApi.error("Failed to load user profile");
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(
          `https://multicourse-q1mn.onrender.com/api/courses/detail/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course detail");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
        messageApi.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleSubmitComment = async (values) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "https://multicourse-q1mn.onrender.com/api/comments/create-course-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            rating,
            comment: values.comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit comment");
      }

      const updatedResponse = await fetch(
        `https://multicourse-q1mn.onrender.com/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setComment("");
        setRating(5);
        form.resetFields();
        messageApi.success("Review submitted successfully!");
      }
    } catch (err) {
      setSubmitError(err.message);
      messageApi.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditComment(comment.comment);
    setEditRating(comment.rating);
    setIsModalVisible(true);
  };

  const handleUpdateComment = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "https://multicourse-q1mn.onrender.com/api/comments/update-course-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            courseId,
            commentId: editingComment._id,
            rating: editRating,
            comment: editComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update comment");
      }

      const updatedResponse = await fetch(
        `https://multicourse-q1mn.onrender.com/api/courses/detail/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCourse(updatedData);
        setIsModalVisible(false);
        messageApi.success("Review updated successfully!");
      }
    } catch (err) {
      setSubmitError(err.message);
      messageApi.error("Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: "Delete Review",
      content: "Are you sure you want to delete this review?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(
            "https://multicourse-q1mn.onrender.com/api/comments/delete-course-comment",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({
                courseId,
                commentId,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to delete comment");
          }

          // Refresh course data
          const updatedResponse = await fetch(
            `https://multicourse-q1mn.onrender.com/api/courses/detail/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            setCourse(updatedData);
            messageApi.success("Review deleted successfully!");
          }
        } catch (err) {
          messageApi.error("Failed to delete review");
        }
      },
    });
  };

  // Handle comment pagination change
  const handleCommentPageChange = (page, pageSize) => {
    setCommentPage(page);
    setCommentsPerPage(pageSize);
  };

  // Handle lesson pagination change
  const handleLessonPageChange = (page, pageSize) => {
    setLessonPage(page);
    setLessonsPerPage(pageSize);
    setActiveCollapsePanel(null); // Reset active collapse when changing page
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f2f5, #e6f7ff)"
      }}>
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: "#1890ff" }}>
            Loading course details...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load course"
        subTitle={error}
        extra={[
          <Button type="primary" key="back" onClick={() => navigate(-1)}>
            Go Back
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            Try Again
          </Button>,
        ]}
      />
    );
  }

  const { courseDetail, lessons } = course;

  // Calculate paginated data
  const indexOfLastComment = commentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = courseDetail.comments.slice(indexOfFirstComment, indexOfLastComment);

  const indexOfLastLesson = lessonPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);

  // Format course info items for stats display
  const courseInfoItems = [
    {
      key: "lessons",
      icon: <BookOutlined style={{ fontSize: 24 }} />,
      title: "Lessons",
      value: `${lessons.length} lessons`,
      color: "#1890ff",
    },
    {
      key: "price",
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      title: "Price",
      value: `${courseDetail.price.toLocaleString()} VND`,
      color: "#52c41a",
    },
    {
      key: "category",
      icon: <AppstoreOutlined style={{ fontSize: 24 }} />,
      title: "Category",
      value: courseDetail.category,
      color: "#722ed1",
    },
    {
      key: "created",
      icon: <CalendarOutlined style={{ fontSize: 24 }} />,
      title: "Created At",
      value: new Date(courseDetail.createAt).toLocaleDateString(),
      color: "#faad14",
    },
  ];

  return (
    <Layout className="purchased-course-detail" style={{ 
      background: "linear-gradient(to right, #f0f2f5, #e6f7ff)",
      minHeight: "100vh"
    }}>
      {contextHolder}
      
      <Content style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Back to Courses
        </Button>

        <Card
          bordered={false}
          style={{ marginBottom: 24, overflow: "hidden" }}
          bodyStyle={{ padding: 0 }}
        >
          <Row>
            <Col xs={24} md={12}>
              <div style={{ position: "relative" }}>
                <img 
                  src={courseDetail.image || "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"} 
                  alt={courseDetail.title} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    maxHeight: 400
                  }}
                />
                
                {/* Tutor badge overlay */}
                {courseDetail.tutor && (
                  <div 
                    style={{ 
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 16,
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                    onClick={() => setIsTutorDrawerVisible(true)}
                  >
                    <Avatar 
                      src={courseDetail.tutor.avatar} 
                      icon={!courseDetail.tutor.avatar && <UserOutlined />}
                      style={{ marginRight: 8 }}
                    />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tutor</Text>
                      <div style={{ fontWeight: "bold" }}>{courseDetail.tutor.fullname}</div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div style={{ padding: 24 }}>
                <Title level={2} style={{ marginBottom: 16 }}>{courseDetail.title}</Title>
                
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                  {courseDetail.description}
                </Paragraph>

                <Row gutter={[16, 16]}>
                  {courseInfoItems.map(item => (
                    <Col xs={12} key={item.key}>
                      <Card 
                        size="small" 
                        style={{ backgroundColor: `${item.color}10`, borderColor: item.color }}
                      >
                        <Statistic 
                          title={
                            <span style={{ color: item.color, display: "flex", alignItems: "center" }}>
                              {item.icon}
                              <span style={{ marginLeft: 8 }}>{item.title}</span>
                            </span>
                          }
                          value={item.value}
                          valueStyle={{ color: item.color }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Divider />

                <Space size="large">
                  <Statistic 
                    title={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <StarOutlined style={{ marginRight: 8, color: "#faad14" }} />
                        Rating
                      </span>
                    }
                    value={courseDetail.average_rating.toFixed(1)}
                    suffix="/5.0"
                    precision={1}
                    valueStyle={{ color: "#faad14" }}
                  />
                  
                  <Statistic 
                    title={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <CommentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        Reviews
                      </span>
                    }
                    value={courseDetail.comments.length}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Lessons Section */}
        <Card
          title={
            <Space>
              <BookOutlined />
              <span>Course Lessons</span>
              <Tag color="blue">{lessons.length} Lessons</Tag>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Collapse 
            accordion 
            bordered={false}
            expandIconPosition="end"
            className="site-collapse-custom-collapse"
            activeKey={activeCollapsePanel}
            onChange={key => setActiveCollapsePanel(key)}
          >
            {currentLessons.map((lesson, index) => (
              <Panel
                key={lesson._id}
                header={
                  <Space>
                    <Badge count={lesson.number} style={{ backgroundColor: '#1890ff' }} />
                    <span style={{ fontWeight: "bold" }}>{lesson.title}</span>
                  </Space>
                }
                style={{ marginBottom: 16, backgroundColor: "#fff", borderRadius: 8 }}
                className="site-collapse-custom-panel"
              >
                <Paragraph>{lesson.description}</Paragraph>
                
                <Space size="middle" style={{ marginTop: 16 }}>
                  {lesson.document_url && (
                    <Button 
                      type="primary" 
                      ghost 
                      icon={<FileOutlined />}
                      href={lesson.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Materials
                    </Button>
                  )}
                </Space>
                
                {lesson.comments && lesson.comments.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <Divider>
                      <Space>
                        <CommentOutlined />
                        <span>Lesson Feedback ({lesson.comments.length})</span>
                      </Space>
                    </Divider>
                    
                    <List
                      itemLayout="horizontal"
                      dataSource={lesson.comments}
                      renderItem={comment => (
                        <List.Item>
                          <CustomComment
                            author={comment.author}
                            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                            content={<p>{comment.comment}</p>}
                            datetime={
                              <Space>
                                <Tooltip title={new Date(comment.date).toLocaleString()}>
                                  <span>{new Date(comment.date).toLocaleDateString()}</span>
                                </Tooltip>
                                <Rate disabled defaultValue={comment.rating} style={{ fontSize: 12 }} />
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Panel>
            ))}
          </Collapse>

          {/* Lesson Pagination */}
          {lessons.length > lessonsPerPage && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination 
                current={lessonPage} 
                pageSize={lessonsPerPage}
                total={lessons.length} 
                onChange={handleLessonPageChange}
                showSizeChanger
                pageSizeOptions={[5, 10, 20]}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} lessons`}
              />
            </div>
          )}
        </Card>

        {/* Reviews Section */}
        <Card
          title={
            <Space>
              <CommentOutlined />
              <span>Course Reviews</span>
              <Tag color="blue">{courseDetail.comments.length} Reviews</Tag>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {courseDetail.comments && courseDetail.comments.length > 0 ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={currentComments}
                renderItem={comment => (
                  <List.Item
                    key={comment._id}
                    actions={
                      comment.author === userProfile?.fullname 
                        ? [
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditComment(comment)}
                            >
                              Edit
                            </Button>,
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              Delete
                            </Button>
                          ]
                        : undefined
                    }
                  >
                    <CustomComment
                      author={comment.author}
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                      content={<Paragraph>{comment.comment}</Paragraph>}
                      datetime={
                        <Space>
                          <Tooltip title={new Date(comment.date).toLocaleString()}>
                            <span>{new Date(comment.date).toLocaleDateString()}</span>
                          </Tooltip>
                          <Rate disabled defaultValue={comment.rating} />
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />

              {/* Comment Pagination */}
              {courseDetail.comments.length > commentsPerPage && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination 
                    current={commentPage} 
                    pageSize={commentsPerPage}
                    total={courseDetail.comments.length} 
                    onChange={handleCommentPageChange}
                    showSizeChanger
                    pageSizeOptions={[5, 10, 20]}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} reviews`}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="No reviews yet. Be the first to leave a review!" />
          )}
        </Card>

        {/* Add Review Section */}
        <Card
          title={
            <Space>
              <StarOutlined />
              <span>Add Your Review</span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitComment}
          >
            <Form.Item label="Your Rating">
              <Rate 
                allowClear={false}
                value={rating} 
                onChange={setRating} 
                style={{ fontSize: 36 }}
              />
            </Form.Item>
            
            <Form.Item
              name="comment"
              label="Your Review"
              rules={[{ required: true, message: 'Please write your review' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Share your thoughts about this course..." 
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </Form.Item>
            
            {submitError && (
              <Form.Item>
                <div style={{ color: '#ff4d4f' }}>{submitError}</div>
              </Form.Item>
            )}
            
            <Form.Item style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CommentOutlined />}
                loading={submitting}
                size="large"
              >
                Submit Review
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>

      {/* Edit Comment Modal */}
      <Modal
        title="Edit Your Review"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitting} 
            onClick={handleUpdateComment}
          >
            Update Review
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Rating">
            <Rate 
              allowClear={false}
              value={editRating} 
              onChange={setEditRating} 
            />
          </Form.Item>
          <Form.Item label="Comment">
            <TextArea 
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Tutor Info Drawer */}
      <Drawer
        title="Tutor Profile"
        placement="right"
        closable={true}
        onClose={() => setIsTutorDrawerVisible(false)}
        open={isTutorDrawerVisible}
        width={400}
      >
        {courseDetail?.tutor && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar 
              src={courseDetail.tutor.avatar} 
              icon={!courseDetail.tutor.avatar && <UserOutlined />}
              size={100} 
              style={{ marginBottom: 16 }}
            />
            <Title level={4}>{courseDetail.tutor.fullname}</Title>
            <Text type="secondary">{courseDetail.tutor.email}</Text>
          </div>
        )}
        
        <Divider />
        
        <Descriptions title="Tutor Information" layout="vertical" bordered>
          <Descriptions.Item label="Address" span={3}>
            {courseDetail?.tutor?.address || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {courseDetail?.tutor?.phone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {courseDetail?.tutor?.gender || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Birthday">
            {courseDetail?.tutor?.birthday 
              ? new Date(courseDetail.tutor.birthday).toLocaleDateString("en-GB") 
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </Layout>
  );
};

export default PurchasedCourseDetail;