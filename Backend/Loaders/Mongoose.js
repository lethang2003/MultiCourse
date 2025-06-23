require("dotenv").config();
var config = require("../Configurations/Config");
const mongoose = require("mongoose");
const WalletAdmin = require("../Models/WalletAdmin");
const User = require("../Models/Users");
const bcrypt = require("bcryptjs");

const url = config.databaseUrl;

const connect = mongoose.connect(url);
connect.then(
  async (db) => {
    console.log("✅ Connected correctly to server");

    // Khởi tạo ví admin nếu chưa có
    const wallet = await WalletAdmin.findOne({});
    if (!wallet) {
      await WalletAdmin.create({});
      console.log("🚀 WalletAdmin created");
    }

    // Khởi tạo tài khoản admin nếu chưa có
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ role: "Admin" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.register(
        new User({
        fullname: "Admin",
        username: "admin",
        email: adminEmail,
        // password: hashedPassword,
        role: "Admin",
        phone: "0123456789", // thêm nếu schema yêu cầu
      }),
      adminPassword);
      console.log("🛠️ Admin account created");
    } else {
      console.log("✅ Admin account already exists");
    }

      // Khởi tạo tài khoản admin nếu chưa có
    const studentEmail = "student@gmail.com";
    const studentPassword = "student123";

    const existingStudent = await User.findOne({ role: "Student" });

    if (!existingStudent) {
      const hashedPassword = await bcrypt.hash(studentPassword, 10);
   await User.register(
  new User({
    username: "student",
    fullname: "Student",
    email: studentEmail,
    role: "Student",
    phone: "0123456789",
  }),
  studentPassword
);

      console.log("🛠️ Student account created");
    } else {
      console.log("✅ Student account already exists");
    }

      // Khởi tạo tài khoản admin nếu chưa có
    const tutorEmail = "tutor@gmail.com";
    const tutorPassword = "tutor123";

    const existingTutor = await User.findOne({ role: "Tutor" });

    if (!existingTutor) {
      const hashedPassword = await bcrypt.hash(tutorPassword, 10);
      await User.register(
        new User({
        fullname: "Tutor",
        username: "tutor",
        email: tutorEmail,
        // password: hashedPassword,
        role: "Tutor",
        phone: "0123456789", // thêm nếu schema yêu cầu
      }),
      tutorPassword);
      console.log("🛠️ Tutor account created");
    } else {
      console.log("✅ Tutor account already exists");
    }
  },
  
  (err) => {
    console.log("❌ Connection error:", err);
  }

  
);
