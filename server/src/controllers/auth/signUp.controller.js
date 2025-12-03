const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");

async function signUpController(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({
      message:
        "Username must be at least 3 characters and password at least 6 characters long.",
    });
  }

  const findUser = await User.findOne({ email });
  if (findUser) {
    return res
      .status(409)
      .json({ message: "User with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  if (!newUser) {
    return res.status(500).json({ message: "Error creating user." });
  }

  await newUser.save();

  return res.status(201).json({ message: "User registered successfully." });
}

module.exports = signUpController;
