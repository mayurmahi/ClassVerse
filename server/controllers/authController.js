const User = require("../models/User");
const Organization = require("../models/Organization");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, organizationId: user.organizationId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Nobody can register as Admin or SuperAdmin from UI
    if (role === "Admin" || role === "SuperAdmin") {
      return res.status(403).json({
        message: "This role cannot be registered directly. Please contact ClassVerse admin."
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Extract email domain
    const emailDomain = email.split("@")[1];

    // Teacher or Student — auto detect organization from email domain
    const org = await Organization.findOne({ emailDomain });
    if (!org) {
      return res.status(400).json({
        message: "No organization found for this email domain. Please contact your college admin."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organizationId: org._id,
    });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};