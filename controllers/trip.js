const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verify-token.js");
const { canViewTrip, canEditTrip } = require('../middleware/user-permissions.js');
const Trip = require("../models/trip");
const Destination = require("../models/destination");
const User = require("../models/user");

// Index Route: Get all trips
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ "travellers.user": req.user._id })
      .populate("destination travellers")
      .populate("travellers.user")
      .sort({ createdAt: "desc" }); // Sort trips in descending order

    if (!trips) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Show Route: Show a specific trip
router.get("/:tripId", verifyToken, canViewTrip, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate("destination")
      .populate("travellers.user", "_id username") 
      

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create route: Create a Trip
router.post("/", verifyToken, async (req, res) => {
    req.body.travellers = [
        {
            user: req.user._id,
            role: "Owner",
        },
    ];

    try {
        const trip = await Trip.create(req.body);
        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Route: Update a trip
router.put("/:tripId", verifyToken, canEditTrip, async (req, res) => {
  try {
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
    const userId = req.user._id;

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

   const isOwner = trip.travellers.some(traveller => {
      return traveller.user.toString() === userId.toString() && traveller.role === "Owner"
   })

    if (!isOwner) {
      return res.status(403).json({ message: "You do not have permission to delete this trip." });
    }

    const deletedTrip = await Trip.findByIdAndDelete(req.params.tripId);
    res.status(200).json(deletedTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*------------------------------------------------------ User Collaboration ------------------------------------------------------*/

// Add a user to a trip
router.post("/:tripId/travellers", verifyToken, canEditTrip, async (req, res) => {
    try {
      const { username, role } = req.body;

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found." });
      }

      if (!username) {
        return res.status(400).json({ message: "Username is required." });
      }

      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const existingTraveller = trip.travellers.find(
        (traveller) => traveller.user.toString() === user._id.toString 
      );
      if (existingTraveller) {
        return res.status(400).json({ message: "User is already a traveller." });
      }

      trip.travellers.push({ user: user._id, role });
      await trip.save();
      
      res.status(200).json(trip);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;