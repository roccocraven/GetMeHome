const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables


const app = express();
const port = process.env.PORT || 5000;


console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Exit process if connection fails
    });

// Schema for Travel Data
const travelSchema = new mongoose.Schema({
    mode: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    departureDate: { type: String, required: true },
    fromCoords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    toCoords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
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

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to the Travel Comparison Backend!");
});

// Search Route
app.get("/search", async (req, res) => {
    try {
        const { origin, destination, mode, maxPrice, sortBy, departureDate } = req.query;

        // Validate required query parameters
        if (!origin || !destination) {
            return res.status(400).json({ error: "Origin and destination are required." });
        }

        // Build the query dynamically
        let query = {};
        if (origin) query.from = { $regex: new RegExp(origin, "i") }; // Case insensitive
        if (destination) query.to = { $regex: new RegExp(destination, "i") };
        if (mode) query.mode = mode;
        if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };
        if (departureDate) query.departureDate = departureDate;

        // Perform search in the database
        let results = await Travel.find(query);

        // Sorting logic using MongoDB
        if (sortBy) {
            const sortOption = sortBy === "price" ? { price: 1 } : { duration: 1 };
            results = await Travel.find(query).sort(sortOption);
        }

        // Return results
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: "No travel options found." });
        }
    } catch (error) {
        console.error("Error fetching results:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 404 Route - Handle invalid endpoints
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running in ${process.env.NODE_ENV || "development"} mode`);
    console.log(`🌐 Listening on http://localhost:${port}`);
});
