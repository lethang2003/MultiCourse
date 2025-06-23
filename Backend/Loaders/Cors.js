const express = require("express");
const cors = require("cors");

const whitelist = [
  
  "https://multi-course.onrender.com",
  "https://multicourse-q1mn.onrender.com",
  "https://localhost:3443",
  "https://multi-course.onrender.com",
  "https://multi-course-rfc1.vercel.app",
  "https://accounts.google.com/",
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
