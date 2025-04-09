const express = require("express");
const Trip = require("../models/trip");
const router = express.Router();

// INDUCES
// Need to add authentication middleware to protect these routes
// Need to add middleware to check if user is logged in

// Index Route: Get all trips
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate("destination travellers");
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New Route:
// Used to render form for creating new trip. (Not sure if this is needed)
// Maybe Implement in frontend as a router link instead
router.get("/new", (req, res) => {
  nm;
  res.status(200).json({ message: "New Route Working!" });
})

// Delete Route: Delete a trip

// Update Route: Update a trip

// Basic Create Route
// Need to add authentication middleware 
router.post("/", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit Route:

// Show Route: Get a specific trip
