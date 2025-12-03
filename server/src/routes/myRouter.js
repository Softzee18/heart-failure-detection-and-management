const express = require("express");
const loginController = require("../controllers/auth/login.controller");
const signUpController = require("../controllers/auth/signUp.controller");
const getUserDataController = require("../controllers/users/getUserbyId.controller");
const createPatientController = require("../controllers/users/createPatient.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const doctorGetAllPatients = require("../controllers/users/doctorGetAllPatients.controller");
const doctorDeletePatient = require("../controllers/users/doctorDeletePatient.controller");
const doctorUpdatePatient = require("../controllers/users/doctorUpdatePatient.controller");
const getUsersController = require("../controllers/users/getUser.controller");
const AdminDeleteUser = require("../controllers/users/AdminDeleteUser");
const adminUpdateUserController = require("../controllers/users/adminUpdateUser.controller");
const getNursePatientsController = require("../controllers/users/getNursePatients.controller");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to My API");
});
// auth route
router.post("/auth/login", loginController);
router.post("/auth/signup", signUpController);

// user route
router.get(
  "/user/data",
  authMiddleware,
  roleMiddleware("user"),
  getUserDataController
);
// admin route
router.get(
  "/admin/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsersController
);
router.delete(
  "/admin/delete/:id",
  authMiddleware,
  roleMiddleware("admin"),
  AdminDeleteUser
);
router.put(
  "/admin/update/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminUpdateUserController
);

// nurse
router.get(
  "/nurse/getPatients",
  authMiddleware,
  roleMiddleware("nurse"),
  getNursePatientsController
);

// doctor
router.post(
  "/user/create",
  authMiddleware,
  roleMiddleware("doctor"),
  createPatientController
);
router.get(
  "/doctor/getPatients",
  authMiddleware,
  roleMiddleware("doctor"),
  doctorGetAllPatients
);
router.delete(
  "/doctor/deletePatients/:id",
  authMiddleware,
  roleMiddleware("doctor"),
  doctorDeletePatient
);
router.post(
  "/doctor/updatePatients",
  authMiddleware,
  roleMiddleware("doctor"),
  doctorUpdatePatient
);

module.exports = router;
