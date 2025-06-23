// app.js
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const mongoose = require("./Loaders/Mongoose");
const admin = require("firebase-admin");
const config = require("./Configurations/Config");
const serviceAccount = require("./Configurations/FirebaseConfig").serviceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: config.storage_bucket,
});

// Routers
const UserRouter = require("./Routers/UsersRouter");
const CourseRouter = require("./Routers/CourseRouter");
const LessonRouter = require("./Routers/LessonRouter");
const ExamRouter = require("./Routers/ExamRouter");
const CartRouter = require("./Routers/CartRouter");
const PaymentRouter = require("./Routers/PaymentRouter");
const ProgressRouter = require("./Routers/ProgressRouter");
const OrderRouter = require("./Routers/OrderRouter");
const CommentRouter = require("./Routers/CommentRouter");
const WalletRouter = require("./Routers/WalletRouter");
const CertificateRouter = require("./Routers/CertificateRouter");
const ActivityHistoryRouter = require("./Routers/ActivityHistoryRouter");
const RequestRouter = require("./Routers/RequestRouter");

const app = express();

// Connect to database
app.connect = mongoose;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CORS Configuration
app.use(cors({
  origin: [
    "https://multi-course.onrender.com",
    "http://localhost:3000",
    "http://localhost:3002"
  ],
  credentials: true,
}));

// API Routes
app.use("/api/users", UserRouter);
app.use("/api/courses", CourseRouter);
app.use("/api/lessons", LessonRouter);
app.use("/api/exams", ExamRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/comments", CommentRouter);
app.use("/api/payment", PaymentRouter);
app.use("/api/progress", ProgressRouter);
app.use("/api/wallet", WalletRouter);
app.use("/api/certificates", CertificateRouter);
app.use("/api/activities", ActivityHistoryRouter);
app.use("/api/requests", RequestRouter);

// Static for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
