const User = require("../../models/user.model");

async function adminUpdateUserController(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Basic validation
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role field is required.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user.",
      error: error.message,
    });
  }
}

module.exports = adminUpdateUserController;
