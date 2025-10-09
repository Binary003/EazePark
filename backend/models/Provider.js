const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  price: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Provider", ProviderSchema);
