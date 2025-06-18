const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentCertificateSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  totalMark: {
    type: Number,
    required: true,
  },
  isPassed: {
    type: Boolean,
    required: true,
  },
  issue_date: {
    type: Date,
    required: true,
  },
  certificate_url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "StudentCertificates",
  StudentCertificateSchema
);
