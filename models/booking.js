const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  checkin: {
    type: Date,
    required: true,
  },
  checkout: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  notes: String,
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["confirmed", "checked-in", "checked-out", "cancelled"],
    default: "confirmed",
  },
  totalPrice: Number,
});

module.exports = mongoose.model("Booking", bookingSchema);
