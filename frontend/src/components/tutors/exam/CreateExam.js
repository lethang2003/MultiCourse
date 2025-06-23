import React, { useState, useEffect } from "react";
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
  WarningOutlined
} from "@ant-design/icons";
import { ToastContainer } from "react-toastify";

const { Title, Text } = Typography;

const CreateExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [totalMark, setTotalMark] = useState(0);
  const [exam, setExam] = useState({
    title: "",
    duration: "",
    totalMark: 0,
    questions: [{
      question: "",
      marks: "",
      questionType: "",
      answers: [{ answer: "", isCorrect: false },{ answer: "", isCorrect: false }]
    }]
  });

  const token = localStorage.getItem("authToken");

  // Calculate total marks whenever questions change
  useEffect(() => {
    const calculatedTotalMark = exam.questions.reduce(
      (acc, question) => acc + Number(question.marks || 0),
      0
    );
    
    // Only update when totalMark actually changes to avoid infinite loops
    if (calculatedTotalMark !== totalMark) {
      setTotalMark(calculatedTotalMark);
      
      // Update form field
      form.setFieldValue('totalMark', calculatedTotalMark);
      
      // Update exam object
      setExam((prevExam) => {
        if (prevExam.totalMark === calculatedTotalMark) {
          return prevExam;
        }
        return { ...prevExam, totalMark: calculatedTotalMark };
      });
    }
  }, [exam.questions, totalMark, form]);

  const handleChange = (e, questionIndex, answerIndex) => {
    const { name, value, checked, type } = e.target;
    
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      
      if (answerIndex !== undefined) {
        if (name === "isCorrect") {
          // Always allow multiple correct answers (Multiple Choice)
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
      if (prevExam.questions.length <= 1) {
        api.warning({
          message: 'Cannot Remove',
          description: 'Exam must have at least one question',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return prevExam;
      }
      const updatedQuestions = prevExam.questions.filter((_, i) => i !== index);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleDeleteAnswer = (qIndex, aIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      
      // Check if this is the last answer
      if (updatedQuestions[qIndex].answers.length <= 2) {
        api.warning({
          message: 'Cannot Remove',
          description: 'Question must have at least two answers',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return prevExam;
      }
      
      updatedQuestions[qIndex].answers.splice(aIndex, 1);
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const handleAddQuestion = () => {
    setExam((prevExam) => {
      const newQuestion = {
        question: "",
        marks: "",
        questionType: "",
        answers: [{ answer: "", isCorrect: false }],
      };
      return { ...prevExam, questions: [...prevExam.questions, newQuestion] };
    });
  };

  const handleAddAnswer = (qIndex) => {
    setExam((prevExam) => {
      const updatedQuestions = [...prevExam.questions];
      updatedQuestions[qIndex].answers.push({ answer: "", isCorrect: false });
      return { ...prevExam, questions: updatedQuestions };
    });
  };

  const validateExam = () => {
    // Check if title is empty
    if (!exam.title.trim()) {
      api.warning({
        message: 'Validation Error',
        description: 'Exam title cannot be empty',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
      return false;
    }
    
    // Check if duration is valid
    if (!exam.duration || exam.duration < 1) {
      api.warning({
        message: 'Validation Error',
        description: 'Duration must be at least 1 minute',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
      return false;
    }
    
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
    
    // Only process questions that have content
    const filledQuestions = exam.questions.filter(q => q.question.trim());
    
    // Check if any questions are filled in
    if (filledQuestions.length === 0) {
      api.warning({
        message: 'Validation Error',
        description: 'Please complete at least one question',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        placement: 'topRight',
      });
      return false;
    }
    
    // Validate each filled question
    for (const question of filledQuestions) {
      // Check if marks are assigned
      if (!question.marks) {
        api.warning({
          message: 'Validation Error',
          description: 'All questions must have marks assigned',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Check for answers
      if (!question.answers || question.answers.length === 0) {
        api.warning({
          message: 'Validation Error',
          description: 'All questions must have at least one answer',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Check for filled in answers
      const filledAnswers = question.answers.filter(a => a.answer.trim());
      if (filledAnswers.length === 0) {
        api.warning({
          message: 'Validation Error',
          description: 'Each question must have at least one completed answer',
          icon: <WarningOutlined style={{ color: '#faad14' }} />,
          placement: 'topRight',
        });
        return false;
      }
      
      // Check for correct answers
      if (!question.answers.some(a => a.isCorrect)) {
        api.warning({
          message: 'Validation Error',
          description: 'Each question must have at least one correct answer',
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
      // Only validate on submission
      if (!validateExam()) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Prepare data for submission
      const examData = {
        course_id: courseId,
        title: exam.title,
        duration: Number(exam.duration),
        totalMark: Number(totalMark),
        questions: exam.questions.map((q) => ({
          question: q.question,
          marks: Number(q.marks),
          questionType: q.questionType,
          answers: q.answers
        })),
      };

      await axios.post(
        "https://multicourse-q1mn.onrender.com/api/exams/create-exam",
        examData,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      message.success("Exam created successfully!");
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError("Failed to create exam. Please check your input and try again.");
      message.error("Exam creation failed!");
      console.error("Create error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {contextHolder}
      <Card className="shadow-lg rounded-lg">
        <Title level={2} className="mb-6 text-center">
          Create Exam
        </Title>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: "",
            duration: "",
            totalMark: 0
          }}
        >
          <Form.Item
            label="Exam Title"
            name="title"

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
              key={qIndex} 
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
                    <div key={aIndex} className="flex items-center space-x-2">
                      <Form.Item
                        className="mb-2 flex-grow"
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
              loading={loading}
            >
              Create Exam
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              block
              size="large"
            >
              Back
            </Button>
          </div>
        </Form>
      </Card>

      <ToastContainer />
    </div>
  );
};

export default CreateExam;