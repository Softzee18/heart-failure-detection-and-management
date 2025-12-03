const UserData = require("../../models/userData.model");

async function doctorDeletePatient(req, res) {
  const patient_id = await req.params.id;
  try {
    const getPatients = await UserData.findByIdAndDelete(patient_id);
    if (!getPatients) {
      res
        .status(404)
        .send({ success: false, message: "Coundnt find patient data" });
    }

    res
      .status(200)
      .send({ success: true, message: "successfully deleted patient data" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Something went wrong." });
  }
}

module.exports = doctorDeletePatient;
