const express = require("express");
const router = express.Router();
const { verifyToken, canEditTrip } = require("../middleware/verify-token.js");
const Destination = require("../models/destination");
const Trip = require("../models/trip");
const googlePlaces = require('../services/googlePlaces');


// Create a Destination:
router.post("/:tripId/destinations", verifyToken, canEditTrip, async (req, res) => {
    try {
        // First find the trip to verify it exists
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Create the destination
        const destination = await Destination.create(req.body);

        // Update the trip with the new destination
        trip.destination = destination._id;
        await trip.save();

        res.status(201).json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Index Route: Get all destinations for a trip
router.get("/:tripId/destinations", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate("destination");

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers
        if (!trip.travellers.some(traveller => traveller.user.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "You are not authorized to view destinations for this trip" });
        }

        res.status(200).json(trip.destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Show Route: Show a specific destination
router.get("/:tripId/destinations/:destinationId", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers
        if (!trip.travellers.some(traveller => traveller.user.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "You are not authorized to view this destination" });
        }

        const destination = await Destination.findById(req.params.destinationId);

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.status(200).json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Route: Update a destination
router.put("/:tripId/destinations/:destinationId", verifyToken, canEditTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        const updatedDestination = await Destination.findByIdAndUpdate(
            req.params.destinationId,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedDestination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Route: Delete a destination
router.delete("/:tripId/destinations/:destinationId", verifyToken, canEditTrip, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId);

        if (!deletedDestination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        // Remove the destination reference from the trip
        trip.destination = null;
        await trip.save();

        res.status(200).json(deletedDestination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a route to get recommendations for a destination
router.get('/:tripId/destinations/:destinationId/recommendations', verifyToken, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        // Get the location coordinates by geocoding the destination location
        const geocodeResult = await googlePlaces.geocodeAddress(destination.location);

        if (geocodeResult.status !== 'OK' || geocodeResult.results.length === 0) {
            return res.status(400).json({
                message: "Could not geocode destination location",
                status: geocodeResult.status
            });
        }

        const location = geocodeResult.results[0].geometry.location;
        const locationString = `${location.lat},${location.lng}`;

        // Get attractions, restaurants, and hotels in parallel
        const [attractions, restaurants, hotels] = await Promise.all([
            googlePlaces.getNearbyPlaces(locationString, 'tourist_attraction'),
            googlePlaces.getNearbyPlaces(locationString, 'restaurant'),
            googlePlaces.getNearbyPlaces(locationString, 'lodging')
        ]);

        res.status(200).json({
            destination: destination.location,
            coordinates: location,
            recommendations: {
                attractions: attractions.results || [],
                restaurants: restaurants.results || [],
                hotels: hotels.results || []
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// Below is a code graveyard for all my reverted changed. There were route conflicts that I tried to fix but still wasn't having luck. I then commented it all out, found a previous version of Jad's working destination routes, and added it above. Tested and working! Leaving the code below because I'm nervous about losing it.

// const express = require("express");
// // const router = express.Router();
// // Updating to merge routes so that we can access params
// const router = express.Router({ mergeParams: true });

// const verifyToken = require("../middleware/verify-token.js");
// const Destination = require("../models/destination");
// const Trip = require("../models/trip");
// const mongoose = require("mongoose");

// // New Route: Form for creating a new destination
// // router.get("/trips/:tripId/destinations", verifyToken, async (req, res) => {
// //     try {
// //         const trip = await Trip.findById(req.params.tripId);
// //         if (!trip) {
// //             return res.status(404).json({ message: "Trip not found" });
// //         }

// //         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
// //             return res.status(403).json({ message: "Unauthorized to access this trip" });
// //         }

// //         res.status(200).json({ message: "New Destination Form" });
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // });

// // Create a Destination:
// router.post("/", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);
//         console.log(req.params.tripId)

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to add destinations to this trip" });
//         }

//         const destination = await Destination.create(req.body);

//         trip.destination.push(destination._id);
//         await trip.save();

//         res.status(201).json(destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Index Route: Get all destinations for a trip
// router.get("/", verifyToken, async (req, res) => {
//     console.log("🔥 GET /destinations route hit");
//     console.log("tripId:", req.params.tripId);
//     try {
//         const trip = await Trip.findById(req.params.tripId)
//             .populate("destination travellers");

//         if (!trip) {
//             // Updated to a more clear error message.
//             return res.status(404).json({ message: "Looks like you haven't added any destinations yet!" });
//         }

//         if (!trip.travellers.some(traveller => traveller._id.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to view destinations for this trip" });
//         }

//         res.status(200).json(trip.destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Show Route: Show a specific destination
// router.get("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to view this destination" });
//         }

//         const destination = await Destination.findById(req.params.destinationId);

//         if (!destination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         res.status(200).json(destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Update Route: Update a destination
// router.put("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to update this destination" });
//         }

//         const updatedDestination = await Destination.findByIdAndUpdate(
//             req.params.destinationId,
//             req.body,
//             { new: true }
//         );

//         if (!updatedDestination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         res.status(200).json(updatedDestination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Delete Route: Delete a destination
// router.delete("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to delete this destination" });
//         }

//         const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId);

//         if (!deletedDestination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         const destinationIndex = trip.destination.findIndex(destId => destId.toString() === req.params.destinationId);
//         if (destinationIndex > -1) {
//             trip.destination.splice(destinationIndex, 1);
//         }
//         await trip.save();

//         res.status(200).json(deletedDestination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;