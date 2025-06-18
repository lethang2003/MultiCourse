const express = require("express");
const cartController = require("../Controllers/CartController");
const auth = require("../Loaders/Authenticate");
const cors = require("../Loaders/Cors");
const router = express.Router();

router.post(
  "/add-to-cart/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  cartController.addToCart
);

router.get("/", cors.corsWithOptions, auth.verifyUser, cartController.getCart);

router.delete(
  "/:course_id",
  cors.corsWithOptions,
  auth.verifyUser,
  cartController.removeFromCart
);

module.exports = router;
