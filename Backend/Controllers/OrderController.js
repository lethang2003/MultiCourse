const Order = require("../Models/Orders");
const Course = require("../Models/Courses");
const User = require("../Models/Users");
const Wallet = require("../Models/Wallet");
const Cart = require("../Models/Cart");
const WalletAdmin = require("../Models/WalletAdmin");
const mongoose = require("mongoose");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const cart_id = req.params.cart_id;
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const studentWallet = await Wallet.findOne({ user: student._id });
    if (!studentWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (studentWallet.current_balance < cart.total_price) {
      return res.status(400).json({ message: "Not enough balance" });
    }

    const adminWallet = await WalletAdmin.findOne();

    const order_items = cart.cart_items;
    const total_price = cart.total_price;

    for (let order_item of order_items) {
      const course = await Course.findById(order_item.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const tutorWallet = await Wallet.findOne({ user: course.tutor });
      if (!tutorWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      //10% of the course will add to total earning of admin
      adminWallet.total_earning += course.price * 0.1;
      await adminWallet.save();
      tutorWallet.total_earning += course.price * 0.9;
      tutorWallet.current_balance += course.price * 0.9;
      await tutorWallet.save();
    }

    studentWallet.current_balance -= total_price;
    studentWallet.total_spend += total_price;

    const newOrder = new Order({
      user: student._id,
      order_items,
      total_price,
    });

    await cart.deleteOne();
    await newOrder.save();
    await studentWallet.save();
    res.status(201).json("Order created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("order_items.course")
      .populate("user", "fullname email");
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Admin
exports.getRevenueForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by Month
exports.getRevenueEachMonthForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const revenue = monthNames.map((monthName, i) => {
      const month = i + 1;
      const monthlyRevenue = orders.reduce((sum, order) => {
        const orderMonth = order.order_date.getMonth() + 1;
        return orderMonth === month ? sum + order.total_price : sum;
      }, 0);
      return { month: monthName, revenue: monthlyRevenue };
    });

    res.status(200).json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Today
exports.getRevenueForToday = async (req, res) => {
  try {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const orders = await Order.find({ order_date: { $gte: startOfToday } });
    const totalRevenueToday = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for This Year
exports.getRevenueForThisYear = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const orders = await Order.find({ order_date: { $gte: startOfYear } });
    const totalRevenueThisYear = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueThisYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get My Orders (User)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "order_items.course"
    );
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Sold Count for a Specific Course
exports.getCourseSalesCountById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);

    // Kiểm tra nếu không tìm thấy khóa học
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Tìm tất cả đơn hàng có chứa khóa học này
    const orders = await Order.find({ "order_items.course": course._id });

    // Đếm số lần khóa học này xuất hiện trong tất cả các đơn hàng
    const soldCount = orders.reduce((count, order) => {
      return (
        count +
        order.order_items.filter(
          (item) => item.course.toString() === course._id.toString()
        ).length
      );
    }, 0);

    res.status(200).json({ course_id: course._id, soldCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Statistics for Tutor

// Get Total Earning for Tutor by ID
exports.getTotalEarningForTutorById = async (req, res) => {
  try {
    const tutor = await User.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Tìm ví của user
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    res.status(200).json({ totalEarning: wallet.total_earning });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get total income from each course
exports.getTotalIncomeFromEachCourse = async (req, res) => {
  try {
    const tutorId = req.user._id; // Lấy ID từ token

    // Lấy tất cả khóa học của giảng viên
    const courses = await Course.find({ tutor: tutorId }).lean();
    if (!courses.length) {
      return res
        .status(404)
        .json({ message: "No courses found for this tutor" });
    }

    // Lấy danh sách course_id của giảng viên
    const courseIds = courses.map((course) => course._id.toString());

    // Tìm tất cả đơn hàng có chứa các khóa học của giảng viên
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
    })
      .populate("order_items.course") // Populate để đảm bảo dữ liệu chính xác
      .lean();

    // Kiểm tra nếu không cóa đơn hàng nào
    if (!orders.length) {
      return res
        .status(200)
        .json({ message: "No orders found for this tutor's courses" });
    }

    // Tạo một map để đếm số lượt bán của từng khóa học
    const courseSalesMap = {};

    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        const courseId = item.course?._id?.toString(); // Chuyển thành string để tránh lỗi so sánh ObjectId
        if (courseId && courseIds.includes(courseId)) {
          courseSalesMap[courseId] = (courseSalesMap[courseId] || 0) + 1;
        }
      });
    });

    // Tạo danh sách kết quả
    const income = courses.map((course) => ({
      course_id: course._id,
      totalIncome: course.price * (courseSalesMap[course._id.toString()] || 0),
      totalSales: courseSalesMap[course._id.toString()] || 0, // Số lượt bán
    }));

    res.status(200).json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// API show tất cả các course mà tất cả user đã mua cho admin

exports.getAllPurchasedCoursesWithUsers = async (req, res) => {
  try {
    // Lấy tất cả đơn hàng và populate thông tin user + course
    const orders = await Order.find()
      .populate("order_items.course")
      .populate("user", "name email") // Chỉ lấy name và email của user
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: "No purchased courses found." });
    }

    // Dùng Map để lưu danh sách khóa học và những user đã mua
    const purchasedCoursesMap = new Map();

    orders.forEach((order) => {
      if (Array.isArray(order.order_items)) {
        order.order_items.forEach((item) => {
          if (item.course) {
            const courseId = item.course._id.toString();

            if (!purchasedCoursesMap.has(courseId)) {
              purchasedCoursesMap.set(courseId, {
                course: item.course,
                buyers: [],
              });
            }

            // Thêm user vào danh sách buyers nếu chưa có
            const courseData = purchasedCoursesMap.get(courseId);
            if (
              !courseData.buyers.some(
                (buyer) => buyer._id.toString() === order.user._id.toString()
              )
            ) {
              courseData.buyers.push(order.user);
            }
          }
        });
      }
    });

    // Chuyển Map thành array và trả về JSON
    const purchasedCourses = Array.from(purchasedCoursesMap.values());

    res.status(200).json(purchasedCourses);
  } catch (err) {
    console.error("Error fetching purchased courses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//API show người mua và khóa học của tutor cho tutor

exports.getPurchasedCoursesForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id; // Lấy ID tutor từ token

    // Tìm tất cả khóa học do tutor này tạo
    const courses = await Course.find({ tutor: tutorId });

    if (!courses.length) {
      return res
        .status(200)
        .json({ message: "No courses found for this tutor." });
    }

    // Lấy danh sách course ID
    const courseIds = courses.map((course) => course._id);

    // Tìm tất cả đơn hàng có chứa các khóa học của tutor
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
    })
      .populate("order_items.course", "title") // Lấy tên khóa học
      .populate("user", "fullname email") // Lấy thông tin user (tên + email)
      .lean();

    // Dùng Map để lưu danh sách khóa học và những user đã mua
    const purchasedCoursesMap = new Map();

    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        if (item.course) {
          const courseId = item.course._id.toString();

          if (!purchasedCoursesMap.has(courseId)) {
            purchasedCoursesMap.set(courseId, {
              course: item.course,
              buyers: [],
            });
          }

          // Thêm user vào danh sách buyers nếu chưa có
          const courseData = purchasedCoursesMap.get(courseId);
          if (
            !courseData.buyers.some(
              (buyer) => buyer._id.toString() === order.user._id.toString()
            )
          ) {
            courseData.buyers.push({
              ...order.user,
              order_date: order.order_date, // Thêm ngày đặt hàng
            });
          }
        }
      });
    });

    // Chuyển Map thành array và trả về JSON
    const purchasedCourses = Array.from(purchasedCoursesMap.values());

    res.status(200).json(purchasedCourses);
  } catch (err) {
    console.error("Error fetching purchased courses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//API Show thành viên trong khóa học đó cho tutor

exports.getCourseMembersForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id; // Lấy ID tutor từ token

    // Tìm tất cả khóa học do tutor này tạo
    const courses = await Course.find({ tutor: tutorId });

    if (!courses.length) {
      return res
        .status(200)
        .json({ message: "No courses found for this tutor." });
    }

    // Lấy danh sách course ID
    const courseIds = courses.map((course) => course._id);

    // Tìm tất cả đơn hàng có chứa các khóa học của tutor
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
    })
      .populate("order_items.course", "title") // Lấy tên khóa học
      .populate("user", "fullname email") // Lấy thông tin user (tên + email)
      .lean();

    // Dùng Map để lưu danh sách học viên theo từng khóa học
    const courseMembersMap = new Map();

    courses.forEach((course) => {
      courseMembersMap.set(course._id.toString(), {
        course_id: course._id,
        course_title: course.title,
        members: [],
      });
    });

    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        if (item.course) {
          const courseId = item.course._id.toString();
          if (courseMembersMap.has(courseId)) {
            const courseData = courseMembersMap.get(courseId);

            // Thêm user vào danh sách members nếu chưa có
            if (
              !courseData.members.some(
                (member) => member._id.toString() === order.user._id.toString()
              )
            ) {
              courseData.members.push({
                _id: order.user._id,
                fullname: order.user.fullname, // Lấy tên member
                email: order.user.email, // Lấy email member
              });
            }
          }
        }
      });
    });

    // Chuyển Map thành array và trả về JSON
    const courseMembers = Array.from(courseMembersMap.values());

    res.status(200).json(courseMembers);
  } catch (err) {
    console.error("Error fetching course members:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by Month for a Specific Tutor
exports.getRevenueEachMonthForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const courses = await Course.find({ tutor: tutorId }).select("_id");
    const courseIds = courses.map((course) => course._id);

    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const revenue = monthNames.map((monthName, i) => {
      const month = i + 1;
      const monthlyRevenue = orders.reduce((sum, order) => {
        const orderMonth = order.order_date.getMonth() + 1;
        return orderMonth === month ? sum + order.total_price : sum;
      }, 0);
      return { month: monthName, revenue: monthlyRevenue };
    });

    res.status(200).json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Today for a Specific Tutor
exports.getRevenueForTodayForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const courses = await Course.find({ tutor: tutorId }).select("_id");
    const courseIds = courses.map((course) => course._id);

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
      order_date: { $gte: startOfToday },
    });

    const totalRevenueToday = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    res.status(200).json({ totalRevenueToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for This Year for a Specific Tutor
exports.getRevenueForThisYearForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const courses = await Course.find({ tutor: tutorId }).select("_id");
    const courseIds = courses.map((course) => course._id);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
      order_date: { $gte: startOfYear },
    });

    const totalRevenueThisYear = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    res.status(200).json({ totalRevenueThisYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//API show người mua và khóa học của tutor cho tutor

exports.getPurchasedCoursesForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id; // Lấy ID tutor từ token

    // Tìm tất cả khóa học do tutor này tạo
    const courses = await Course.find({ tutor: tutorId });

    if (!courses.length) {
      return res
        .status(200)
        .json({ message: "No courses found for this tutor." });
    }

    // Lấy danh sách course ID
    const courseIds = courses.map((course) => course._id);

    // Tìm tất cả đơn hàng có chứa các khóa học của tutor
    const orders = await Order.find({
      "order_items.course": { $in: courseIds },
    })
      .populate("order_items.course", "title") // Lấy tên khóa học
      .populate("user", "fullname email") // Lấy thông tin user (tên + email)
      .lean();

    // Dùng Map để lưu danh sách khóa học và những user đã mua
    const purchasedCoursesMap = new Map();

    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        if (item.course) {
          const courseId = item.course._id.toString();

          if (!purchasedCoursesMap.has(courseId)) {
            purchasedCoursesMap.set(courseId, {
              course: item.course,
              buyers: [],
            });
          }

          // Thêm user vào danh sách buyers nếu chưa có
          const courseData = purchasedCoursesMap.get(courseId);
          if (
            !courseData.buyers.some(
              (buyer) => buyer._id.toString() === order.user._id.toString()
            )
          ) {
            courseData.buyers.push({
              ...order.user,
              order_date: order.order_date, // Thêm ngày đặt hàng
            });
          }
        }
      });
    });

    // Chuyển Map thành array và trả về JSON
    const purchasedCourses = Array.from(purchasedCoursesMap.values());

    res.status(200).json(purchasedCourses);
  } catch (err) {
    console.error("Error fetching purchased courses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
