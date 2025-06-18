const express = require("express");
const userController = require("../Controllers/UserController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post("/signup", cors.corsWithOptions, userController.signUp);

router.post("/login", cors.corsWithOptions, userController.login);

router.post(
  "/change-password",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.changePassword
);

router.post(
  "/forgot-password",
  cors.corsWithOptions,
  userController.forgotPassword
);

router.post("/reset-password", cors.corsWithOptions, userController.confirmOTP);

router.post(
  "/update-profile",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.updateUser
);

router.post(
  "/upload-avatar",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.uploadAvatar
);

router.get(
  "/profile",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.getUserById
);

router.get(
  "/all-users",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  userController.getAllUsers
);

router.get(
  "/all-users-except-admin",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  userController.getAllUsersExceptAdmin
);

router.post(
  "/upload-certificate/:id",
  cors.corsWithOptions,
  userController.uploadCertificate
);

router.put(
  "/set-status-user/:id",
  auth.verifyUser,
  auth.verifyAdmin,
  cors.corsWithOptions,
  userController.banAndUnbanUser
);
router.put(
  "/update-bank-account",
  auth.verifyUser,
  userController.updateBankAccount
);

// Get user profile by id
router.get("/profile/:id", cors.corsWithOptions, userController.getUserById);

//log out
router.post(
  "/logout",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.logout
);

//google auth
router.get("/google/login", cors.corsWithOptions, userController.googleLogin);
router.get("/auth/callback", cors.cors, userController.googleLoginCallback);

//get user by token
router.get(
  "/get-user-by-token",
  cors.corsWithOptions,
  auth.verifyUser,
  userController.getUserByToken
);

router.get(
  "/tutor-activities",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  userController.getTutorActivities
);

module.exports = router;
