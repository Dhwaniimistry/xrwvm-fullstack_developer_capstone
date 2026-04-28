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

// Routes
app.get('/', (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({ status: 200, reviews });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// Fetch reviews by dealer id
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ dealership: req.params.id });
    res.json({ status: 200, reviews });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealership.find();
    res.json({ status: 200, dealerships: dealers });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const dealers = await Dealership.find({ state: req.params.state });
    res.json({ status: 200, dealerships: dealers });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// Fetch dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealership.findById(req.params.id);
    res.json({ status: 200, dealership: dealer });
  } catch (err) {
    res.json({ status: 500, error: err.message });
  }
});

// Insert review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;

    const documents = await Review.find().sort({ id: -1 });
    let new_id = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Review({
      id: new_id,
      name: data.name,
      dealership: data.dealership,
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});