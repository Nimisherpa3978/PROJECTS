const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection with error handling
mongoose.connect("mongodb://127.0.0.1:27017/hotelDB").catch((err) => {
  console.error("MongoDB connection error:", err);
});

// MODELS
const User = require("./models/user");
const Booking = require("./models/booking");

// MIDDLEWARE
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// AUTH: SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { fullname, email, username, password } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ fullname, email, username, password: hashed });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// AUTH: LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      "secretkey",
      { expiresIn: "24h" },
    );
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// BOOKING: CREATE
app.post("/book", async (req, res) => {
  try {
    const { name, email, phone, room, checkin, checkout, guests, notes } =
      req.body;

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !room ||
      !checkin ||
      !checkout ||
      !guests
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(checkin) >= new Date(checkout)) {
      return res.status(400).json({ message: "Invalid check-out date" });
    }

    const booking = new Booking({
      name,
      email,
      phone,
      room,
      checkin,
      checkout,
      guests,
      notes,
      bookingDate: new Date(),
      status: "confirmed",
    });

    await booking.save();
    res
      .status(201)
      .json({
        message: "Booking confirmed successfully",
        bookingId: booking._id,
      });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error during booking" });
  }
});

// GET ALL BOOKINGS (admin only - requires token)
app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET BOOKING BY ID
app.get("/booking/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ message: "Hotel Tibet International API is running" });
});

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(
    `\n🏨 Hotel Tibet International API running on port ${PORT}\nVisit: http://localhost:${PORT}\n`,
  ),
);
