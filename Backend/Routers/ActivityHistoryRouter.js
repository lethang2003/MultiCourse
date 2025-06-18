const express = require("express");
const ActivityHistoryController = require("../Controllers/ActivityHistoryController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.get(
  "/admin",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyAdmin,
  ActivityHistoryController.getAllActivityOfAdmin
);

router.get(
  "/tutor",
  cors.corsWithOptions,
  auth.verifyUser,
  auth.verifyTutor,
  ActivityHistoryController.getAllActivityOfTutor
);

module.exports = router;
