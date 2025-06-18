const Exam = require("../Models/Exams");
const StudentExamRS = require("../Models/StudentExamResults");
const Progress = require("../Models/Progress");
const Course = require("../Models/Courses");

exports.createExam = async (req, res) => {
  try {
    const course_id = req.body.course_id;
    const duration = req.body.duration;
    const questions = req.body.questions;
    const totalMark = req.body.totalMark;

    // Kiểm tra xem course_id có tồn tại không
    const course = await Course.findOne({
      _id: course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({
      course: course_id,
    });

    if (exam) {
      return res.status(400).json({ error: "Exam already exists" });
    }

    // Tính tổng điểm của tất cả các câu hỏi
    const calculatedTotalMark = questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );

    // Kiểm tra nếu tổng điểm không khớp với totalMark
    if (calculatedTotalMark !== totalMark) {
      return res.status(400).json({
        error: "Total marks of questions must equal the totalMark field.",
      });
    }

    // Kiểm tra và cập nhật questionType cho từng câu hỏi
    questions.forEach((question) => {
      const correctAnswers = question.answers.filter(
        (answer) => answer.isCorrect
      );

      if (correctAnswers.length > 1) {
        question.questionType = "Multiple Choice";
      } else {
        question.questionType = "One Choice";
      }
    });

    // Tạo bài thi mới
    const newExam = new Exam({ ...req.body, questions });
    await newExam.save();

    res.status(201).json("Created exam successfully");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//shuffle array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//Randomize questions and answers in an array
exports.createStudentExam = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const student_id = req.user._id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({ course_id: course_id });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const randomQuestions = shuffleArray(
      exam.questions.map((question) => ({
        question_id: question._id,
        question: question.question,
        questionType: question.questionType,
        marks: question.marks,
        answers: shuffleArray(question.answers),
      }))
    );

    return res.status(200).json({
      exam: {
        course_id: exam.course_id,
        exam_id: exam._id,
        title: exam.title,
        duration: exam.duration,
        questions: randomQuestions,
        totalMark: exam.totalMark,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Submit exam
exports.submitExam = async (req, res) => {
  try {
    const student_id = req.user._id;
    const course_id = req.body.course_id;
    const exam_id = req.params.exam_id;
    const questions = req.body.questions;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const progress = await Progress.findOne({
      student_id,
      course_id,
    });

    if (!progress) {
      return res.status(404).json({ error: "Progress not found" });
    }

    //Calculate total marks
    let totalScore = 0;
    let questionRS = [];

    for (let submittedQuestion of questions) {
      const examQuestion = exam.questions.find(
        (question) =>
          question._id.toString() === submittedQuestion.question_id.toString()
      );

      if (!examQuestion) {
        return res.status(400).json({ error: "Invalid question" });
      }

      // Lấy danh sách id của đáp án đúng trong đề
      const examCorrectIds = examQuestion.answers
        .filter((ans) => ans.isCorrect)
        .map((ans) => ans._id.toString());

      // Lấy danh sách id của đáp án mà học sinh chọn
      const studentSelectedIds = submittedQuestion.answers.map((answer) =>
        answer.answer_id.toString()
      );

      // Điều kiện 1: Học sinh phải chọn đủ tất cả các đáp án đúng
      const allCorrectSelected = examCorrectIds.every((id) =>
        studentSelectedIds.includes(id)
      );
      // Điều kiện 2: Học sinh không chọn đáp án nào sai
      const noIncorrectSelected = studentSelectedIds.every((id) =>
        examCorrectIds.includes(id)
      );

      const allCorrect = allCorrectSelected && noIncorrectSelected;

      // const allCorrect = submittedQuestion.answers.every((answer) =>
      //   examQuestion.answers.some(
      //     (examAnswer) =>
      //       examAnswer._id.toString() === answer.answer_id.toString() &&
      //       examAnswer.isCorrect === answer.isCorrect
      //   )
      // );

      if (allCorrect) {
        totalScore += examQuestion.marks;
      }

      questionRS.push({
        question_id: examQuestion._id,
        question: examQuestion.question,
        answers: submittedQuestion.answers.map((answer) => {
          const matchingExamAnswer = examQuestion.answers.find(
            (examAnswer) =>
              examAnswer._id.toString() === answer.answer_id.toString()
          );
          return {
            answer_id: answer.answer_id,
            answer: matchingExamAnswer.answer,
            isCorrect: matchingExamAnswer
              ? matchingExamAnswer.isCorrect
              : false,
          };
        }),
        allCorrect,
      });
    }

    const existsStudentExamRS = await StudentExamRS.findOne({
      student: student_id,
      course: course_id,
      exam: exam_id,
    });

    if (existsStudentExamRS) {
      existsStudentExamRS.score = totalScore;
      existsStudentExamRS.questions = questionRS;

      if (totalScore >= exam.totalMark * 0.8) {
        progress.final_exam.status = "Completed";
        progress.final_exam.score = totalScore;
      } else {
        progress.final_exam.status = "In Progress";
        progress.final_exam.score = totalScore;
      }

      await progress.save();
      await existsStudentExamRS.save();
      return res.status(200).json({
        message: "Exam updated successfully",
        studentExamRS: existsStudentExamRS,
      });
    } else {
      const newStudentExamRS = new StudentExamRS({
        student: student_id,
        course: course_id,
        exam: exam_id,
        score: totalScore,
        totalMark: exam.totalMark,
        questions: questionRS,
      });

      if (totalScore >= exam.totalMark * 0.8) {
        progress.final_exam.status = "Completed";
        progress.final_exam.score = totalScore;
      } else {
        progress.final_exam.status = "In Progress";
        progress.final_exam.score = totalScore;
      }

      await progress.save();
      await newStudentExamRS.save();
      return res.status(201).json({
        message: "Exam submitted successfully",
        studentExamRS: newStudentExamRS,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Get exam for tutor
exports.getExam = async (req, res) => {
  try {
    const course_id = req.params.course_id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({ course_id: course_id });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Update exam
exports.updateExam = async (req, res) => {
  try {
    const exam_id = req.params.exam_id;
    const title = req.body.title;
    const questions = req.body.questions;
    const totalMark = req.body.totalMark;
    const duration = req.body.duration;

    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    if (title) exam.title = title;
    if (questions) exam.questions = questions;
    if (totalMark) exam.totalMark = totalMark;
    let totalMarks = 0;
    exam.questions.forEach((question) => {
      totalMarks += question.marks;
    });

    if (totalMarks !== totalMark) {
      return res.status(400).json({
        error: "Total marks of questions must equal the totalMark field.",
      });
    }

    if (duration) exam.duration = duration;

    await exam.save();
    res.status(200).json(exam);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam_id = req.params.exam_id;

    const exam = await Exam.findById(exam_id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const examDeleted = await Exam.findByIdAndDelete(exam_id);
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Get exam for student
exports.getExamScoreForStudent = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const student_id = req.user._id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await Exam.findOne({ course_id: course_id });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const studentExamRS = await StudentExamRS.findOne({
      student: student_id,
      course: course_id,
      exam: exam._id,
    });

    if (studentExamRS) {
      return res.status(200).json({ Score: studentExamRS.score });
    } else {
      return res.status(404).json({ message: "Student exam result not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
