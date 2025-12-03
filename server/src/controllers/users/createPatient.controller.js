const User = require("../../models/user.model");
const UserData = require("../../models/userData.model");

async function createPatientController(req, res) {
  try {
    const {
      email,
      phone_number,
      Username,
      doctor,
      assignedNurseEmail,
      status,
    } = req.body;

    // 🧾 Validate required fields
    if (
      !email ||
      !phone_number ||
      !Username ||
      !doctor ||
      !assignedNurseEmail ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, phone number, doctor, status, assigned nurse email, and username are required.",
      });
    }

    // 🔍 Check if patient already exists (by email or phone)
    const existingPatient = await UserData.findOne({
      $or: [{ email }, { phone_number }],
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message:
          existingPatient.email === email
            ? "User with this email already exists."
            : "User with this phone number already exists.",
      });
    }

    // 👩‍⚕️ Verify assigned nurse
    const assignedNurse = await User.findOne({
      email: assignedNurseEmail,
      role: "nurse",
    });

    if (!assignedNurse) {
      return res.status(404).json({
        success: false,
        message: "Assigned nurse with this email does not exist.",
      });
    }

    // 👨‍⚕️ Verify doctor
    const doctorInfo = await User.findById(doctor);
    if (!doctorInfo || doctorInfo.role !== "doctor") {
      return res.status(404).json({
        success: false,
        message: "Doctor with this ID does not exist or is not a doctor.",
      });
    }

    // 🩺 Create patient record
    const newPatient = new UserData({
      ...req.body,
      doctor_name: doctorInfo.username,
      doctor_email: doctorInfo.email,
      doctor_id: doctorInfo._id,
    });
    await newPatient.save();

    return res.status(201).json({
      success: true,
      message: "Patient created successfully.",
      patient: {
        id: newPatient._id,
        email: newPatient.email,
        Username: newPatient.Username,
        prediction: newPatient.prediction,
        probability: newPatient.probability,
        risk_level: newPatient.risk_level,
      },
    });
  } catch (error) {
    console.error("❌ Error creating patient:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating patient.",
      error: error.message,
    });
  }
}

module.exports = createPatientController;
