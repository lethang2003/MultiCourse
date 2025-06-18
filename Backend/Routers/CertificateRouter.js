const express = require("express");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();
const certificateController = require("../Controllers/CertificateController");

router.post(
  "/create-certificate/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.generateCertificate
);

router.get(
  "/get-certificate/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.getCertificate
);

router.get(
  "/get-all-certificates",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.getAllStudentCertificates
);

router.get(
  "/get-tutor-certificate",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.getTutorCertificate
);

router.post(
  "/upload-tutor-certificate",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.uploadTutorCertificate
);

router.delete(
  "/delete-tutor-certificate/:certificate_id",
  cors.corsWithOptions,
  auth.verifyUser,
  certificateController.deleteTutorCertificate
);

module.exports = router;
