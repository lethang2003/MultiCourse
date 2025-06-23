// utils/upload.helper.js

const path = require("path");
const fs = require("fs");

const uploadFileToLocalStorage = async (file, folderPath = "uploads/") => {
  const uploadDir = path.join(__dirname, "..", folderPath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = Date.now() + "-" + file.originalname;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  // Trả về URL truy cập công khai
  const publicUrl = `${process.env.BASE_URL}/${folderPath}${filename}`;
  return publicUrl;
};

module.exports = uploadFileToLocalStorage;
