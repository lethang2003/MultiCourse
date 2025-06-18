const Cart = require("../Models/Cart");
const Course = require("../Models/Courses");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const course_id = req.params.course_id;
    const cart = await Cart.findOne({ user: userId });
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!cart) {
      const newCart = new Cart({
        user: userId,
        cart_items: [{ course: course_id }],
        total_price: course.price,
      });
      await newCart.save();
      return res.status(201).json(newCart);
    }

    if (cart.cart_items.some((item) => item.course.toString() === course_id)) {
      return res.status(400).json({ message: "Course already in cart" });
    }

    cart.total_price += course.price;
    cart.cart_items.push({ course: course_id });
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "cart_items.course",
      select: "title image category price", // Chỉ lấy các trường cần thiết
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const course_id = req.params.course_id;
    const cart = await Cart.findOne({ user: userId });
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.cart_items.some((item) => item.course.toString() === course_id)) {
      return res.status(400).json({ message: "Course not in cart" });
    }

    cart.total_price -= course.price;
    cart.cart_items = cart.cart_items.filter(
      (item) => item.course.toString() !== course_id
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
