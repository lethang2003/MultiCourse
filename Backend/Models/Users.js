const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  googleId: {
    type: String,
    default: undefined,
  },
    username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "Other",
    enum: ["Male", "Female", "Other"],
  },
  birthday: {
    type: Date,
    default: undefined,
  },
  address: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: "Student",
    enum: ["Student", "Admin", "Tutor"],
  },
  tutor_certificates: [
    {
      title: { type: String, default: undefined },
      certificate_url: { type: String, default: undefined },
    },
  ],
  resetPasswordOTP: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
  bankAccount: [
    {
      bank_name: { type: String, default: undefined },
      account_number: { type: String, default: undefined },
      account_name: { type: String, default: undefined },
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Users", UserSchema);
