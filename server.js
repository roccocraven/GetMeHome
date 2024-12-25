const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // For environment variables

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Schema for Travel Data
const travelSchema = new mongoose.Schema({
    mode: String,
    from: String,
    to: String,
    price: Number,
    duration: Number,
    departureDate: String,
    fromCoords: {
        lat: Number,
        lng: Number,
    },
    toCoords: {
        lat: Number,
        lng: Number,
    },
});

const Travel = mongoose.model("Travel", travelSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware - Logs all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to the Travel Comparison Backend!");
});

// Search route
app.get("/search", async (req, res) => {
    try {
        const { origin, destination, mode, maxPrice, sortBy, departureDate } = req.query;

        // Build the query dynamically
        let query = {};
        if (origin) query.from = { $regex: new RegExp(origin, "i") }; // Case insensitive
        if (destination) query.to = { $regex: new RegExp(destination, "i") };
        if (mode) query.mode = mode;
        if (maxPrice) query.price = { $lte: parseInt(maxPrice) };
        if (departureDate) query.departureDate = departureDate;

        // Perform search in the database
        let results = await Travel.find(query);

        // Sorting logic
        if (sortBy === "price") {
            results = results.sort((a, b) => a.price - b.price); // Sort by cheapest
        } else if (sortBy === "duration") {
            results = results.sort((a, b) => a.duration - b.duration); // Sort by shortest duration
        }

        // Return results
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: "No travel options found" });
        }
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
