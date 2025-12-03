const User = require("../../models/user.model");
const UserData = require("../../models/userData.model");

async function getUserDataController(req, res) {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user account
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User account not found" });
    }

    // Find the user data using the email from the user account
    const userData = await UserData.findOne({ email: existingUser.email });
    if (!userData) {
      return res
        .status(200)
        .json({ message: "User data not found", data: null });
    }

    userData.Username = existingUser.username;

    // Return the user data
    res.status(200).json({
      message: "User data retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}

module.exports = getUserDataController;
