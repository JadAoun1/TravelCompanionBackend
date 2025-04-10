const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token.js");
const Trip = require("../models/trip");
const Destination = require("../models/destination");

// INDUCES

// Index Route: Get all trips
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find().populate("destination travellers").sort({ createdAt: "desc" }); // Sort trips in descending order
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // New Route:
// // Used to render form for creating new trip. (Not sure if this is needed)
// // Maybe Implement in frontend as a router link instead
// router.get("/new", (req, res) => {
//   res.status(200).json({ message: "New Route Working!" });
// })

// Delete Route: Delete a trip

// Update Route: Update a trip
router.put('/:tripId', verifyToken, async (req, res) => {
    try {
        // Need to Find Trip before updating 
       const trip = await Trip.findById(req.params.tripId);

       // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user is one of the travellers
        if (!trip.travellers.includes(req.user._id)) {
            return res.status(403).json({ message: 'Oops! Looks like you are not a part of this trip' });
        }

        // Update the trip with the new information
        const updatedTrip = await Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true })

        res.status(200).json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//  Create Route
router.post("/", verifyToken, async (req, res) => {
  req.body.travellers = [req.user._id]; // Putting this in an array will allow multiple users to be associated with a trip
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit Route: Render in frontend form to edit a trip

// Show Route: Get a specific trip
router.get('/:tripId', verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId) 
            .populate('destination')
            .populate('travellers');
        
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;