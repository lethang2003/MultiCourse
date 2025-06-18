const express = require("express");
const lessonController = require("../Controllers/LessonController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-lesson/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  lessonController.createLesson
);

router.get(
  "/all-lessons/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  lessonController.getAllLessons
);

router.get(
  "/:lesson_id",
  cors.corsWithOptions,
  auth.verifyUser,
  lessonController.getLessonById
);

router.put(
  "/:lesson_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  lessonController.updateLesson
);
router.delete(
  "/:lesson_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  lessonController.deleteLesson
);

module.exports = router;
