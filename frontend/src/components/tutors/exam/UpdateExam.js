import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Form, 
  Input, 
  Button, 
  InputNumber, 
  Card, 
  Checkbox, 
  message, 
  Typography, 
  Divider, 
  Space, 
  Spin, 
  Alert, 
  Tooltip,
  notification 
} from "antd";
import { 
  DeleteOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  WarningOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { ToastContainer } from "react-toastify";

const { Title, Text } = Typography;

const UpdateExam = () => {
  const { examId, courseId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [totalMark, setTotalMark] = useState(0);

  const token = localStorage.getItem("authToken");

  // Calculate total marks whenever questions change
  useEffect(() => {
    if (exam) {
      const calculatedTotalMark = exam.questions.reduce(
        (acc, question) => acc + Number(question.marks || 0),
        0
      );
      
      // Chỉ cập nhật khi totalMark thực sự thay đổi để tránh vòng lặp vô hạn
      if (calculatedTotalMark !== totalMark) {
        setTotalMark(calculatedTotalMark);
        
        // Cập nhật form field
        form.setFieldValue('totalMark', calculatedTotalMark);
        
        // Cập nhật exam object
        setExam((prevExam) => {
          if (prevExam.totalMark === calculatedTotalMark) {
            return prevExam;
          }
          return { ...prevExam, totalMark: calculatedTotalMark };
        });
      }
    }
  }, [exam?.questions, totalMark, form]);

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(
          `https://multicourse-q1mn.onrender.com/api/exams/get-exam/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExam(response.data);
        
        // Set initial total mark based on fetched data
        const initialTotalMark = response.data.questions.reduce(
          (acc, question) => acc + Number(question.marks || 0),
          0
        );
        setTotalMark(initialTotalMark);
        
        // Initialize form values
        form.setFieldsValue({
          title: response.data.title,
          duration: response.data.duration,
          totalMark: initialTotalMark
        });
      } catch (err) {
        setError("Failed to fetch exam details");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, courseId, token, form]);

  const handleChange = (e, questionIndex, answerIndex) => {
    const { name, value, checked, type } = e.target;
    
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      
      if (answerIndex !== undefined) {
        if (name === "isCorrect") {
          // Luôn cho phép chọn nhiều đáp án đúng (Multiple Choice)
          updatedQuestions[questionIndex].answers[answerIndex].isCorrect = checked;
        } else {
          updatedQuestions[questionIndex].answers[answerIndex][name] = value;
        }
      } else {
        updatedQuestions[questionIndex][name] = value;
      }
      
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteQuestion = (index) => {
    setExam((prevExam) => {
      const updatedQuestions = prevExam.questions.filter((_, i) => i !== index);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteAnswer = (qIndex, aIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].answers.splice(aIndex, 1);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const validateExam = () => {
    // Check if there are any questions
    if (!exam.questions || exam.questions.length === 0) {
      api.warning({
        message: 'Validation Error',
        description: 'Please add at least one question to the exam',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
      return false;
    }
    
    // Chỉ kiểm tra validation trên những câu hỏi đã được điền
    // (bỏ qua câu hỏi mới thêm vào nhưng chưa điền nội dung)
    const completedQuestions = exam.questions.filter(q => q.question.trim());
    
    // Kiểm tra nếu có ít nhất một câu hỏi đã được điền
    if (completedQuestions.length === 0) {
      api.warning({
        message: 'Validation Error',
        description: 'Please complete at least one question',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
      return false;
    }
    
    // Chỉ kiểm tra validation trên những câu hỏi đã được điền
    for (const question of completedQuestions) {
      // Kiểm tra điểm số
      if (!question.marks) {
        api.warning({
          message: 'Validation Error',
          description: 'All completed questions must have marks assigned',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Kiểm tra câu trả lời
      if (!question.answers || question.answers.length === 0) {
        api.warning({
          message: 'Validation Error',
          description: 'All completed questions must have at least one answer',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Kiểm tra nội dung câu trả lời
      const hasEmptyAnswers = question.answers.some(a => !a.answer.trim());
      if (hasEmptyAnswers) {
        api.warning({
          message: 'Validation Error',
          description: 'All answers must have text',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Kiểm tra câu trả lời đúng
      if (!question.answers.some(a => a.isCorrect)) {
        api.warning({
          message: 'Validation Error',
          description: 'Each completed question must have at least one correct answer',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      if (!validateExam()) {
        return;
      }
      
      // Prepare data for submission
      const updatedExam = {
        ...exam,
        totalMark: Number(totalMark),
        duration: Number(exam.duration),
        questions: exam.questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
        })),
      };

      await axios.put(
        `https://multicourse-q1mn.onrender.com/api/exams/update-exam/${exam._id}`,
        updatedExam,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      message.success("Exam updated successfully!");
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      message.error("Failed to update exam. Please check your input and try again.");
      console.error("Failed to update exam", err);
    }
  };

  const handleAddQuestion = () => {
    setExam((prevExam) => {
      const newQuestion = {
        question: "",
        marks: 1,
        questionType: "Multiple Choice", // Luôn đặt là Multiple Choice cho câu hỏi mới
        answers: [{ answer: "", isCorrect: false }],
      };
      const updatedExam = { ...prevExam, questions: [...prevExam.questions, newQuestion] };
      return updatedExam;
    });
  };

  const handleAddAnswer = useCallback((qIndex) => {
    setExam((prevExam) => {
      if (!prevExam || !prevExam.questions) return prevExam;

      return {
        ...prevExam,
        questions: prevExam.questions.map((q, index) =>
          index === qIndex
            ? {
                ...q,
                answers: [...q.answers, { answer: "", isCorrect: false }],
              }
            : q
        ),
      };
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" />
    </div>
  );
  
  if (error) return (
    <div className="max-w-3xl mx-auto p-6">
      <Alert 
        type="error" 
        message="Error" 
        description={error} 
        showIcon 
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {contextHolder}
      <Card className="shadow-lg rounded-lg">
        <Title level={2} className="mb-6 text-center">
          Update Exam
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Exam Title"
            name="title"
            rules={[{ required: true, message: "Title cannot be empty!" }]}
          >
            <Input 
              placeholder="Enter exam title" 
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Total Mark (auto-calculated)"
              name="totalMark"
            >
              <InputNumber
                className="w-full"
                min={0}
                value={totalMark}
                disabled
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              label="Duration (minutes)"
              name="duration"
              rules={[
                { required: true, message: "Duration is required!" },
                { type: 'number', min: 1, message: "Duration must be greater than zero!" }
              ]}
            >
              <InputNumber
                className="w-full"
                min={1}
                value={exam.duration}
                onChange={(value) => setExam(prev => ({ ...prev, duration: value }))}
                size="large"
              />
            </Form.Item>
          </div>

          <Divider orientation="left">Questions</Divider>
          
          {exam.questions.map((question, qIndex) => (
            <Card 
              key={question._id || qIndex} 
              className="mb-6 bg-gray-50"
              size="small"
              extra={
                <Tooltip title="Delete question">
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteQuestion(qIndex)}
                    shape="circle"
                  />
                </Tooltip>
              }
              title={
                <Space>
                  <Text strong>Question {qIndex + 1}</Text>
                </Space>
              }
            >
              <Form.Item
                label="Question Text"
                required
                validateStatus={qIndex === 0 && !question.question.trim() ? "error" : ""}
                help={qIndex === 0 && !question.question.trim() ? "Question cannot be empty!" : ""}
              >
                <Input
                  placeholder="Enter your question here"
                  name="question"
                  value={question.question}
                  onChange={(e) => handleChange(e, qIndex)}
                />
              </Form.Item>

              <Form.Item
                label="Question Marks"
                required
                validateStatus={question.question.trim() && !question.marks ? "error" : ""}
                help={question.question.trim() && !question.marks ? "Marks cannot be empty!" : ""}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  name="marks"
                  value={question.marks}
                  onChange={(value) => {
                    const event = { target: { name: "marks", value } };
                    handleChange(event, qIndex);
                  }}
                />
              </Form.Item>

              <Divider orientation="left">Answers</Divider>
              
              {question.answers.length === 0 ? (
                <Alert
                  type="warning"
                  message="No answers added yet. Please add at least one answer."
                  className="mb-4"
                />
              ) : (
                <div className="space-y-2">
                  {question.answers.map((answer, aIndex) => (
                    <div key={answer._id || aIndex} className="flex items-center space-x-2">
                      <Form.Item
                        className="mb-2 flex-grow"
                        validateStatus={question.question.trim() && !answer.answer.trim() ? "error" : ""}
                        help={question.question.trim() && !answer.answer.trim() ? "Answer cannot be empty!" : ""}
                      >
                        <Input
                          placeholder="Enter answer option"
                          name="answer"
                          value={answer.answer}
                          onChange={(e) => handleChange(e, qIndex, aIndex)}
                        />
                      </Form.Item>
                      
                      <Checkbox
                        checked={answer.isCorrect}
                        onChange={(e) => {
                          const event = {
                            target: {
                              name: "isCorrect",
                              checked: e.target.checked,
                            },
                          };
                          handleChange(event, qIndex, aIndex);
                        }}
                      >
                        Correct
                      </Checkbox>
                      
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteAnswer(qIndex, aIndex)}
                        disabled={question.answers.length <= 1}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {question.question.trim() && !question.answers.some(a => a.isCorrect) && (
                <Alert
                  type="error"
                  message="Each question must have at least one correct answer"
                  className="mt-2 mb-4"
                />
              )}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleAddAnswer(qIndex)}
                className="w-full mt-4"
              >
                Add Answer Option
              </Button>
            </Card>
          ))}

          <div className="flex flex-col gap-4 mt-6">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddQuestion}
              block
              size="large"
            >
              Add New Question
            </Button>
            
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              block
              size="large"
            >
              Update Exam
            </Button>
          </div>
        </Form>
      </Card>

      <ToastContainer />
    </div>
  );
};

export default UpdateExam;