const User = require("../../models/user.model");

async function getUsersController(req, res) {
  try {
    const allUsers = await User.find().sort({ createdAt: -1 }).limit(100);

    // If no users found
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found in the system.",
        users: [],
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
}

module.exports = getUsersController;
