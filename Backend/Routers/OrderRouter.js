const express = require("express");
const orderController = require("../Controllers/OrderController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/create-order/:cart_id",
  cors.corsWithOptions,
  auth.verifyUser,
  orderController.createOrder
);

router.get(
  "/all-orders",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getAllOrders
);

router.get(
  "/my-orders",
  cors.corsWithOptions,
  auth.verifyUser,
  orderController.getMyOrders
);

router.get(
  "/revenue",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForAdmin
);

router.get(
  "/revenue-each-month",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueEachMonthForAdmin
);

router.get(
  "/revenue-day",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForToday
);

router.get(
  "/revenue-year",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getRevenueForThisYear
);

router.get(
  "/total-course-sold/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getCourseSalesCountById
);

router.get(
  "/total-earning",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getTotalEarningForTutorById
);

router.get(
  "/total-earning-from-course",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getTotalIncomeFromEachCourse
);

router.get(
  "/all-purchase-course",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  orderController.getAllPurchasedCoursesWithUsers
);

router.get(
  "/course-member",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getCourseMembersForTutor
);

router.get(
  "/revenue-month-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getRevenueEachMonthForTutor
);

router.get(
  "/revenue-day-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getRevenueForTodayForTutor
);

router.get(
  "/revenue-year-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getRevenueForThisYearForTutor
);

router.get(
  "/buyers-history-tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  orderController.getPurchasedCoursesForTutor
);
module.exports = router;
