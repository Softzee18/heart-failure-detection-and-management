const User = require("../../models/user.model");
const UserData = require("../../models/userData.model");

async function getNursePatientsController(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role !== "nurse") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only nurses can access this resource.",
      });
    }

    const patients = await UserData.find({ assignedNurseEmail: user.email })
      .sort({ updatedAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      message: "Patients fetched successfully.",
      patients,
    });
  } catch (error) {
    console.error("❌ Error fetching patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}

module.exports = getNursePatientsController;
