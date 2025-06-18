const express = require("express");
const courseController = require("../Controllers/CourseController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get("/active-courses", cors.cors, courseController.getActiveCourses);
router.get(
  "/all-courses",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdminOrTutor,
  courseController.getAllCourses
);
router.get(
  "/course-of-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.getCourseOfTutor
);
router.get("/detail/:id", cors.corsWithOptions, courseController.getCourseById);
//Request to create course
router.post(
  "/create-course",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.requetsCreateCourse
);
//Process request to create course
router.post(
  "/process-create-course/:request_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.processCreateCourse
);
//Request to update course
router.put(
  "/update-course/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.requestUpdateCourse
);
//Process request to update course
router.put(
  "/process-update-course/:request_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.processUpdateCourse
);
//Request to delete course
router.delete(
  "/delete-course/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.requestDeleteCourse
);
//Process request to delete course
router.delete(
  "/process-delete-course/:request_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.processDeleteCourse
);

router.put(
  "/update-course-image/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  courseController.updateCourseImage
);
router.put(
  "/change-course-status/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.changeCourseStatus
);

//top 5 course được đánh giá cao nhất
router.get(
  "/top-courses",
  cors.corsWithOptions,
  courseController.getTop5Course
);

//5 tutor có sức ảnh hưởng nhất
router.get("/top-tutors", cors.corsWithOptions, courseController.getTop5Tutor);

//course bán chạy nhất
router.get(
  "/best-seller",
  cors.corsWithOptions,
  courseController.getTop1BestSeller
);

//Student of courses
router.get(
  "/student-of-course/:course_id",
  cors.corsWithOptions,
  courseController.getListStudentOfCourses
);

router.get(
  "/counting-courses",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  courseController.countActiveAndInactiveCourses
);

module.exports = router;
