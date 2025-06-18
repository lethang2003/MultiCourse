const Course = require("../Models/Courses");
const Lesson = require("../Models/Lessons");
const Request = require("../Models/Requests");
const Order = require("../Models/Orders");
const User = require("../Models/Users");
const ActivityHistory = require("../Models/ActivityHistory");
const multer = require("multer");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const config = require("../Configurations/Config");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadFileToStorage(file, folderPath) {
  const bucket = admin.storage().bucket();
  const blob = bucket.file(folderPath + file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });
  blobStream.on("error", (err) => {
    console.log(err);
  });
  blobStream.on("finish", async () => {
    await blob.makePublic();
  });
  blobStream.end(file.buffer);

  // Wait for the blob upload to complete
  await new Promise((resolve, reject) => {
    blobStream.on("finish", resolve);
    blobStream.on("error", reject);
  });

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  return publicUrl;
}

//Course with status true
exports.getActiveCourses = async (req, res) => {
  try {
    const activeCourses = await Course.find({ status: true })
      .populate("tutor", "fullname avatar")
      .exec();
    res.json(activeCourses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("tutor", "fullname").exec();
    res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Course of Tutor
exports.getCourseOfTutor = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id })
      .populate("tutor", "fullname")
      .exec();
    res.status(200).json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Course By ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("tutor", "fullname email avatar address phone gender birthday")
      .exec();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const lessons = await Lesson.find({ course_id: req.params.id });
    res.status(200).json({ courseDetail: course, lessons: lessons });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Request Create Course
exports.requetsCreateCourse = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      }

      const tutor = req.user._id;
      const title = req.body.title;
      const description = req.body.description;
      const price = Number(req.body.price);
      const category = req.body.category;

      // Kiểm tra xem file hình ảnh có tồn tại không
      let imageUrl = null;
      if (req.file) {
        // Upload hình ảnh lên Firebase Storage
        const folderPath = "Courses/" + title + "/"; // Thay đổi theo cấu trúc thư mục bạn muốn
        imageUrl = await uploadFileToStorage(req.file, folderPath);
      }

      const newCourse = new Course({
        tutor,
        title,
        description,
        price,
        image: imageUrl,
        category,
      });

      await newCourse.save();
      const newActivity = new ActivityHistory({
        user: req.user._id,
        role: "Tutor",
        description: `Requested to create a new course with \nID: ${newCourse._id} \ntitle: ${title}`,
      });

      const newRequest = new Request({
        tutor,
        course: newCourse._id,
        request_type: "Created new course and waiting for approval",
        content: [
          { title: "Title", value: title },
          { title: "Description", value: description },
          { title: "Price", value: price },
          { title: "Category", value: category },
          { title: "Image", value: imageUrl },
        ],
        status: "Pending",
      });

      await newActivity.save();
      await newRequest.save();
      res.status(201).json(newCourse);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Process Create Course Request
exports.processCreateCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const message = req.body.message;
    const request = await Request.findById(req.params.request_id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const tutor = await User.findById(request.tutor);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newActivity.description = `Rejected the request to create a new course with ID: ${request.course}`;
      await request.save();
      await newActivity.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const course = await Course.findById(request.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      course.status = true;
      request.status = "Approved";
      newActivity.description = `Approved the request to create a new course with ID: ${request.course}`;
      await course.save();
      await request.save();
      await newActivity.save();

      // Gửi email thông báo cho tutor
      const tutor = await User.findById(course.tutor);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email || "datnptce171966@fpt.edu.vn",
          pass: config.password || "ivqm xtbu vfvu wdyk",
        },
      });

      let mailOptions;

      if (status === "Approved") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your course "${course.title}" has been approved and is now live`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We are pleased to inform you that your course, "<strong>${course.title}</strong>," has been successfully approved by the Admin.</p>

      <p>Your course is now visible on the platform, and students can view and enroll in it.</p>

      <p>You can check your course on the platform and track student enrollments. If you have any questions, feel free to contact us.</p>

      <p>Thank you for contributing high-quality content to our platform!</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      } else if (status === "Rejected") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your course "${course.title}" has not been approved`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We regret to inform you that your course, "<strong>${
        course.title
      }</strong>," has not been approved due to the following reasons:</p>

      <p><strong>Reason:</strong> ${message || "Not specified"}</p>

      <p>You may revise your course according to the feedback and resubmit it for review. If you need further clarification, please do not hesitate to contact us.</p>

      <p>Thank you for your effort in creating content for our platform.</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      }

      // Gửi email thông báo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

      res
        .status(200)
        .json({ message: "Course has been created", course: course });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Request Update Course
