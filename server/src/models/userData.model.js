const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // 🧍 Patient identity & contact
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    Username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    doctor_name: {
      type: String,
      required: [true, "Doctor name is required"],
    },
    doctor_id: {
      type: String,
      required: [true, "Doctor id is required"],
    },
    doctor_email: {
      type: String,
      required: [true, "Doctor email is required"],
    },
    assignedNurseEmail: {
      type: String,
      required: [true, "Assigned nurse email is required"],
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["critical", "improving", "stable", "normal", "New"],
      default: "New",
    },

    // ❤️ Clinical data
    age: {
      type: Number,
      required: true,
      min: [1, "Age must be greater than 0"],
    },
    sex: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },
    chest_pain: {
      type: String,
      enum: ["ATA", "NAP", "ASY", "TA"],
      required: true,
    },
    resting_bp: {
      type: Number,
      required: true,
    },
    cholesterol: {
      type: Number,
      required: true,
    },
    fasting_bs: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    resting_ecg: {
      type: String,
      enum: ["Normal", "ST", "LVH"],
      required: true,
    },
    max_hr: {
      type: Number,
      required: true,
    },
    exercise_angina: {
      type: String,
      enum: ["Y", "N"],
      required: true,
    },
    oldpeak: {
      type: Number,
      required: true,
    },
    st_slope: {
      type: String,
      enum: ["Up", "Flat", "Down"],
      required: true,
    },

    // 🧠 Prediction data
    prediction: {
      type: Number, // 0 = Normal, 1 = Heart Failure
      required: true,
    },
    probability: {
      type: Number,
      required: true,
    },
    risk_level: {
      type: String,
      enum: ["High Risk", "Medium Risk", "Low Risk", "Moderate Risk"],
      default: "Low Risk",
    },

    // 🩺 Recommendations (auto-generated)
    lifestyle: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    monitoring: {
      type: [String],
      default: [],
    },
    referrals: {
      type: [String],
      default: [],
    },
    urgent_actions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const UserData = mongoose.model("userData", patientSchema);

module.exports = UserData;
