const User = require("../../models/user.model");
const UserData = require("../../models/userData.model");

async function doctorGetAllPatients(req, res) {
  try {
    const doctorId = req.user._id;

    // Get doctor info
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only doctors can access this resource.",
      });
    }

    const patients = await UserData.find({
      $or: [{ doctor_id: doctor._id }, { doctor_email: doctor.email }],
    })
      .sort({ updatedAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error("❌ Doctor get all patients error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve patients.",
      error: error.message,
    });
  }
}

module.exports = doctorGetAllPatients;