exports.requestUpdateCourse = async (req, res) => {
  try {
    const newTitle = req.body.title;
    const description = req.body.description;
    const price = Number(req.body.price);
    const category = req.body.category;

    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingRequest = await Request.findOne({
      course: req.params.course_id,
      request_type: "Updated course and waiting for approval",
      status: "Pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request is already pending" });
    }

    const content = [];
    if (newTitle !== course.title) {
      content.push({ title: "NewTitle", value: newTitle });
    }
    if (description !== course.description) {
      content.push({ title: "NewDescription", value: description });
    }
    if (price !== course.price) {
      content.push({ title: "NewPrice", value: price });
    }
    if (category !== course.category) {
      content.push({ title: "NewCategory", value: category });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Tutor",
      description: `Requested to update course with ID: ${course._id}`,
    });

    const newRequest = new Request({
      tutor: req.user._id,
      course: course._id,
      request_type: "Updated course and waiting for approval",
      content: content,
      status: "Pending",
    });

    await newActivity.save();
    await newRequest.save();
    res.status(201).json({ message: "Request sent to admin" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Admin process update course request
exports.processUpdateCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const request = await Request.findById(req.params.request_id);
    const tutor = await User.findById(request.tutor);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newActivity.description = `Rejected the request to update course with ID: ${request.course}`;
      await request.save();
      await newActivity.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const newTitle = request.content.find(
        (item) => item.title === "NewTitle"
      )?.value;
      const newDescription = request.content.find(
        (item) => item.title === "NewDescription"
      )?.value;
      const newPrice = request.content.find(
        (item) => item.title === "NewPrice"
      )?.value;
      const newCategory = request.content.find(
        (item) => item.title === "NewCategory"
      )?.value;

      const course = await Course.findById(request.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Nếu tiêu đề mới khác với tiêu đề cũ
      if (newTitle) {
        const oldFolderPath = `Courses/${course.title}/`;
        const newFolderPath = `Courses/${newTitle}/`;

        // Move all files in the old folder to the new folder
        const bucket = admin.storage().bucket();
        const [files] = await bucket.getFiles({ prefix: oldFolderPath });
        if (files.length > 0) {
          for (const file of files) {
            const oldFilePath = file.name;

            // Tạo đường dẫn mới cho file
            const newFilePath = oldFilePath.replace(
              oldFolderPath,
              newFolderPath
            );

            // Sao chép file sang folder mới
            await bucket.file(oldFilePath).copy(bucket.file(newFilePath));
            // Công khai file mới
            await bucket.file(newFilePath).makePublic();
            // Xóa file cũ
            await bucket.file(oldFilePath).delete();
          }
        }

        if (course.image) {
          course.image = course.image.replace(
            `Courses/${course.title}/`,
            `Courses/${newTitle}/`
          );
        }

        const lessons = await Lesson.find({ course_id: req.params.course_id });
        for (const lesson of lessons) {
          lesson.video_url = lesson.video_url.replace(
            `Courses/${course.title}/`,
            `Courses/${newTitle}/`
          );
          lesson.document_url = lesson.document_url.replace(
            `Courses/${course.title}/`,
            `Courses/${newTitle}/`
          );
          await lesson.save();
        }

        course.title = newTitle;
      }

      if (newDescription) {
        course.description = newDescription;
      }
      if (newPrice) {
        course.price = newPrice;
      }
      if (newCategory) {
        course.category = newCategory;
      }
      request.status = "Approved";
      newActivity.description = `Approved the request to update course with ID: ${request.course}`;
      await course.save();
      await request.save();
      await newActivity.save();

      // Gửi email thông báo cho tutor
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email || "datnptce171966@fpt.edu.vn",
          pass: config.password || "ivqm xtbu vfvu wdyk",
        },
      });

      let mailOptions;

      if (status === "Approved") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your course "${course.title}" update request has been approved`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We are pleased to inform you that your request to update the course "<strong>${course.title}</strong>" has been successfully approved.</p>

      <p>The updated details of your course are now live on our platform. Students will see the new information, including:</p>
      <ul>
      {newTitle && <li><strong>Title:</strong> ${newTitle}</li>}
      {newDescription && <li><strong>Description:</strong> ${newDescription}</li>}
      {newPrice && <li><strong>Price:</strong> ${newPrice}</li>}
      {newCategory && <li><strong>Category:</strong> ${newCategory}
      </ul>

      <p>You can check your course and make any further updates as needed.</p>

      <p>Thank you for continuously improving your content and providing quality education!</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      } else if (status === "Rejected") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your course "${request.course}" update request has been rejected`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We regret to inform you that your request to update the course "<strong>${
        request.course
      }</strong>" has been rejected.</p>

      <p><strong>Reason:</strong> ${message || "Not specified"}</p>

      <p>Please review the provided feedback, make the necessary changes, and resubmit your update request.</p>

      <p>If you need further assistance, feel free to contact our support team.</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      }

      // Gửi email thông báo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

      res.status(200).json(course);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Request Delete Course
