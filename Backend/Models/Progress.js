const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProgressSchema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  lesson: [
    {
      lesson_id: {
        type: Schema.Types.ObjectId,
        ref: "Lessons",
        required: true,
      },
      // title: {
      //   type: String,
      //   required: true,
      // },
      status: {
        type: String,
        default: "Not Started",
        enum: ["In Progress", "Completed", "Not Started"],
      },
      note: {
        type: String,
        default: "",
      },
      progress_time: {
        type: Number,
        default: 0,
      },
    },
  ],
  final_exam: {
    status: {
      type: String,
      default: "Not Started",
      enum: ["In Progress", "Completed", "Not Started"],
    },
    score: {
      type: Number,
      default: 0,
    },
  },
});

module.exports = mongoose.model("Progress", ProgressSchema);
