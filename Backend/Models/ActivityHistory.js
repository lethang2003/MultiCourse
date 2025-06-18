const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivityHistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "Tutor", "Student"],
    required: true,
  },
  entry_date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ActivityHistory", ActivityHistorySchema);
