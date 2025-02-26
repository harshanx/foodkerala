const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const twilio = require("twilio");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/your_database", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Twilio Setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

// User Schema
const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "5m" }, // Auto delete after 5 minutes
});

const User = mongoose.model("User", userSchema);
const OTP = mongoose.model("OTP", otpSchema);

// Send OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.json({ success: false, message: "Phone number is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`OTP for ${phone}:`, otp); // Debugging, remove in production

  await OTP.deleteMany({ phone });

  const newOtp = new OTP({ phone, otp });
  await newOtp.save();

  try {
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.json({ success: false, message: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.json({ success: false, message: "Phone and OTP required" });

  const otpRecord = await OTP.findOne({ phone, otp });

  if (!otpRecord) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  await OTP.deleteMany({ phone });

  res.json({ success: true, message: "OTP verified successfully" });
});

// Register User
app.post("/register", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) return res.json({ success: false, message: "Phone and Password required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ phone, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.json({ success: false, message: "Phone number already exists" });
  }
});

// Login User
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) return res.json({ success: false, message: "Phone and Password required" });

  const user = await User.findOne({ phone });
  if (!user) return res.json({ success: false, message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ success: false, message: "Incorrect password" });

  res.json({ success: true, message: "Login successful" });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
