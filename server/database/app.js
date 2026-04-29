const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

// Models
const Review = require('./review');
const Dealership = require('./dealership');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Load JSON data
const reviews_data = JSON.parse(
  fs.readFileSync("data/reviews.json", "utf8")
);

const dealerships_data = JSON.parse(
  fs.readFileSync("data/dealerships.json", "utf8")
);

// Seed DB
async function seedDB() {
  try {
    await Review.deleteMany({});
    await Dealership.deleteMany({});

    await Review.insertMany(reviews_data.reviews);
    await Dealership.insertMany(dealerships_data.dealerships);

    console.log("Database seeded successfully");
  } catch (error) {
    console.log("Seeding error:", error.message);
  }
}

seedDB();

// ---------------- ROUTES ----------------

// Home
app.get('/', (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// ---------------- FETCH ALL REVIEWS ----------------
app.get('/fetchReviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({ status: 200, reviews });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// ---------------- FETCH REVIEWS BY DEALER ----------------
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    const reviews = await Review.find({ dealership: dealerId });
    res.json({ status: 200, reviews });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// ---------------- FETCH ALL DEALERS ----------------
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealership.find();
    res.json({ status: 200, dealerships: dealers });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// ---------------- FETCH DEALERS BY STATE ----------------
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const dealers = await Dealership.find({ st: req.params.state });
    res.json({ status: 200, dealerships: dealers });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// ---------------- FETCH DEALER BY ID ----------------
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    const dealer = await Dealership.findOne({ id: dealerId });
    res.json({ status: 200, dealership: dealer });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// ---------------- INSERT REVIEW ----------------
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;

    // Generate new ID
    const lastReview = await Review.findOne().sort({ id: -1 });
    const new_id = lastReview ? lastReview.id + 1 : 1;

    const review = new Review({
      id: new_id,
      name: data.name,
      dealership: parseInt(data.dealership),
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
    });

    const savedReview = await review.save();
    res.json(savedReview);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});