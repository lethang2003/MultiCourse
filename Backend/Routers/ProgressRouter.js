const express = require("express");
const progressController = require("../Controllers/ProgressController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.createProgress
);
router.get(
  "/",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.getAllProgress
);
router.get(
  "/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.getProgressById
);
router.put(
  "/:id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.updateProgress
);

router.put(
  "/lesson/:lesson_id",
  cors.corsWithOptions,
  auth.verifyUser,
  progressController.updateLessonProgress
);

//Get all progress of a course
router.get(
  "/students/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrTutor,
  progressController.getProgressByCourse
);
module.exports = router;
