const express = require("express");
const paymentController = require("../Controllers/PaymentController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

//Nạp tiền vào ví
router.post(
  "/create-payment",
  cors.corsWithOptions,
  auth.verifyUser,
  paymentController.createPayment
);

//Check thông tin nạp tiền
router.get(
  "/check-payment/:orderCode",
  cors.corsWithOptions,
  paymentController.checkPayment
);

module.exports = router;
