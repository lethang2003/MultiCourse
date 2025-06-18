const express = require("express");
const ExamController = require("../Controllers/ExamController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-exam",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  ExamController.createExam
);

router.get(
  "/take-exam/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  ExamController.createStudentExam
);

router.post(
  "/submit-exam/:exam_id",
  cors.corsWithOptions,
  auth.verifyUser,
  ExamController.submitExam
);
//Get exam for tutor
router.get(
  "/get-exam/:course_id",
  cors.cors,
  auth.verifyUser,
  auth.verifyAdminOrTutor,
  ExamController.getExam
);
//Get exam for student
router.put(
  "/update-exam/:exam_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  ExamController.updateExam
);
//Delete exam
router.delete(
  "/delete-exam/:exam_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  ExamController.deleteExam
);

//Get exam for student
router.get(
  "/get-exam-score/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  ExamController.getExamScoreForStudent
);

module.exports = router;