exports.requestDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.status === true) {
      return res
        .status(400)
        .json({ message: "Course is active, you can not delete." });
    }

    const existingRequest = await Request.findOne({
      course: req.params.course_id,
      request_type: "Deleted course and waiting for approval",
      status: "Pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request is already pending" });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Tutor",
      description: `Requested to delete course with ID: ${course._id}/n title: ${course.title}`,
    });

    const newRequest = new Request({
      tutor: req.user._id,
      course: course._id,
      request_type: "Deleted course and waiting for approval",
      content: [
        { title: "Title", value: course.title },
        { title: "Description", value: course.description },
        { title: "Price", value: course.price },
        { title: "Category", value: course.category },
      ],
      status: "Pending",
    });

    await newActivity.save();
    console.log(newActivity);
    await newRequest.save();
    res.status(201).json({ message: "Request sent to admin" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Admin process delete course request
exports.processDeleteCourse = async (req, res) => {
  try {
    const status = req.body.status;
    const request = await Request.findById(req.params.request_id);
    const tutor = await User.findById(request.tutor);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    } else if (request.status === "Rejected") {
      return res.status(400).json({ message: "Request has been rejected" });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
    });

    if (status === "Rejected") {
      request.status = "Rejected";
      newActivity.description = `Rejected the request to delete course with ID: ${request.course}`;
      await request.save();
      await newActivity.save();
      return res.status(200).json({ message: "Request has been rejected" });
    }

    if (status === "Approved") {
      const course = await Course.findById(request.course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Xóa tất cả các bài học của khóa học
      await Lesson.deleteMany({ course_id: req.params.course_id });

      // Xóa folder chứa tất cả các file của khóa học
      const bucket = admin.storage().bucket();
      const folderPath = `Courses/${course.title}/`;
      const [files] = await bucket.getFiles({ prefix: folderPath });
      if (files.length > 0) {
        for (const file of files) {
          const filePath = file.name;
          await bucket.file(filePath).delete();
        }
      }

      // Xóa khóa học
      await course.deleteOne();
      request.status = "Approved";
      newActivity.description = `Approved the request to delete course with ID: ${request.course}`;
      await request.save();
      await newActivity.save();

      // Gửi email thông báo cho tutor
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email || "datnptce171966@fpt.edu.vn",
          pass: config.password || "ivqm xtbu vfvu wdyk",
        },
      });

      let mailOptions;

      if (status === "Approved") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your course "${course.title}" has been deleted`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We would like to inform you that your request to delete the course "<strong>${course.title}</strong>" has been <strong>approved</strong> and the course has been successfully removed from our platform.</p>

      <p>All related materials, including lessons and documents, have been deleted as well.</p>

      <p>If you have any further concerns or need assistance, please do not hesitate to contact our support team.</p>

      <p>Thank you for being a valued member of our platform.</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      } else if (status === "Rejected") {
        mailOptions = {
          to: tutor.email,
          from: config.email,
          subject: `Your request to delete course "${request.course}" has been rejected`,
          html: `
      <p>Dear ${tutor.fullname},</p>

      <p>We regret to inform you that your request to delete the course "<strong>${
        request.course
      }</strong>" has been <strong>rejected</strong>.</p>

      <p><strong>Reason:</strong> ${message || "Not specified"}</p>

      <p>If you need further clarification or assistance, please feel free to reach out to our support team.</p>

      <p>Thank you for your understanding.</p>

      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
        };
      }

      // Gửi email thông báo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

      res.status(200).json({ message: "Course has been deleted" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update Course Image
exports.updateCourseImage = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.course_id,
      tutor: req.user._id,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const bucket = admin.storage().bucket();

    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      }

      let imageUrl = null;
      if (req.file) {
        const folderPath = "Courses/" + course.title + "/";
        imageUrl = await uploadFileToStorage(req.file, folderPath);

        // Xóa hình ảnh cũ

        if (course.image) {
          const oldFilePath = course.image.split("firebasestorage.app/")[1]; // Lấy đường dẫn file từ URL
          if (oldFilePath) {
            const file = bucket.file(oldFilePath);
            await file.delete().catch((err) => {
              console.log("Error deleting old image:", err);
            });
          }
        }
      }

      course.image = imageUrl;

      const newActivity = new ActivityHistory({
        user: req.user._id,
        role: "Tutor",
        description: `Updated the image of course with ID: ${course._id}`,
      });

      await newActivity.save();
      await course.save();
      res.status(200).json(course);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update Course status
exports.changeCourseStatus = async (req, res) => {
  try {
    const message = req.body.message;
    const course = await Course.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const tutor = await User.findById(course.tutor);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const newActivity = new ActivityHistory({
      user: req.user._id,
      role: "Admin",
      description: `Changed the status of course with ID: ${
        req.params.course_id
      } form ${course.status} to ${!course.status}`,
    });

    course.status = !course.status;
    await course.save();
    await newActivity.save();
    if (course.status == false) {
      // Gửi email thông báo cho tutor
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email || "datnptce171966@fpt.edu.vn",
          pass: config.password || "ivqm xtbu vfvu wdyk",
        },
      });

      let mailOptions;

      mailOptions = {
        to: tutor.email,
        from: config.email,
        subject: `Your course "${course.title}" has been Deactivated`,
        html: `
      <p>Dear ${tutor.fullname},</p>
        <p>We regret to inform you that your course, "<strong>${
          course.title
        }</strong>," has been deactivated by the Admin.</p>
          <p><strong>Reason:</strong> ${message || "Not specified"}</p>
        <p>Your course is no longer visible on the platform, and students cannot view or enroll in it.</p>
        <p>If you have any questions or need further clarification, please do not hesitate to contact us.</p>
        <p>Thank you for your understanding.</p>
      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
      };

      // Gửi email thông báo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

      res.status(200).json({ message: "Course now is not available" });
    } else {
      // Gửi email thông báo cho tutor
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email || "datnptce171966@fpt.edu.vn",
          pass: config.password || "ivqm xtbu vfvu wdyk",
        },
      });

      let mailOptions;

      mailOptions = {
        to: tutor.email,
        from: config.email,
        subject: `Your course "${course.title}" has been Deactivated`,
        html: `
      <p>Dear ${tutor.fullname},</p>
       <p>We are pleased to inform you that your course, "<strong>${course.title}</strong>," has been successfully activated by the Admin.</p>
        <p>Your course is now visible on the platform, and students can view and enroll in it.</p>
        <p>You can check your course on the platform and track student enrollments. If you have any questions, feel free to contact us.</p>
        <p>Thank you for contributing high-quality content to our platform!</p>
      <p>Best regards,</p>
      <p>Multi Course Team</p>
    `,
      };
      // Gửi email thông báo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });
      res.status(200).json({ message: "Course now is available" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get top 5 course
exports.getTop5Course = async (req, res) => {
  try {
    const top5Courses = await Course.find({ status: true })
      .sort({ rating: -1 })
      .limit(5)
      .populate("tutor", "fullname")
      .exec();
    res.status(200).json(top5Courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get top 5 tutor
exports.getTop5Tutor = async (req, res) => {
  try {
    const top5Tutors = await Course.aggregate([
      {
        $match: { status: true, "comments.0": { $exists: true } }, // Chỉ lấy khóa học có ít nhất 1 comment
      },
      {
        $unwind: "$comments", // Tách từng comment thành một document riêng
      },
      {
        $match: { "comments.rating": { $gte: 1, $lte: 5 } }, // Lọc các comment có rating hợp lệ
      },
      {
        $group: {
          _id: "$tutor",
          averageRating: { $avg: "$comments.rating" }, // Tính trung bình rating của từng tutor
          totalReviews: { $sum: 1 }, // Đếm số lượng đánh giá
        },
      },
      {
        $match: { totalReviews: { $gt: 0 } }, // Chỉ lấy tutor có ít nhất 1 đánh giá
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "tutor",
        },
      },
      { $unwind: "$tutor" },
      { $sort: { averageRating: -1 } }, // Sắp xếp theo rating giảm dần
      { $limit: 5 }, // Chỉ lấy top 5
      {
        $project: {
          tutor: { fullname: 1, _id: 1 },
          averageRating: 1,
          totalReviews: 1,
        },
      }, // Chỉ lấy fullname, averageRating, totalReviews
    ]);

    res.status(200).json(top5Tutors);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//top 1 courses bán chạy

exports.getTop1BestSeller = async (req, res) => {
  try {
    const top5BestSeller = await Order.aggregate([
      { $unwind: "$order_items" },
      {
        $group: {
          _id: "$order_items.course",
          totalSold: { $sum: 1 }, // Đếm số lượng bán
        },
      },
      { $sort: { totalSold: -1 } }, // Sắp xếp theo số lượng bán giảm dần

      { $limit: 1 }, // Chỉ lấy top 1

      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" }, //chuyển từ mảng thành object
      { $match: { "course.status": true } }, // Lọc chỉ lấy khóa học có status = true
      {
        $project: {
          "course.comments": 0,
        },
      },
    ]);

    res.status(200).json(top5BestSeller);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Show list student of each course
exports.getListStudentOfCourses = async (req, res) => {
  try {
    const course = await Course.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const order = await Order.find({
      "order_items.course": req.params.course_id,
    }).populate("user", "fullname email");

    if (!order) {
      return res.status(404).json({ message: "No student found" });
    }

    res.status(200).json({
      course: course,
      students: order.map((item) => item.user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Counting active and inactive courses

exports.countActiveAndInactiveCourses = async (req, res) => {
  try {
    const activeCourses = await Course.countDocuments({ status: true });
    const inactiveCourses = await Course.countDocuments({ status: false });

    res.status(200).json({ activeCourses, inactiveCourses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Counting active and inactive courses of tutor by tutor id
exports.countActiveAndInactiveCoursesOfTutor = async (req, res) => {
  try {
    const tutorId = req.user.id; // Lấy ID của tutor từ token

    // Đếm số khóa học đang hoạt động (status: true)
    const activeCourses = await Course.countDocuments({
      tutor: tutorId,
      status: true,
    });

    // Đếm số khóa học không hoạt động (status: false)
    const inactiveCourses = await Course.countDocuments({
      tutor: tutorId,
      status: false,
    });

    res.status(200).json({ activeCourses, inactiveCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
