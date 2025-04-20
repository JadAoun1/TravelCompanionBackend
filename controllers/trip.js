const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verify-token.js");
const { canViewTrip, canEditTrip } = require('../middleware/user-permissions.js');
const Trip = require("../models/trip");
const Destination = require("../models/destination");
const User = require("../models/user");

// INDUCES

// Create a Trip:
router.post("/", verifyToken, async (req, res) => {
  // Updating so that travellers is now made up of a user with a specific role
  req.body.travellers = [
    {
      user: req.user._id,
      // Creater of a trip is automatically the owner
      role: "Owner",
    },
  ]; // Putting this in an array will allow multiple users to be associated with a trip

  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Index Route: Get all trips
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ "travellers.user": req.user._id }) // Users can only see their own trips now. This was set to users can see all trips before.
      .populate("destination travellers")
      .populate("travellers.user")
      .sort({ createdAt: "desc" }); // Sort trips in descending order

    if (!trips) {
      return res.status(404).json({ message: "Trip not found" });
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
      .populate("travellers.user", "_id username") // Populate the user field with only the username, _id needs to be included to be able to see user id in the frontend and see user role. 
      

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Route: Update a trip
router.put("/:tripId", verifyToken, canEditTrip, async (req, res) => {
  try {
    // Update the trip with the new information
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

    // Check if user is owner
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

      // check to see if trip exists
      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      // Check to see if username is provided
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check to see if the user is already a traveller
      const existingTraveller = trip.travellers.find(
        (traveller) => traveller.user.toString() === user._id.toString // Changing to userId because username is not a field in the traveller object, using userId prevents single traveller from being added multiple times. 
      );
      if (existingTraveller) {
        return res.status(400).json({ message: "User is already a traveller" });
      }

      // Add the new traveller
      trip.travellers.push({ user: user._id, role });
      await trip.save();
      
      res.status(200).json(trip);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

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
