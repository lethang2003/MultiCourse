const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Enrollments", EnrollmentSchema);
