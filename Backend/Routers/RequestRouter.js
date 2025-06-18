const express = require("express");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();
const requestController = require("../Controllers/RequestController");

router.get(
  "/all-requests",
  cors.cors,
  auth.verifyUser,
  auth.verifyAdmin,
  requestController.getAllRequests
);

router.get(
  "/requests-by-user",
  cors.cors,
  auth.verifyUser,
  auth.verifyTutor,
  requestController.getRequestsByUser
);

router.post(
  "/cancel-request/:request_id",
  cors.cors,
  auth.verifyUser,
  auth.verifyTutor,
  requestController.cancelRequest
);

router.get(
  "/request-detail/:request_id",
  cors.cors,
  auth.verifyUser,
  auth.verifyAdmin,
  requestController.getRequestById
);

module.exports = router;
