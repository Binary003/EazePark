require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User = require("./models/User");
const Booking = require("./models/Booking");

const app = express();
app.use(cors());

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("🔥 MongoDB Connection Error:", err);
  });


// ✅ Location Function
const getLocationName = async (lat, lon) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Unknown Location";
  }
};

// ✅ Signup
app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields are required" });

  try {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ error: "Email or phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword });
    res.json({ message: "✅ Signup successful!", userId: user._id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) return res.status(400).json({ error: "Email/Phone and Password are required" });

  try {
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(401).json({ error: "Account not found. Please sign up!" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Incorrect password" });

    res.json({ message: "✅ Login successful", userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Book Parking
app.post("/api/book-parking", async (req, res) => {
  const { userId, userLat, userLon, parkingId, parkingLat, parkingLon } = req.body;
  if (!userId || !userLat || !userLon || !parkingId || !parkingLat || !parkingLon) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User does not exist!" });

    const userLocationName = await getLocationName(userLat, userLon);
    const parkingLocationName = await getLocationName(parkingLat, parkingLon);

    const booking = await Booking.create({
      userId,
      userLocation: userLocationName,
      parkingId,
      parkingLocation: parkingLocationName,
    });

    res.json({ message: "✅ Booking successful!", bookingId: booking._id });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
