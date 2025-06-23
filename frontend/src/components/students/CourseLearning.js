import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Tabs,
  Input,
  Rate,
  List,
  Avatar,
  Divider,
  Space,
  Tag,
  Alert,
  Badge,
  Modal,
  notification,
  Progress,
  Statistic,
  Empty,
  Menu,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
  DownloadOutlined,
  ExpandOutlined,
  ShrinkOutlined,
  TrophyOutlined,
  BookOutlined,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

// Custom Comment component since Comment was removed from antd v5
const Comment = ({ author, avatar, content, actions, datetime }) => {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 16,
        padding: 16,
        background: "#fff",
        borderRadius: 8,
      }}
    >
      <div style={{ marginRight: 16 }}>{avatar}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text strong>{author}</Text>
          <Text type="secondary">{datetime}</Text>
        </div>
        <div style={{ margin: "8px 0" }}>{content}</div>
        {actions && (
          <ul style={{ marginTop: 8, padding: 0, listStyle: "none" }}>
            {actions.map((action, index) => (
              <li
                key={index}
                style={{ display: "inline-block", marginRight: 12 }}
              >
                {action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const CourseLearningPage = ({ isCourseCompleted }) => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("Description");
  const videoRef = useRef(null);
  const location = useLocation();
  const progressId = new URLSearchParams(location.search).get("progressId");
  const [progressData, setProgressData] = useState(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [rating, setRating] = useState(5);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditComment, setCurrentEditComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editCommentRating, setEditCommentRating] = useState(5);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        notification.error({
          message: "Error",
          description: "Failed to load user profile",
        });
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!progressId) return;

      try {
        const response = await fetch(
          `https://multicourse-q1mn.onrender.com/api/progress/${progressId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProgressData(data);

          if (data.final_exam?.status === "Completed") {
            setIsCompleted(true);
          }
        } else {
          setError("Failed to fetch progress data.");
          notification.error({
            message: "Error",
            description: "Failed to load progress data",
          });
        }
      } catch (error) {
        setError("Failed to fetch progress data.");
        notification.error({
          message: "Error",
          description: "Failed to load progress data",
        });
      }
    };

    fetchProgress();
  }, [progressId]);

  useEffect(() => {
    if (
      isCompleted &&
      currentLesson?.type === "exam" &&
      currentLesson.title === "Final Exam"
    ) {
      confetti({
        particleCount: 150,
        spread: 80,
        startVelocity: 40,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted, currentLesson]);

  useEffect(() => {
    if (isCompleted) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [isCompleted]);

  const fetchExamScore = async () => {
    try {
      const response = await fetch(
        `https://multicourse-q1mn.onrender.com/api/exams/get-exam-score/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExamScore(data.Score);
      } else if (response.status === 404) {
        setExamScore(0);
      } else {
        setError("Failed to fetch exam score.");
        notification.error({
          message: "Error",
          description: "Failed to load exam score",
        });
      }
    } catch (error) {
      setError("Failed to fetch exam score.");
      notification.error({
        message: "Error",
        description: "Failed to load exam score",
      });
    }
  };

  useEffect(() => {
    fetchExamScore();
  }, [courseId]);

  const showEditModal = (comment) => {
    setCurrentEditComment(comment);
    setEditCommentText(comment.comment);
    setEditCommentRating(comment.rating || 5);
    setEditModalVisible(true);
  };

  const handleEditComment = async () => {
    try {
      const lessonId = currentLesson._id;
      const response = await fetch(
        "https://multicourse-q1mn.onrender.com/api/comments/update-lesson-comment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            comment: editCommentText,
            rating: editCommentRating,
            commentId: currentEditComment._id,
            lessonId,
          }),
        }
      );

      if (response.ok) {
        setCurrentLesson((prevLesson) => ({
          ...prevLesson,
          comments: prevLesson.comments.map((comment) =>
            comment._id === currentEditComment._id
              ? {
                  ...comment,
                  comment: editCommentText,
                  rating: editCommentRating,
                }
              : comment
          ),
        }));

        notification.success({
          message: "Success",
          description: "Comment updated successfully",
        });

        setEditModalVisible(false);
      } else {
        notification.error({
          message: "Error",
          description: "Failed to update comment",
        });
      }
    } catch (error) {
      console.error("Failed to update comment", error);
      notification.error({
        message: "Error",
        description: "Failed to update comment",
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: "Delete Comment",
      content: "Are you sure you want to delete this comment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const lessonId = currentLesson._id;
          const response = await fetch(
            "https://multicourse-q1mn.onrender.com/api/comments/delete-lesson-comment",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({
                courseId,
                lessonId,
                commentId,
              }),
            }
          );

          if (response.ok) {
            setCurrentLesson((prevLesson) => ({
              ...prevLesson,
              comments: prevLesson.comments.filter(
                (comment) => comment._id !== commentId
              ),
            }));
            notification.success({
              message: "Success",
              description: "Comment deleted successfully",
            });
          } else {
            notification.error({
              message: "Error",
              description: "Failed to delete comment",
            });
          }
        } catch (error) {
          console.error("Failed to delete comment", error);
          notification.error({
            message: "Error",
            description: "Failed to delete comment",
          });
        }
      },
    });
  };

  const handleCommentSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        "https://multicourse-q1mn.onrender.com/api/comments/create-lesson-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            lessonId: currentLesson._id,
            comment: note,
            rating: rating,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const newComment = responseData.comment;

        if (!newComment._id) {
          newComment._id = Date.now().toString();
        }

        setNote("");
        setRating(5);

        setCurrentLesson((prevLesson) => ({
          ...prevLesson,
          comments: Array.isArray(prevLesson.comments)
            ? [...prevLesson.comments, newComment]
            : [newComment],
        }));

        notification.success({
          message: "Success",
          description: "Comment posted successfully",
        });
      } else {
        notification.error({
          message: "Error",
          description: "Failed to post comment",
        });
      }
    } catch (error) {
      console.error("Failed to post comment", error);
      notification.error({
        message: "Error",
        description: "Failed to post comment",
      });
    }
  };

  useEffect(() => {
    const fetchLessonsAndProgress = async () => {
      try {
        const [lessonsResponse, progressResponse] = await Promise.all([
          fetch(`https://multicourse-q1mn.onrender.com/api/lessons/all-lessons/${courseId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }),
          progressId
            ? fetch(`https://multicourse-q1mn.onrender.com/api/progress/${progressId}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              })
            : Promise.resolve({ json: () => ({ lesson: [] }) }),
        ]);

        const lessonsData = await lessonsResponse.json();
        const progressData = await progressResponse.json();

        const updatedLessons = [
          ...lessonsData,
          {
            _id: "exam_final",
            title: "Final Exam",
            type: "exam",
          },
        ];

        setLessons(updatedLessons);
        setProgressData(progressData);

        if (updatedLessons.length > 0) {
          setCurrentLesson(updatedLessons[0]);
        }
      } catch (err) {
        setError("Failed to fetch lessons or progress.");
        notification.error({
          message: "Error",
          description: "Failed to load lessons or progress",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsAndProgress();
  }, [courseId, progressId]);

  const isLessonCompleted = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "Completed"
      )
    );
  };

  const currentNote = progressData?.lesson.find(
    (lesson) => lesson.lesson_id === currentLesson?._id
  )?.note;

  const isLessonInProgress = (lessonId) => {
    return (
      progressData &&
      progressData.lesson.some(
        (lesson) =>
          lesson.lesson_id === lessonId && lesson.status === "In Progress"
      )
    );
  };

  const canAccessLesson = (index) => {
    if (index === 0) return true;
    return isLessonCompleted(lessons[index - 1]._id);
  };

  const updateLessonProgress = async (status, note = "") => {
    try {
      await fetch(
        `https://multicourse-q1mn.onrender.com/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, note }),
        }
      );

      if (status === "Completed") {
        setProgressData((prev) => ({
          ...prev,
          lesson: [
            ...prev.lesson.filter((l) => l.lesson_id !== currentLesson._id),
            { lesson_id: currentLesson._id, status: "Completed" },
          ],
        }));

        setCurrentLesson((prev) => ({ ...prev, status: "Completed" }));

        setLessons((prevLessons) =>
          prevLessons.map((lesson, index) => {
            if (lesson._id === currentLesson._id) {
              return { ...lesson, status: "Completed" };
            } else if (
              index ===
              prevLessons.findIndex((l) => l._id === currentLesson._id) + 1
            ) {
              updateNextLessonProgress(lesson._id);
              return { ...lesson, status: "In Progress" };
            }
            return lesson;
          })
        );

        notification.success({
          message: "Success",
          description: "Lesson marked as completed",
        });
      }
    } catch (error) {
      console.error("Failed to update lesson progress", error);
      notification.error({
        message: "Error",
        description: "Failed to update lesson progress",
      });
    }
  };

  const updateNextLessonProgress = async (lessonId) => {
    try {
      await fetch(`https://multicourse-q1mn.onrender.com/api/progress/lesson/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ status: "In Progress" }),
      });

      setProgressData((prev) => ({
        ...prev,
        lesson: [
          ...prev.lesson.filter((l) => l.lesson_id !== lessonId),
          { lesson_id: lessonId, status: "In Progress" },
        ],
      }));
    } catch (error) {
      console.error("Failed to update next lesson progress", error);
    }
  };

  const handleVideoEnd = () => {
    if (currentLesson.status !== "Completed") {
      updateLessonProgress("Completed", "");
    }
  };

  const handleNoteSubmit = async () => {
    if (!note) return;

    try {
      const response = await fetch(
        `https://multicourse-q1mn.onrender.com/api/progress/lesson/${currentLesson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status: currentLesson.status, note }),
        }
      );

      if (response.ok) {
        const updatedProgressData = await response.json();
        setProgressData(updatedProgressData);
        setNotes((prevNotes) => [...prevNotes, { content: note }]);
        setNote("");
        notification.success({
          message: "Success",
          description: "Note saved successfully",
        });
      } else {
        notification.error({
          message: "Error",
          description: "Failed to save note",
        });
      }
    } catch (error) {
      console.error("Failed to save note", error);
      notification.error({
        message: "Error",
        description: "Failed to save note",
      });
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/certificates/get-all-certificates",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        const certificates = data.certificates;

        const isCourseCompleted = certificates.some((certificate) => {
          return certificate.course._id === courseId && certificate.isPassed;
        });

        setIsCompleted(isCourseCompleted);
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      }
    };

    fetchCertificates();
  }, [courseId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading lessons..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ maxWidth: 800, margin: "20px auto" }}
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "24px", width: 1200, margin: "0 auto" }}>
        <Row gutter={[24, 24]}>
          <Col span={isVideoExpanded ? 24 : 18}>
            <Card
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  icon={
                    isVideoExpanded ? <ShrinkOutlined /> : <ExpandOutlined />
                  }
                  onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                >
                  {isVideoExpanded ? "Collapse Video" : "Expand Video"}
                </Button>
              }
              title={
                <Space>
                  <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                  >
                    Back to Courses
                  </Button>
                </Space>
              }
            >
              {currentLesson ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Space>
                      <Title level={3} style={{ margin: 0 }}>
                        {currentLesson.title}
                      </Title>
                      {currentLesson.status === "Completed" && (
                        <Badge
                          count={
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          }
                        />
                      )}
                    </Space>
                  </div>

                  {currentLesson?.type === "exam" &&
                  currentLesson.title === "Final Exam" ? (
                    <div
                      style={{
                        marginTop: 24,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {examScore > 0 && (
                        <Card
                          style={{
                            width: 800,
                            marginBottom: 16,
                            background:
                              "linear-gradient(135deg, #e6f7ff 0%, #f9f0ff 100%)",
                          }}
                        >
                          <Statistic
                            className="text-center"
                            title="Your Score"
                            value={examScore}
                            valueStyle={{
                              color: "#1890ff",
                              fontSize: 36,
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          />
                        </Card>
                      )}

                      {isCompleted ? (
                        <Card
                          style={{
                            width: "100%",
                            textAlign: "center",
                            background:
                              "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                          }}
                        >
                          <TrophyOutlined
                            style={{
                              fontSize: 64,
                              color: "#52c41a",
                              marginBottom: 16,
                            }}
                          />
                          <Title level={3} style={{ color: "#52c41a" }}>
                            🎉 Congratulations! 🎉
                          </Title>
                          <Paragraph>
                            You have successfully completed the course!
                          </Paragraph>
                          <Button
                            type="primary"
                            size="large"
                            icon={<FileTextOutlined />}
                            href="https://multi-course.onrender.com/my-certificate"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginTop: 16 }}
                          >
                            View Certificate
                          </Button>
                        </Card>
                      ) : examScore > 0 && examScore < 8 ? (
                        <Button
                          type="primary"
                          danger
                          size="large"
                          onClick={() => navigate(`/final-exam/${courseId}`)}
                          style={{ marginTop: 16 }}
                        >
                          Try Again
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => navigate(`/final-exam/${courseId}`)}
                          style={{ marginTop: 16 }}
                        >
                          Start Exam
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          marginBottom: 16,
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      >
                        <video
                          ref={videoRef}
                          src={currentLesson.video_url}
                          controls
                          style={{ width: "100%" }}
                          onEnded={handleVideoEnd}
                        />
                      </div>

                      {currentLesson.document_url && (
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          href={currentLesson.document_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginBottom: 16 }}
                        >
                          Download Document
                        </Button>
                      )}

                      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
                        <TabPane tab="Description" key="Description">
                          <Card>
                            <Title level={4}>Lesson Description</Title>
                            <Paragraph>{currentLesson.description}</Paragraph>
                          </Card>
                        </TabPane>

                        <TabPane tab="Note" key="Note">
                          {currentNote && (
                            <Alert
                              message="Your Note"
                              description={currentNote}
                              type="info"
                              style={{ marginBottom: 16 }}
                            />
                          )}
                          <TextArea
                            placeholder="Write your notes here..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            style={{ marginBottom: 16 }}
                          />
                          <Button type="primary" onClick={handleNoteSubmit}>
                            Save Note
                          </Button>
                        </TabPane>

                        <TabPane
                          tab="Comment"
                          key="Comment"
                          style={{ padding: "16px 0" }}
                        >
                          <Title level={4}>Comments</Title>
                          <Space
                            direction="vertical"
                            style={{ width: "100%", marginBottom: 16 }}
                          >
                            <TextArea
                              placeholder="Write your comment..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={3}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Text>Rating:</Text>
                              <Rate
                                value={rating}
                                onChange={(value) => setRating(value)}
                              />
                            </div>
                            <Button
                              type="primary"
                              onClick={() => {
                                if (note.trim()) {
                                  handleCommentSubmit();
                                }
                              }}
                            >
                              Post Comment
                            </Button>
                          </Space>

                          {currentLesson.comments &&
                          currentLesson.comments.length > 0 ? (
                            <List
                              itemLayout="horizontal"
                              dataSource={currentLesson.comments}
                              renderItem={(comment) => (
                                <List.Item>
                                  <Comment
                                    author={comment.author}
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    content={
                                      <div>
                                        <Rate
                                          disabled
                                          value={comment.rating || 5}
                                          style={{
                                            fontSize: 12,
                                            marginBottom: 8,
                                          }}
                                        />
                                        <Paragraph>{comment.comment}</Paragraph>
                                      </div>
                                    }
                                    datetime={new Date(
                                      comment.date
                                    ).toLocaleString()}
                                    actions={
                                      comment.author === userProfile?.fullname
                                        ? [
                                            <Button
                                              type="link"
                                              icon={<EditOutlined />}
                                              onClick={() =>
                                                showEditModal(comment)
                                              }
                                            >
                                              Edit
                                            </Button>,
                                            <Button
                                              type="link"
                                              danger
                                              icon={<DeleteOutlined />}
                                              onClick={() =>
                                                handleDeleteComment(comment._id)
                                              }
                                            >
                                              Delete
                                            </Button>,
                                          ]
                                        : null
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <Empty description="No comments yet" />
                          )}
                        </TabPane>
                      </Tabs>
                    </>
                  )}
                </div>
              ) : (
                <Empty description="No lessons have been selected yet" />
              )}
            </Card>
          </Col>

          {!isVideoExpanded && (
            <Col span={6}>
              <Card
                title={
                  <Space>
                    <BookOutlined />
                    <span>Course Content</span>
                    <Tag color="blue">{lessons.length}</Tag>
                  </Space>
                }
              >
                <Menu
                  mode="vertical"
                  selectedKeys={[currentLesson?._id]}
                  style={{ background: "transparent", border: "none" }}
                >
                  {lessons.map((lesson, index) => {
                    const isFinalExam = lesson._id === "exam_final";
                    const isFinalExamCompleted =
                      isFinalExam && isLessonCompleted("exam_final");
                    const completedLessons = lessons.filter((l) =>
                      isLessonCompleted(l._id)
                    );
                    const onlyFinalExamLeft =
                      completedLessons.length === lessons.length - 1 &&
                      !isFinalExamCompleted;

                    return (
                      <Menu.Item
                        key={lesson._id}
                        disabled={!canAccessLesson(index)}
                        onClick={() =>
                          canAccessLesson(index) && setCurrentLesson(lesson)
                        }
                        style={{
                          marginBottom: 8,
                          backgroundColor:
                            currentLesson?._id === lesson._id
                              ? "#e6f7ff"
                              : "white",
                          borderRadius: 8,
                          padding: "12px 16px",
                          height: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text ellipsis style={{ maxWidth: "80%" }}>
                            {lesson.title}
                          </Text>

                          {lesson._id === "exam_final" && isCompleted && (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          )}

                          {lesson._id !== "exam_final" &&
                            isLessonCompleted(lesson._id) && (
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                            )}

                          {!canAccessLesson(index) && (
                            <LockOutlined style={{ color: "#bfbfbf" }} />
                          )}
                        </div>

                        {lesson._id === "final_exam" &&
                          !isCompleted &&
                          onlyFinalExamLeft &&
                          !isCompleted && (
                            <Alert
                              message="Please start final exam to complete course"
                              type="info"
                              showIcon
                              style={{
                                marginTop: 8,
                                fontSize: 12,
                                padding: "4px 8px",
                              }}
                            />
                          )}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </Card>
            </Col>
          )}
        </Row>
      </Content>

      {/* Edit Comment Modal */}
      <Modal
        title="Edit Comment"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditComment}>
            Update Comment
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ marginBottom: 16 }}>
            <Text>Rating:</Text>
            <Rate
              value={editCommentRating}
              onChange={(value) => setEditCommentRating(value)}
              style={{ display: "block", marginTop: 8 }}
            />
          </div>
          <div>
            <Text>Comment:</Text>
            <TextArea
              rows={4}
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </Layout>
  );
};

export default CourseLearningPage;
