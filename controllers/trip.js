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
    // Updating so that travellers is now made up of a user with a specific role
    req.body.travellers = [{
        user: req.user._id,
        // Creater of a trip is automatically the owner
        role: 'Owner'
    }]; // Putting this in an array will allow multiple users to be associated with a trip
    
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
        const trips = await Trip.find({ 'travellers.user': req.user._id }) // Users can only see their own trips now. This was set to users can see all trips before. 
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
        // Need to Find Trip before updating
        // const trip = await Trip.findById(req.params.tripId);
        // Changed up line above because the !trip logic wasn't working anymore.
        const trip = await Trip.findOne({
            _id: req.params.tripId,
            // Checks if user is included in the travellers array
            'travellers.user': req.user._id
        });
  try {
    const trip = await Trip.findById(req.params.tripId);

        // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

        // Check if user is one of the travellers
        // This next line stopped working for some reason. The error I was getting when testing showed an issue with returning a string instead of an object.
        // if (!trip.travellers.includes(req.user._id)) {
        // Updated above line to this, which is paired with the new version of trip variable above.
        if (!trip) {
            return res
                .status(403)
                .json({ message: "Oops! Looks like you are not a part of this trip" });
        }

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
        // const trip = await Trip.findById(req.params.tripId);
        // New trip definition:
        const trip = await Trip.findOne({
            _id: req.params.tripId,
            // Checks if user is included in the travellers array
            'travellers.user': req.user._id
        });

        // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers
        // if (!trip.travellers.includes(req.user._id)) {
        //     return res
        //         .status(403)
        //         .json({ message: "Oops! Looks like you are not a part of this trip" });
        // }
        // Delete the trip
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
