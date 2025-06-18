var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const mongoose = require("./Loaders/Mongoose");

const admin = require("firebase-admin");
const config = require("./Configurations/Config");

const serviceAccount =
  require("./Configurations/FirebaseConfig").serviceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: config.storage_bucket,
});

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
const ActivityHistory = require("./Routers/ActivityHistoryRouter");
const RequestRouter = require("./Routers/RequestRouter");
var app = express();
const cors = require("cors");
app.use(cors());

app.connect = mongoose;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: ["http://localhost:3001", "http://localhost:3002"], credentials: true }));
// app.use(cors({ origin: "https://multi-course-rfc1.vercel.app", credentials: true }));
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
app.use("/api/activities", ActivityHistory);
app.use("/api/requests", RequestRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
