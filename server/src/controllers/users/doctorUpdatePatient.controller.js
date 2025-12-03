const User = require("../../models/user.model");
const UserData = require("../../models/userData.model");

async function doctorUpdatePatient(req, res) {
  try {
    const {
      email,
      phone_number,
      Username,
      doctor,
      assignedNurseEmail,
      status,
      oldEmail,
      ...otherFields // catch all other patient data (e.g., cholesterol, bp, etc.)
    } = req.body;

    // 🧾 Validate required fields
    if (
      !email ||
      !phone_number ||
      !Username ||
      !doctor ||
      !assignedNurseEmail ||
      !status ||
      !oldEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, phone number, doctor, status, assigned nurse email, and username are required.",
      });
    }

    // 🔍 Find the existing patient by their old email
    const existingPatient = await UserData.findOne({ email: oldEmail });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient with this email does not exist.",
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

    // 🩺 Update patient record
    const updatedPatient = await UserData.findOneAndUpdate(
      { email: oldEmail }, // match old record
      {
        $set: {
          email,
          phone_number,
          Username,
          assignedNurseEmail,
          status,
          doctor_name: doctorInfo.username,
          doctor_email: doctorInfo.email,
          doctor_id: doctorInfo._id,
          ...otherFields,
        },
      },
      { new: true, runValidators: true } // return updated doc and enforce schema validation
    );

    // update user email
    const existingUser = await User.findOne({ email: oldEmail });
    if (existingUser) {
      existingUser.email = email;
      existingUser.username = Username || existingUser.username;
      existingUser.phone_number = phone_number || existingUser.phone_number;
      await existingUser.save();
    }
    return res.status(200).json({
      success: true,
      message: "Patient updated successfully.",
      patient: {
        id: updatedPatient._id,
        email: updatedPatient.email,
        Username: updatedPatient.Username,
        prediction: updatedPatient.prediction,
        probability: updatedPatient.probability,
        risk_level: updatedPatient.risk_level,
        status: updatedPatient.status,
      },
    });
  } catch (error) {
    console.error("❌ Error updating patient:", error);

    // Handle duplicate key error (if updating to an existing email)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating patient.",
      error: error.message,
    });
  }
}

module.exports = doctorUpdatePatient;
