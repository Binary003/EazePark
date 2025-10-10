const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String, // Original address entered by user
  coordinates: String, // Geocoded coordinates as "lat,lon"
  displayAddress: String, // Full address from geocoding service
  price: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Provider", ProviderSchema);
