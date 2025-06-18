const Activity = require("../Models/ActivityHistory"); // Ensure Activity model is imported

//get all admin activity history
exports.getAllActivityOfAdmin = async (req, res) => {
  try {
    const activity = await Activity.find({ role: "Admin" });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllActivityOfTutor = async (req, res) => {
  try {
    const activity = await Activity.find({
      user: req.user._id,
      role: "Tutor",
    });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
