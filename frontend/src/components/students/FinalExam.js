import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Button,
  Form,
  Checkbox,
  Radio,
  Spin,
  Badge,
  Alert,
  Modal,
  Input,
  Rate,
  Progress,
  Statistic,
  Divider,
  Result,
  Space,
  notification,
  List,
  Tag,
  Row,
  Col,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  FileTextOutlined,
  SendOutlined,
  WarningOutlined,
  LeftOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Content } = Layout;
const { Countdown } = Statistic;

const FinalExam = () => {
  const { courseId, exam_id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(null);
  const [totalMark, setTotalMark] = useState(null);
  const [allCorrectResults, setAllCorrectResults] = useState({});
  const token = localStorage.getItem("authToken");
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [certificate, setCertificate] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [countdownDeadline, setCountdownDeadline] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [form] = Form.useForm();

  // Handle back button click
  const handleBack = () => {
    if (!examSubmitted && Object.keys(answers).length > 0) {
      // If exam is in progress and answers exist, show confirmation
      setShowExitConfirm(true);
    } else {
      // Otherwise, just go back
      navigate(-1);
    }
  };

  const handleCommentCourseSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post(
        "https://multicourse-q1mn.onrender.com/api/comments/create-course-comment",
        { courseId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({
        message: "Success",
        description: "Comment submitted successfully!",
      });
      setIsResultModalVisible(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
      notification.error({
        message: "Error",
        description: "Failed to submit comment. Please try again.",
      });
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `https://multicourse-q1mn.onrender.com/api/exams/take-exam/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExam(response.data.exam);
        const durationInMinutes = response.data.exam.duration;
        const durationInMilliseconds = durationInMinutes * 60 * 1000;

        // Calculate deadline for countdown
        const deadline = Date.now() + durationInMilliseconds;
        setCountdownDeadline(deadline);
        setTimeLeft(durationInMinutes * 60); // in seconds
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam:", error);
        notification.error({
          message: "Error",
          description: "Failed to load exam. Please try again later.",
        });
        setLoading(false);
      }
    };
    fetchExam();
  }, [courseId, token]);

  // Countdown finish handler
  const onCountdownFinish = () => {
    if (!examSubmitted) {
      notification.warning({
        message: "Time's Up!",
        description:
          "The exam time has ended. Your answers are being submitted automatically.",
      });
      handleSubmit();
    }
  };

  // Handle answer change
  const handleAnswerChange = (question_id, answer, questionType, isChecked) => {
    setAnswers((prevAnswers) => {
      if (questionType === "Multiple Choice") {
        const updatedAnswers = isChecked
          ? [...(prevAnswers[question_id] || []), answer]
          : prevAnswers[question_id]?.filter((ans) => ans !== answer) || [];
        return { ...prevAnswers, [question_id]: updatedAnswers };
      } else {
        return { ...prevAnswers, [question_id]: [answer] };
      }
    });
  };

  // Submit exam
  const handleSubmit = async () => {
    if (examSubmitted) return;

    setSubmitting(true);
    setExamSubmitted(true);

    // Stop the countdown by setting deadline to null
    setCountdownDeadline(null);

    try {
      console.log("Answers State:", answers);

      const formattedAnswers = Object.keys(answers)
        .map((question_id) => {
          const questionData = exam.questions.find(
            (q) => q.question_id === question_id
          );
          if (!questionData) return null;

          const correctAnswers = questionData.answers
            .filter((ans) => ans.isCorrect)
            .map((ans) => ans.answer);

          const selectedAnswers = answers[question_id] || [];

          const isCorrect =
            selectedAnswers.length === correctAnswers.length &&
            correctAnswers.every((ans) => selectedAnswers.includes(ans));

          return {
            question_id,
            questionType: questionData.questionType,
            answers: selectedAnswers.map((answer) => {
              const matchingAnswer = questionData.answers.find(
                (qAnswer) => qAnswer.answer === answer
              );
              return {
                answer_id: matchingAnswer ? matchingAnswer._id : "Unknown",
                isCorrect: isCorrect,
              };
            }),
          };
        })
        .filter(Boolean);

      const response = await axios.post(
        `https://multicourse-q1mn.onrender.com/api/exams/submit-exam/${exam.exam_id}`,
        { course_id: courseId, questions: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setScore(response.data.studentExamRS.score);
      setTotalMark(response.data.studentExamRS.totalMark);
      setIsResultModalVisible(true);

      const passThreshold = 0.8 * response.data.studentExamRS.totalMark;
      const isPassed = response.data.studentExamRS.score >= passThreshold;

      if (isPassed) {
        try {
          const certResponse = await axios.post(
            `https://multicourse-q1mn.onrender.com/api/certificates/create-certificate/${courseId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCertificate(certResponse.data.certificate);
          await fetchCertificate();
          notification.success({
            message: "Congratulations!",
            description: "You've passed the exam and earned a certificate!",
            icon: <TrophyOutlined style={{ color: "#FFD700" }} />,
          });
        } catch (certError) {
          console.error("Error generating certificate:", certError);
          notification.error({
            message: "Certificate Error",
            description: "There was an error generating your certificate.",
          });
        }
      } else {
        notification.info({
          message: "Exam Result",
          description: "You did not pass the exam. Try again next time!",
          icon: <WarningOutlined style={{ color: "#faad14" }} />,
        });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      notification.error({
        message: "Error",
        description: "Failed to submit exam. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchCertificate = async () => {
    try {
      const response = await axios.get(
        `https://multicourse-q1mn.onrender.com/api/certificates/get-certificate/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.certificate.certificate_url) {
        setCertificateUrl(response.data.certificate.certificate_url);
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
    }
  };

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
        <Spin size="large" tip="Loading exam..." />
      </div>
    );
  }

  if (!exam) {
    return (
      <Result
        status="404"
        title="Exam Not Found"
        subTitle="Sorry, the exam you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      />
    );
  }

  // Calculate progress percent based on answered questions
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const progressPercent = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  // Calculate pass status
  const passThreshold = totalMark ? 0.8 * totalMark : null;
  const passStatus =
    score !== null ? (score >= passThreshold ? "success" : "error") : null;

  return (
    <Layout style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Content style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
        {/* Back button */}
        <Button
          icon={<LeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>

        <Card
          title={
            <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ margin: 0 }}>
                {exam.title}
              </Title>
              <Paragraph type="secondary">
                Duration: <Text strong>{exam.duration} minutes</Text>
              </Paragraph>
            </div>
          }
          extra={
            examSubmitted ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Exam Submitted
              </Tag>
            ) : (
              countdownDeadline && (
                <Countdown
                  title="Time Remaining"
                  value={countdownDeadline}
                  onFinish={onCountdownFinish}
                  format="HH:mm:ss"
                  valueStyle={{ fontSize: "1.2rem", color: "#ff4d4f" }}
                />
              )
            )
          }
          style={{ marginBottom: 24 }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Alert
              message="Exam Instructions"
              description="Read each question carefully. For multiple choice questions, select all that apply. For single choice questions, select one answer only."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Text>Progress:</Text>
              <Progress
                percent={progressPercent}
                status={examSubmitted ? passStatus || "normal" : "active"}
                strokeColor={
                  examSubmitted && passStatus === "success"
                    ? "#52c41a"
                    : undefined
                }
              />
            </div>
          </Space>
        </Card>

        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <List
            itemLayout="vertical"
            dataSource={exam.questions}
            renderItem={(question, index) => (
              <Card
                key={question.question_id}
                style={{ marginBottom: 16 }}
                title={
                  <Space wrap>
                    <Badge
                      count={index + 1}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                    <Text strong style={{ wordBreak: "break-word" }}>
                      {question.question}
                    </Text>
                    <Tag
                      color={
                        question.questionType === "Multiple Choice"
                          ? "geekblue"
                          : "purple"
                      }
                      style={{
                        whiteSpace: "normal", // Cho phép xuống dòng
                        wordBreak: "break-word", // Ngắt từ nếu quá dài
                      }}
                    >
                      {question.questionType}
                    </Tag>
                  </Space>
                }
              >
                <Form.Item name={["answers", question.question_id]}>
                  {question.questionType === "Multiple Choice" ? (
                    <Checkbox.Group style={{ width: "100%" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {question.answers.map((answer) => (
                          <Checkbox
                            key={answer.answer}
                            value={answer.answer}
                            checked={
                              answers[question.question_id]?.includes(
                                answer.answer
                              ) || false
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                question.question_id,
                                answer.answer,
                                question.questionType,
                                e.target.checked
                              )
                            }
                            disabled={examSubmitted}
                          >
                            {answer.answer}
                          </Checkbox>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  ) : (
                    <Radio.Group style={{ width: "100%" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {question.answers.map((answer) => (
                          <Radio
                            key={answer.answer}
                            value={answer.answer}
                            checked={
                              answers[question.question_id]?.includes(
                                answer.answer
                              ) || false
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                question.question_id,
                                answer.answer,
                                question.questionType,
                                e.target.checked
                              )
                            }
                            disabled={examSubmitted}
                          >
                            {answer.answer}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  )}
                </Form.Item>

                {allCorrectResults[question.question_id] !== undefined && (
                  <Alert
                    type={
                      allCorrectResults[question.question_id]
                        ? "success"
                        : "error"
                    }
                    message={
                      allCorrectResults[question.question_id]
                        ? "Correct!"
                        : "Incorrect"
                    }
                    showIcon
                  />
                )}
              </Card>
            )}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Button
                onClick={handleBack}
                size="large"
                block
                style={{ marginBottom: 24 }}
                icon={<LeftOutlined />}
              >
                Back to Course
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={submitting}
                disabled={examSubmitted}
                style={{ marginBottom: 24 }}
                icon={<SendOutlined />}
              >
                Submit Exam
              </Button>
            </Col>
          </Row>
        </Form>

        {score !== null && totalMark !== null && !isResultModalVisible && (
          <Card>
            <Result
              status={passStatus}
              title="Exam Result"
              subTitle={`You scored ${score} out of ${totalMark} (${(
                (score / totalMark) *
                100
              ).toFixed(2)}%)`}
              extra={[
                certificateUrl && (
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    href={certificateUrl}
                    target="_blank"
                    key="certificate"
                  >
                    View Certificate
                  </Button>
                ),
                <Button
                  key="feedback"
                  onClick={() => setIsResultModalVisible(true)}
                >
                  Leave Feedback
                </Button>,
                <Button key="back" onClick={handleBack} icon={<LeftOutlined />}>
                  Back to Course
                </Button>,
              ]}
            />
          </Card>
        )}

        {/* Exit confirmation modal */}
        <Modal
          title="Leave Exam?"
          open={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          footer={[
            <Button key="stay" onClick={() => setShowExitConfirm(false)}>
              Stay on Exam
            </Button>,
            <Button key="leave" danger onClick={() => navigate(-1)}>
              Leave Exam (Answers will be lost)
            </Button>,
          ]}
        >
          <Alert
            message="Warning"
            description="You have unsaved answers. If you leave now, your progress will be lost. Are you sure you want to leave?"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Modal>

        {/* Result modal */}
        <Modal
          title="Exam Result"
          open={isResultModalVisible}
          onCancel={() => setIsResultModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsResultModalVisible(false)}>
              Close
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitting}
              onClick={handleCommentCourseSubmit}
            >
              Submit Feedback
            </Button>,
          ]}
        >
          <div style={{ marginBottom: 16 }}>
            <Statistic
              title="Your Score"
              value={score}
              suffix={`/ ${totalMark} (${
                score && totalMark ? ((score / totalMark) * 100).toFixed(2) : 0
              }%)`}
              valueStyle={{
                color: passStatus === "success" ? "#3f8600" : "#cf1322",
              }}
            />
            <Divider />
          </div>

          <Form layout="vertical">
            <Form.Item label="How would you rate this course?">
              <Rate
                allowHalf
                value={rating}
                onChange={setRating}
                style={{ fontSize: 36 }}
              />
            </Form.Item>
            <Form.Item label="Share your feedback about the course:">
              <TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What could be improved?"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default FinalExam;
