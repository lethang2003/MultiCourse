const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentExamResultsSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: "Exams",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalMark: {
    type: Number,
    required: true,
  },
  questions: [
    {
      question_id: {
        type: String,
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      answers: [
        {
          answer_id: {
            type: String,
            required: true,
          },
          answer: {
            type: String,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      ],
      allCorrect: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("StudentExamResults", StudentExamResultsSchema);