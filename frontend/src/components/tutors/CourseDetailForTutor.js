import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Layout,
  Typography,
  Tag,
  Button,
  Spin,
  Table,
  Card,
  Avatar,
  Modal,
  Collapse,
  Progress,
  Image,
  Divider,
  Statistic,
  Space,
  Alert,
  List,
  Rate,
  Result,
  Empty,
  Descriptions,
  message,
} from "antd";
import { Comment } from "@ant-design/compatible";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileAddOutlined,
  PlusOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
  FileExcelOutlined,
  WarningOutlined,
  CommentOutlined,
  EyeInvisibleOutlined,
  StarFilled,
  MessageFilled,
  LikeFilled,
  ClockCircleFilled,
  NumberOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateLessonModal from "./lesson/UpdateLessonModal";
import { useTheme } from "../context/ThemeContext";

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Panel } = Collapse;
const { Meta } = Card;

const CourseDetailForTutor = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [exams, setExams] = useState(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteLessonOpen, setIsDeleteLessonOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem("authToken");
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [showAllLessons, setShowAllLessons] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
const [studentProgress, setStudentProgress] = useState([]);

const openStudentDetailModal = (student) => {
  setSelectedStudent(student.student);

  // Flatten toàn bộ các bài học từ student.lessons
  // const allLessons = student.lessons.flatMap((item) => item.lesson);
  // console.log("All lessons:", allLessons); // 👉 Log ra đây

  // setStudentProgress(allLessons); // Cập nhật state với danh sách bài học đầy đủ

  setIsStudentDetailModalOpen(true);
};


const closeStudentDetailModal = () => {
  setIsStudentDetailModalOpen(false);
  setSelectedStudent(null);
};

  const isDarkMode = theme === "dark";

  const openCommentModal = () => {
    setSelectedComments(course.comments || []);
    setIsCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/progress/students/${courseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId, token]);

  const handleDeleteLesson = async () => {
    const token = localStorage.getItem("authToken");
    setIsDeleting(true);

    try {
      await axios.delete(
        `http://localhost:3000/api/lessons/${selectedLesson._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLessons((prevLessons) =>
        prevLessons.filter((lesson) => lesson._id !== selectedLesson._id)
      );
      message.success("Lesson deleted successfully!");
      setIsDeleteLessonOpen(false);
    } catch (err) {
      message.error("Failed to delete lesson");
      // console.error("Failed to delete lesson", err);
    } finally {
      setIsDeleting(false);
      setIsDeleteLessonOpen(false);
    }
  };

  const handleDeleteExam = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(
        `http://localhost:3000/api/exams/delete-exam/${exams._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Exam deleted successfully!");
      setIsDeleteModalOpen(false);
      setExams(null);
    } catch (err) {
      message.error("Failed to delete exam");
      console.error("Failed to delete exam", err);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const toggleShowQuestions = () => {
    setShowAllQuestions((prev) => !prev);
  };

  const openModal = (lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLesson(null);
    setIsModalOpen(false);
  };

  const handleUpdateLesson = async (formData) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `http://127.0.0.1:3000/api/lessons/${selectedLesson._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setLessons((prevLessons) =>
          prevLessons.map((lesson) =>
            lesson._id === selectedLesson._id ? response.data.lesson : lesson
          )
        );
        message.success("Lesson updated successfully!");
        closeModal();
      }
    } catch (error) {
      message.error("Failed to update lesson");
      console.error("Failed to update lesson", error);
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!token) {
        setErrorMessage("Please log in to view the course details.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      try {
        const courseResponse = await axios.get(
          `http://localhost:3000/api/courses/detail/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (courseResponse.status === 200) {
          setCourse(courseResponse.data.courseDetail);
          setLessons(courseResponse.data.lessons);
        }

        const examResponse = await fetch(
          `http://localhost:3000/api/exams/get-exam/${courseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (examResponse.ok) {
          const examData = await examResponse.json();
          setExams(examData);
        } else if (examResponse.status === 404) {
          setExams(null);
        }

        const incomeResponse = await axios.get(
          `http://localhost:3000/api/orders/total-earning-from-course`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (incomeResponse.status === 200) {
          const incomeData = incomeResponse.data;

          if (Array.isArray(incomeData)) {
            const courseIncome = incomeData.find(
              (income) => income.course_id === courseId
            );
            if (courseIncome) {
              setTotalIncome(courseIncome.totalIncome);
              setTotalSales(courseIncome.totalSales);
            }
          } else {
            console.warn("Expected array but received:", incomeData);
          }
        }

        // Fetch user role
        const userResponse = await axios.get(
          "http://localhost:3000/api/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (userResponse.status === 200) {
          setRole(userResponse.data.role);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("Course not found, showing alternative UI.");
          setCourse(null);
        } else {
          console.error("Error fetching data:", error);
          setErrorMessage("An error occurred while fetching course details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, navigate, token]);

  // Student table columns
  const studentColumns = [
    {
      title: "Avatar",
    dataIndex: "student",
    key: "avatar",
    render: (student) => <Avatar src={student.avatar} size="large" />,
  },
  {
    title: "Full Name",
    dataIndex: "student",
    key: "fullname",
    render: (student) => <Text>{student.fullname}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Enrolled" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "percent",
      key: "progress",
      render: (percent) => (
        <Progress
          percent={parseFloat(percent).toFixed(2)}
          size="small"
          status={percent >= 100 ? "success" : "active"}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading course details..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Result
        status="error"
        title="Error"
        subTitle={errorMessage}
        extra={
          <Button type="primary" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        }
      />
    );
  }

  // Lấy giá trị đánh giá trung bình nếu có các comment
  const getAverageRating = (comments) => {
    if (!comments || comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return (sum / comments.length).toFixed(1);
  };

  // Check if the course is active
  const isCourseActive = course && course.status === true;

  return (
    <Layout className={isDarkMode ? "bg-gray-900 text-white" : "bg-white"}>
      <Header className="bg-transparent flex items-center p-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          Back
        </Button>
      </Header>

      <Content className="px-4 py-8">
        {course ? (
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Course Header */}
            <Card
              className={`w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
              bordered={false}
              headStyle={{ borderBottom: 0 }}
            >
              <div className="flex flex-col items-center">
                <Title
                  level={1}
                  className={`text-center mb-6 ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  {course.title}
                </Title>

                <Space className="mb-4 flex flex-wrap justify-center">
                  <Tag color="gold" className="m-1 px-3 py-1 text-base">
                    {course.category}
                  </Tag>
                  <Tag color="green" className="m-1 px-3 py-1 text-base">
                    {course.price.toLocaleString()} VND
                  </Tag>
                  <Tag
                    color={course.status ? "green" : "red"}
                    className="m-1 px-3 py-1 text-base"
                  >
                    {course.status ? "Available" : "Not Available"}
                  </Tag>
                  <Tag color="blue" className="m-1 px-3 py-1 text-base">
                    {new Date(course.createAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </Tag>
                </Space>

                <Paragraph
                  className={`text-center max-w-3xl mx-auto mb-8 text-lg ${
                    isDarkMode ? "text-gray-300" : ""
                  }`}
                >
                  {course.description}
                </Paragraph>

                {course.image && (
                  <div className="mb-6 w-full max-w-4xl mx-auto">
                    <Image
                      src={course.image}
                      alt={course.title}
                      className="rounded-lg shadow-lg"
                      width="100%"
                      height={500}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl mt-8">
                  <Card
                    className={`w-full md:w-1/2 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-blue-900 to-indigo-900"
                        : "bg-gradient-to-r from-green-400 to-blue-500"
                    } text-white shadow-lg`}
                  >
                    <Statistic
                      title={
                        <Text strong className="text-white text-lg">
                          Total Income
                        </Text>
                      }
                      value={totalIncome}
                      prefix="$"
                      className="mb-2"
                      valueStyle={{ color: "white", fontSize: "28px" }}
                    />
                    <Statistic
                      title={
                        <Text strong className="text-white text-lg">
                          Total Sales
                        </Text>
                      }
                      value={totalSales}
                      suffix="orders"
                      valueStyle={{ color: "white", fontSize: "28px" }}
                    />
                  </Card>

                  {course.comments && course.comments.length > 0 && (
                    <Card
                      className={`w-full md:w-1/2 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      } shadow-lg`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <StarFilled className="text-yellow-400 text-xl" />
                        <Text strong className="text-3xl">
                          {getAverageRating(course.comments)}
                        </Text>
                      </div>
                      <Rate
                        disabled
                        defaultValue={parseFloat(
                          getAverageRating(course.comments)
                        )}
                        className="flex justify-center mb-3"
                      />
                      <div className="text-center">
                        <Text type="secondary">
                          Based on {course.comments.length}{" "}
                          {course.comments.length === 1 ? "review" : "reviews"}
                        </Text>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </Card>

            {/* Reviews Section - Hiển thị trực tiếp trên trang */}
            <Card
              className={`w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
              bordered={false}
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageFilled className="text-blue-500 mr-2" />
                    <Title
                      level={3}
                      className={`m-0 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Course Reviews
                    </Title>
                  </div>
                </div>
              }
            >
              {course.comments && course.comments.length > 0 ? (
                <div className="space-y-6">
                  {course.comments.slice(0, 3).map((comment, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      } transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <Avatar
                          icon={<UserOutlined />}
                          size={50}
                          className={`${
                            isDarkMode ? "bg-blue-600" : "bg-blue-500"
                          } flex-shrink-0`}
                        />
                        <div className="ml-4 flex-grow">
                          <div className="flex items-center justify-between flex-wrap">
                            <Text
                              strong
                              className={`text-lg ${
                                isDarkMode ? "text-white" : ""
                              }`}
                            >
                              {comment.author}
                            </Text>
                            <div className="flex items-center mt-1 sm:mt-0">
                              <ClockCircleFilled
                                className={`mr-1 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                              <Text type="secondary" className="text-sm">
                                {new Date(comment.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </Text>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center">
                            <Rate
                              disabled
                              defaultValue={comment.rating}
                              className="text-yellow-400 text-sm"
                            />
                            <Text strong className="ml-2">
                              {comment.rating.toFixed(1)}
                            </Text>
                          </div>

                          <Paragraph
                            className={`mt-3 ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                            ellipsis={{
                              rows: 3,
                              expandable: true,
                              symbol: "Read more",
                            }}
                          >
                            {comment.comment}
                          </Paragraph>

                          <div className="mt-3 flex items-center">
                            <Button
                              type="text"
                              size="small"
                              icon={<LikeFilled />}
                              className={
                                isDarkMode
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-500 hover:text-blue-500"
                              }
                            >
                              Helpful
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {course.comments.length > 3 && (
                    <div className="text-center mt-4">
                      <Button
                        type="primary"
                        ghost
                        onClick={openCommentModal}
                        className={`rounded-full px-6 ${
                          isDarkMode
                            ? "border-blue-400 text-blue-400 hover:border-blue-300 hover:text-blue-300"
                            : ""
                        }`}
                      >
                        View All {course.comments.length} Reviews
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Alert
                  message="No Reviews Yet"
                  description="Be the first to review this course!"
                  type="info"
                  showIcon
                  className="my-4"
                />
              )}
            </Card>

            {/* Students Section */}
            <Card
              title={
                <Title
                  level={3}
                  className={`flex items-center ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  <UserOutlined className="mr-2" /> Students Enrolled
                </Title>
              }
              className={`w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
              bordered={false}
            >
              {students.length > 0 ? (
              <Table
              dataSource={students}
              columns={studentColumns}
              rowKey={(record) => record.student._id}
              pagination={{ pageSize: 10 }}
              className="w-full"
              onRow={(record) => ({
                onClick: () => openStudentDetailModal(record),
                style: { cursor: 'pointer' }
              })}
            />
              ) : (
                <Alert
                  message="No students enrolled"
                  description="There are no students enrolled in this course yet."
                  type="info"
                  showIcon
                />
              )}
            </Card>

            {/* Exams Section */}
            <Card
              title={
                <Title
                  level={3}
                  className={`flex items-center ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  <FileExcelOutlined className="mr-2" /> Course Exams
                </Title>
              }
              className={`w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
              bordered={false}
              extra={
                role !== "Admin" && !isCourseActive &&
                !exams && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/create-exam/${courseId}`)}
                  >
                    Create Exam
                  </Button>
                )
              }
            >
              {exams ? (
                <div>
                  <Card
                    className={`mb-4 ${
                      isDarkMode ? "bg-gray-700 text-white" : "bg-gray-50"
                    }`}
                    bordered={false}
                  >
                    <Meta
                      title={
                        <Text
                          strong
                          className={
                            isDarkMode ? "text-white text-lg" : "text-lg"
                          }
                        >
                          {exams.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" className="w-full mt-2">
                          <Text className={isDarkMode ? "text-gray-300" : ""}>
                            <strong>Total Marks:</strong> {exams.totalMark}
                          </Text>
                          <Text className={isDarkMode ? "text-gray-300" : ""}>
                            <strong>Duration:</strong> {exams.duration} minutes
                          </Text>
                        </Space>
                      }
                    />

                    <Divider className={isDarkMode ? "bg-gray-600" : ""} />

                    <div>
                      <Title
                        level={5}
                        className={`mb-4 ${isDarkMode ? "text-white" : ""}`}
                      >
                        Questions:
                      </Title>
                      <Collapse
                        defaultActiveKey={[]}
                        className={isDarkMode ? "bg-gray-700" : ""}
                      >
                        {(showAllQuestions
                          ? exams.questions
                          : exams.questions.slice(0, 3)
                        ).map((question, index) => (
                          <Panel
                            header={`Question ${index + 1}: ${
                              question.question
                            }`}
                            key={index}
                            className={
                              isDarkMode ? "bg-gray-600 border-gray-700" : ""
                            }
                            headerClass={isDarkMode ? "text-white" : ""}
                          >
                            <List
                              dataSource={question.answers}
                              renderItem={(answer) => (
                                <List.Item
                                  className={`py-2 px-4 rounded-md my-1 ${
                                    answer.isCorrect
                                      ? isDarkMode
                                        ? "bg-green-900 border-l-4 border-green-500 text-green-300"
                                        : "bg-green-100 border-l-4 border-green-500 text-green-700"
                                      : isDarkMode
                                      ? "bg-red-900 border-l-4 border-red-500 text-red-300"
                                      : "bg-red-50 border-l-4 border-red-300 text-red-500"
                                  }`}
                                >
                                  <span className="ml-2">{answer.answer}</span>
                                </List.Item>
                              )}
                            />
                          </Panel>
                        ))}
                      </Collapse>

                      {exams.questions.length > 3 && (
                        <Button
                          type="link"
                          onClick={toggleShowQuestions}
                          icon={
                            showAllQuestions ? (
                              <EyeInvisibleOutlined />
                            ) : (
                              <EyeOutlined />
                            )
                          }
                          className={`mt-4 ${
                            isDarkMode ? "text-blue-400" : ""
                          }`}
                        >
                          {showAllQuestions ? "Show Less" : "Show More"}
                        </Button>
                      )}
                    </div>
                  </Card>

                  {role !== "Admin" && !isCourseActive && (
                    <Space>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/update-exam/${courseId}`)}
                      >
                        Update
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        Delete
                      </Button>
                    </Space>
                  )}
                </div>
              ) : (
                <Alert
                  message="No exams found"
                  description="There are no exams created for this course yet."
                  type="info"
                  showIcon
                />
              )}
            </Card>

            {/* Lessons Section */}
            <Card
              title={
                <Title
                  level={3}
                  className={`flex items-center ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  <BookOutlined className="mr-2" /> Course Lessons
                </Title>
              }
              className={`w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
              bordered={false}
              extra={
                role !== "Admin" && !isCourseActive && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`/create-lesson/${courseId}`)}
                  >
                    Create Lesson
                  </Button>
                )
              }
            >
              {lessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessons.map((lesson) => (
                    <Card
                      key={lesson._id}
                      hoverable
                      className={`${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      } border-l-4 border-blue-500 transition-all hover:shadow-xl`}
                      actions={[
                        <Button
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            navigate(`/lesson-detail/${lesson._id}`)
                          }
                        >
                          View
                        </Button>,
                        role !== "Admin" && !isCourseActive && (
                          <Button
                            key="edit"
                            icon={<EditOutlined />}
                            onClick={() => openModal(lesson)}
                          >
                            Update
                          </Button>
                        ),
                        role !== "Admin" && !isCourseActive && (
                          <Button
                            key="delete"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setIsDeleteLessonOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        ),
                      ].filter(Boolean)}
                    >
                      <div className="flex items-center mb-2">
                        <Tag color="blue" className="mr-2">
                          #{lesson.number || "N/A"}
                        </Tag>
                        <Text
                          strong
                          className={`text-blue-500 text-lg ${
                            isDarkMode ? "text-blue-400" : ""
                          }`}
                        >
                          {lesson.title}
                        </Text>
                      </div>
                      <Paragraph
                        className={
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }
                        ellipsis={{ rows: 3, expandable: false }}
                      >
                        {lesson.description}
                      </Paragraph>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert
                  message="No lessons found"
                  description="There are no lessons created for this course yet."
                  type="info"
                  showIcon
                />
              )}
            </Card>
          </div>
        ) : (
          <Result
            status="warning"
            title="Course Not Found"
            subTitle="The course you're looking for does not exist or has been removed."
            extra={
              <Button type="primary" onClick={() => navigate("/courses")}>
                Back to Courses
              </Button>
            }
          />
        )}
      </Content>

      {/* Modals */}
      {isModalOpen && selectedLesson && (
        <UpdateLessonModal
          lesson={selectedLesson}
          onClose={closeModal}
          onUpdate={handleUpdateLesson}
          visible={isModalOpen}
        />
      )}

      <Modal
        title={
          <Text strong className={isDarkMode ? "text-white" : ""}>
            Delete Lesson
          </Text>
        }
        open={isDeleteLessonOpen}
        onCancel={() => setIsDeleteLessonOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteLessonOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            danger
            loading={isDeleting}
            onClick={handleDeleteLesson}
          >
            Delete
          </Button>,
        ]}
        className={isDarkMode ? "dark-theme-modal" : ""}
      >
        <Alert
          message="Warning"
          description="Are you sure you want to delete this lesson? This action cannot be undone."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
      </Modal>

      <Modal
        title={
          <Text strong className={isDarkMode ? "text-white" : ""}>
            Delete Exam
          </Text>
        }
        open={isDeleteModalOpen}
        onCancel={handleDeleteModalClose}
        footer={[
          <Button key="cancel" onClick={handleDeleteModalClose}>
            Cancel
          </Button>,
          <Button key="delete" danger onClick={handleDeleteExam}>
            Delete
          </Button>,
        ]}
        className={isDarkMode ? "dark-theme-modal" : ""}
      >
        <Alert
          message="Warning"
          description="Are you sure you want to delete this exam? This action cannot be undone."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
      </Modal>

      {/* Modal hiển thị tất cả comments */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageFilled className="text-blue-500 mr-2" />
              <Text
                strong
                className={`text-lg ${isDarkMode ? "text-white" : ""}`}
              >
                Course Reviews
              </Text>
            </div>
            {selectedComments && selectedComments.length > 0 && (
              <div className="flex items-center">
                <StarFilled className="text-yellow-400 mr-1" />
                <Text strong>
                  {(
                    selectedComments.reduce(
                      (acc, comment) => acc + comment.rating,
                      0
                    ) / selectedComments.length
                  ).toFixed(1)}
                </Text>
                <Text type="secondary" className="ml-2">
                  ({selectedComments.length})
                </Text>
              </div>
            )}
          </div>
        }
        open={isCommentModalOpen}
        onCancel={closeCommentModal}
        footer={[
          <Button key="close" type="primary" onClick={closeCommentModal}>
            Close
          </Button>,
        ]}
        width={700}
        className={isDarkMode ? "dark-theme-modal" : ""}
      >
        {selectedComments && selectedComments.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={selectedComments}
            renderItem={(comment, index) => (
              <List.Item
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start">
                  <Avatar
                    icon={<UserOutlined />}
                    size={50}
                    className={`${
                      isDarkMode ? "bg-blue-600" : "bg-blue-500"
                    } flex-shrink-0`}
                  />
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center justify-between flex-wrap">
                      <Text
                        strong
                        className={`text-lg ${isDarkMode ? "text-white" : ""}`}
                      >
                        {comment.author}
                      </Text>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <ClockCircleFilled
                          className={`mr-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <Text type="secondary" className="text-sm">
                          {new Date(comment.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center">
                      <Rate
                        disabled
                        defaultValue={comment.rating}
                        className="text-yellow-400 text-sm"
                      />
                      <Text strong className="ml-2">
                        {comment.rating.toFixed(1)}
                      </Text>
                    </div>

                    <Paragraph
                      className={`mt-3 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {comment.comment}
                    </Paragraph>

                    <div className="mt-3 flex items-center">
                      <Button
                        type="text"
                        size="small"
                        icon={<LikeFilled />}
                        className={
                          isDarkMode
                            ? "text-gray-400 hover:text-white"
                            : "text-gray-500 hover:text-blue-500"
                        }
                      >
                        Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              size: "small",
              hideOnSinglePage: true,
              className: "mt-4",
            }}
          />
        ) : (
          <Alert
            message="No Reviews Yet"
            description="Be the first to review this course!"
            type="info"
            showIcon
            className="my-4"
          />
        )}
      </Modal>

      <Modal
  title={
    <Text strong className={isDarkMode ? "text-white" : ""}>
      Student Details
    </Text>
  }
  open={isStudentDetailModalOpen}
  onCancel={closeStudentDetailModal}
  footer={[
    <Button key="close" type="primary" onClick={closeStudentDetailModal}>
      Close
    </Button>,
  ]}
  width={700}
  className={isDarkMode ? "dark-theme-modal" : ""}
>
  {selectedStudent && (
    <div className="space-y-6">
      <div className="flex items-center">
        <Avatar 
          src={selectedStudent.avatar} 
          size={64} 
          icon={!selectedStudent.avatar && <UserOutlined />} 
        />
        <div className="ml-4">
          <Title level={4} className={isDarkMode ? "text-white" : ""}>
            {selectedStudent.fullname ?? "No name"}
            
          </Title>
          <Text type="secondary">{selectedStudent.email ?? "No email"}</Text>
         
        </div>
      </div>
      
      <Divider className={isDarkMode ? "bg-gray-600" : ""} />
      
      <Descriptions
        title="Student Information"
        bordered 
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Address">{selectedStudent.address ?? "No address"}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{selectedStudent.phone ?? "No phone number"}</Descriptions.Item>
        <Descriptions.Item label="Gender">{selectedStudent.gender ?? "No gender"}</Descriptions.Item>
        <Descriptions.Item label="Birthday">
          {new Date(selectedStudent.birthday).toLocaleDateString()}
        </Descriptions.Item>
      </Descriptions>
      
      {/* <Divider orientation="left">Course Progress</Divider>
      
      <List
        header={<div>Completed Lessons</div>}
        bordered
        dataSource={studentProgress}
        renderItem={(lesson) => (
          <List.Item>
            <List.Item.Meta
              avatar={<BookOutlined />}
              title={lesson.title || "Untitled Lesson"}
              description={`Completed on: ${new Date(lesson.status).toLocaleDateString()}`}
            />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <Empty
              description="No completed lessons yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      /> */}
    </div>
  )}
</Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </Layout>
  );
};

export default CourseDetailForTutor;
