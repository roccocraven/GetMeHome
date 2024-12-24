


const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Example travel data (simulating a database)
const travelData = [
    { mode: "plane", from: "New York", to: "London", price: 450, duration: 7, fromCoords: { lat: 40.7128, lng: -74.0060 }, toCoords: { lat: 51.5074, lng: -0.1278 } },
    { mode: "train", from: "Paris", to: "Berlin", price: 120, duration: 9, fromCoords: { lat: 48.8566, lng: 2.3522 }, toCoords: { lat: 52.5200, lng: 13.4050 } },
    { mode: "bus", from: "Rome", to: "Milan", price: 30, duration: 8, fromCoords: { lat: 41.9028, lng: 12.4964 }, toCoords: { lat: 45.4642, lng: 9.1900 } },
    { mode: "car", from: "Los Angeles", to: "San Francisco", price: 100, duration: 6, fromCoords: { lat: 34.0522, lng: -118.2437 }, toCoords: { lat: 37.7749, lng: -122.4194 } },
    { mode: "bike", from: "Amsterdam", to: "Rotterdam", price: 10, duration: 3, fromCoords: { lat: 52.3676, lng: 4.9041 }, toCoords: { lat: 51.9225, lng: 4.4792 } },
    { mode: "walk", from: "Venice", to: "Florence", price: 0, duration: 20, fromCoords: { lat: 45.4408, lng: 12.3155 }, toCoords: { lat: 43.7696, lng: 11.2558 } },
];

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to the Travel Comparison Backend!");
});

// Search route
app.get("/search", (req, res) => {
    const { origin, destination, mode, maxPrice, sortBy } = req.query;

    // Filter travel data based on user input
    const results = travelData.filter(
        (entry) =>
            entry.from.toLowerCase() === origin.toLowerCase() &&
            entry.to.toLowerCase() === destination.toLowerCase()
    );
    // Filter by preferred mode
    if (mode) {
        results = results.filter((entry) => entry.mode.toLowerCase() === mode.toLowerCase());
    }
// Filter by max price
if (maxPrice) {
    results = results.filter((entry) => entry.price <= parseInt(maxPrice));
}
 // Sort results if required
 if (sortBy === "price") {
    results.sort((a, b) => a.price - b.price); // Sort by cheapest
} else if (sortBy === "duration") {
    results.sort((a, b) => a.duration - b.duration); // Sort by shortest duration
}
    if (results.length > 0) {
        res.json(results);
    } else {
        res.status(404).json({ error: "No travel options found" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Predefined list of random locations
const locations = [
    "London",
    "Paris",
    "Berlin",
    "Milan",
    "San Francisco",
    "Amsterdam",
    "Florence",
    "Tokyo",
    "Sydney",
    "New York"
];

// Handle Random Button Click
document.getElementById("randomButton").addEventListener("click", () => {
    // Select a random location
    const randomIndex = Math.floor(Math.random() * locations.length);
    const randomDestination = locations[randomIndex];

    // Set the random destination in the input box
    document.getElementById("destination").value = randomDestination;
});

// Handle Form Submission
document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    // Get form values
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const mode = document.getElementById("mode").value;
    const maxPrice = document.getElementById("maxPrice").value;
    const sortBy = document.getElementById("sortBy").value;

    // Redirect to results page with query parameters
    window.location.href = `/results.html?origin=${origin}&destination=${destination}&mode=${mode}&maxPrice=${maxPrice}&sortBy=${sortBy}`;
});
