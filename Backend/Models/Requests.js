const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  course: {
    type: String,
    ref: "Courses",
  },
  request_type: {
    type: String,
    required: true,
  },
  content: [{}],
  request_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approved", "Rejected", "Canceled"],
  },
});

module.exports = mongoose.model("Requests", RequestSchema);
