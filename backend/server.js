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
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel domain (for preview deployments)
    if (origin.includes('.vercel.app')) return callback(null, true);
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
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

// Function to geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// POST: Register Provider
app.post("/api/provider-register", upload.single("image"), async (req, res) => {
  try {
    console.log("📝 NEW PROVIDER REGISTRATION REQUEST:");
    console.log("  Headers:", req.headers);
    console.log("  Body:", req.body);
    console.log("  File:", req.file);
    
    const { name, email, phone, location, price } = req.body;
    const image = req.file?.filename;
    
    console.log("📝 NEW PROVIDER REGISTRATION:");
    console.log("  Name:", name);
    console.log("  Location:", location);
    console.log("  Price:", price);

    if (!name || !email || !phone || !location || !price || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Geocode the address to get coordinates
    console.log(`🔍 Geocoding address: "${location}"`);
    const coordinates = await geocodeAddress(location);
    
    if (!coordinates) {
      console.log("❌ Geocoding failed for:", location);
      return res.status(400).json({ error: "Unable to geocode the provided address. Please provide a valid address." });
    }
    
    console.log("✅ Geocoding successful:");
    console.log("  Lat:", coordinates.lat);
    console.log("  Lon:", coordinates.lon);
    console.log("  Display Name:", coordinates.displayName);

    const provider = await Provider.create({
      name,
      email,
      phone,
      location,
      coordinates: `${coordinates.lat},${coordinates.lon}`, // Store as "lat,lon" string for compatibility
      displayAddress: coordinates.displayName || location,
      price,
      imageUrl: `/uploads/${image}`,
    });
    
    console.log("💾 Provider saved to database:");
    console.log("  ID:", provider._id);
    console.log("  Coordinates stored:", provider.coordinates);
    console.log("  Display Address:", provider.displayAddress);

    res.json({ message: "Provider registered successfully", provider });
  } catch (error) {
    console.error("❌ Provider register error:", error);
    res.status(500).json({ error: "Server error during provider registration" });
  }
});

// GET: All Providers
app.get("/api/providers", async (req, res) => {
  try {
    console.log("📋 Fetching all providers from database...");
    const providers = await Provider.find();
    console.log(`📊 Found ${providers.length} providers:`);
    
    // Auto-fix any providers missing coordinates
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`  ${i + 1}. ${provider.name} at ${provider.location}`);
      console.log(`     Coordinates: ${provider.coordinates}`);
      
      // If provider doesn't have coordinates, geocode automatically
      if (!provider.coordinates && provider.location) {
        console.log(`🔄 Auto-fixing coordinates for ${provider.name}...`);
        const coordinates = await geocodeAddress(provider.location);
        
        if (coordinates) {
          console.log(`✅ Geocoded: lat=${coordinates.lat}, lon=${coordinates.lon}`);
          provider.coordinates = `${coordinates.lat},${coordinates.lon}`;
          provider.displayAddress = coordinates.displayName || provider.location;
          await provider.save();
          console.log(`💾 Updated ${provider.name} with coordinates`);
        } else {
          console.log(`❌ Failed to geocode ${provider.name}`);
        }
      }
    }
    
    res.json(providers);
  } catch (error) {
    console.error("❌ Fetch providers error:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// DELETE: Delete a specific provider by ID
app.delete("/api/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete provider with ID: ${id}`);
    
    // Check if ID is valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid ObjectId format: ${id}`);
      return res.status(400).json({ error: "Invalid provider ID format" });
    }
    
    const deletedProvider = await Provider.findByIdAndDelete(id);
    
    if (!deletedProvider) {
      console.log(`❌ Provider with ID ${id} not found`);
      return res.status(404).json({ error: "Provider not found" });
    }
    
    console.log(`✅ Successfully deleted provider: ${deletedProvider.name}`);
    res.json({ 
      message: "Provider deleted successfully", 
      deletedProvider: {
        id: deletedProvider._id,
        name: deletedProvider.name,
        location: deletedProvider.location
      }
    });
  } catch (error) {
    console.error("❌ Error deleting provider:", error);
    res.status(500).json({ error: "Failed to delete provider" });
  }
});

// POST: Fix missing coordinates for all providers
app.post("/api/fix-provider-coordinates", async (req, res) => {
  try {
    console.log("🔧 Starting coordinate fix process...");
    const providers = await Provider.find({ coordinates: { $exists: false } });
    console.log(`📊 Found ${providers.length} providers without coordinates`);
    
    const results = [];
    
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      console.log(`🔄 Processing ${i + 1}/${providers.length}: ${provider.name}`);
      console.log(`📍 Location: ${provider.location}`);
      
      const coordinates = await geocodeAddress(provider.location);
      
      if (coordinates) {
        console.log(`✅ Successfully geocoded: lat=${coordinates.lat}, lon=${coordinates.lon}`);
        provider.coordinates = `${coordinates.lat},${coordinates.lon}`;
        provider.displayAddress = coordinates.displayName || provider.location;
        await provider.save();
        
        results.push({
          id: provider._id,
          name: provider.name,
          location: provider.location,
          coordinates: provider.coordinates,
          status: 'success'
        });
        console.log(`💾 Updated provider ${provider.name} with coordinates`);
      } else {
        console.log(`❌ Failed to geocode ${provider.name}`);
        results.push({
          id: provider._id,
          name: provider.name,
          location: provider.location,
          status: 'failed'
        });
      }
      
      // Add delay between requests to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Coordinate fix complete. Updated ${results.filter(r => r.status === 'success').length}/${results.length} providers`);
    
    res.json({
      message: "Coordinate fix process completed",
      totalProcessed: results.length,
      successCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status === 'failed').length,
      results
    });
  } catch (error) {
    console.error("❌ Fix coordinates error:", error);
    res.status(500).json({ error: "Failed to fix coordinates" });
  }
});

// =============================================
// 🔚 PROVIDER FUNCTIONALITY ENDS HERE 🔚
// =============================================

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
