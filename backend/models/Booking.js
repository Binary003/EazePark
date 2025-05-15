const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userLocation: String,
  parkingId: String,
  parkingLocation: String,
});

module.exports = mongoose.model('Booking', bookingSchema);
