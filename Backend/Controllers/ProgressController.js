const Progress = require("../Models/Progress");
const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");
const User = require("../Models/Users");
const Order = require("../Models/Orders");

// Create a new progress
exports.createProgress = async (req, res) => {
  try {
    const user_id = req.user._id;
    const course_id = req.params.course_id;
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const progress = await Progress.findOne({
      student_id: user_id,
      course_id: course_id,
    });
    if (progress) {
      return res.status(400).json({ message: "Progress already exists" });
    }
    const lessons = await Lesson.find({ course_id: course_id });
    const newProgress = new Progress({
      student_id: user_id,
      course_id: course_id,
      lesson: lessons.map((lesson) => {
        return { lesson_id: lesson._id };
      }),
    });
    await newProgress.save();
    res.status(201).json(newProgress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Update progress of a lesson
exports.updateLessonProgress = async (req, res) => {
  try {
    const user_id = req.user._id;
    const lesson_id = req.params.lesson_id;

    const progress = await Progress.findOne({
      student_id: user_id,
      "lesson.lesson_id": lesson_id,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    const lesson = progress.lesson.find(
      (lesson) => lesson.lesson_id.toString() === lesson_id
    );

    if (lesson.status === "Completed") {
      lesson.note = req.body.note;
    } else {
      lesson.status =
        req.body.status === "Completed" ? "Completed" : req.body.status;
      lesson.note = req.body.note;
      lesson.progress_time = req.body.progress_time;
    }

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all progress
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ student_id: req.user._id });
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    progress.lesson = req.body.lesson;
    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProgressByCourse = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    //Nếu trong đã mua khóa học nhưng chưa có progress thì in ra chưa enroll
    //Nếu đã có progress thì in ra progress theo phần trăm dựa theo số khóa học đã hoàn thành
    const order_items = await Order.find({
      "order_items.course": course_id,
    });
    if (!order_items) {
      return res.status(404).json({ message: "No student enrolled" });
    }

    const progresses = await Progress.find({ course_id: course_id });
    if (!progresses) {
      return res.status(404).json({ message: "No progress found" });
    }

    const students = [];

    //Nếu trong order_items có course_id thì kiểm tra xem đã có progress chưa
    //Nếu chưa có thì in ra chưa enroll
    //Nếu có thì in ra progress theo phần trăm dựa theo số khóa học đã hoàn thành

    for (let i = 0; i < order_items.length; i++) {
      let student = await User.findById(order_items[i].user).select(
        "_id fullname avatar email role address birthday gender phone"
      );

      if (!student) {
        console.log(`User with ID ${order_items[i].user} not found`);
        continue; // Skip this iteration if the user is not found
      }

      let progress = progresses.find(
        (progress) => progress.student_id.toString() === student._id.toString()
      );

      if (!progress) {
        students.push({
          student: student,
          status: progress ? progress.status : "Not Enrolled",
          percent: 0,
        });
      } else {
        let lesson = progress.lesson;
        let totalLesson = lesson.length + 1; // +1 for final exam
        let completedLesson = 0;
        for (let j = 0; j < lesson.length; j++) {
          if (lesson[j].status === "Completed") {
            completedLesson++;
          }
        }

        let final_exam = progress.final_exam;
        if (final_exam.status === "Completed") {
          completedLesson++;
        }
        let percent = (completedLesson / totalLesson) * 100;
        students.push({
          student: student,
          status: "Enrolled",
          percent: percent,
        });
      }
    }
    res.status(200).json(students);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};