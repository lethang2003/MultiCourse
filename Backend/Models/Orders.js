const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  total_price: {
    type: Number,
    required: true,
  },
  order_items: [
    {
      course: {
        type: Schema.Types.ObjectId,
        ref: "Courses",
      },
    },
  ],
});

module.exports = mongoose.model("Orders", OrderSchema);
