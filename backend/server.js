require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const Booking = require("./models/Booking");
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

const app = express(); // Initialize app

// Middleware
app.use(express.json());

const allowedOrigins = [
  "https://eaze-park.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Serve static image uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------- LOCATION FUNCTION --------------
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

// ----------- SIGNUP ROUTE --------------
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

// ----------- LOGIN ROUTE --------------
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

// ----------- BOOKING ROUTE --------------
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

// =============================================
// 🔧 NEW PROVIDER FUNCTIONALITY STARTS BELOW 🔧
// =============================================

const Provider = require("./models/Provider");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST: Register Provider
app.post("/api/provider-register", upload.single("image"), async (req, res) => {
  try {
    const { name, email, phone, location, price } = req.body;
    const image = req.file?.filename;

    if (!name || !email || !phone || !location || !price || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const provider = await Provider.create({
      name,
      email,
      phone,
      location,
      price,
      imageUrl: `/uploads/${image}`,
    });

    res.json({ message: "Provider registered successfully", provider });
  } catch (error) {
    console.error("Provider register error:", error);
    res.status(500).json({ error: "Server error during provider registration" });
  }
});

// GET: All Providers
app.get("/api/providers", async (req, res) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (error) {
    console.error("Fetch providers error:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// =============================================
// 🔚 PROVIDER FUNCTIONALITY ENDS HERE 🔚
// =============================================

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
