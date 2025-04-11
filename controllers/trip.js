const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token.js");
const Trip = require("../models/trip");
const Destination = require("../models/destination");

// Index Route: Get all trips for a specific user
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ travellers: req.user._id })
      .populate("destination travellers")
      .sort({ createdAt: "desc" });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New Route: Form for creating a new trip
router.get("/new", verifyToken, (req, res) => {
  res.status(200).json({ message: "New Trip Form" });
});

// Create a Trip:
router.post("/", verifyToken, async (req, res) => {
  req.body.travellers = [req.user._id];
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Show Route: Show a specific trip
router.get("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate("destination")
      .populate("travellers");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Route: Form to edit a trip
router.get("/:tripId/edit", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (!trip.travellers.some(id => id.toString() === req.user._id)) {
      return res.status(403).json({ message: "Unauthorized to edit this trip" });
    }
    res.status(200).json({ message: "Edit Trip Form", trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Route: Update a trip
router.put("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.travellers.some(id => id.toString() === req.user._id)) {
      return res
        .status(403)
        .json({ message: "Oops! Looks like you are not a part of this trip" });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Route: Delete a trip
router.delete("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.travellers.some(id => id.toString() === req.user._id)) {
      return res
        .status(403)
        .json({ message: "Oops! Looks like you are not a part of this trip" });
    }
    const deletedTrip = await Trip.findByIdAndDelete(req.params.tripId);
    res.status(200).json(deletedTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;





/*----------------------------------------------------------------------------Graveyard-------------------------------------------------------------------------------*/
// // New Route:
// // Used to render form for creating new trip. (Not sure if this is needed)
// // Maybe Implement in frontend as a router link instead
// router.get("/new", (req, res) => {
//   res.status(200).json({ message: "New Route Working!" });
// })


// Edit Route:
// Not sure if needed in backend, should Render in frontend as a form to edit a trip
