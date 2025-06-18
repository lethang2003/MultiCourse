const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  cart_items: [
    {
      course: {
        type: Schema.Types.ObjectId,
        ref: "Courses",
      },
    },
  ],
  total_price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
