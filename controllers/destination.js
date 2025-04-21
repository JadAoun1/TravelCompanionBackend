const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verify-token.js");
const { canViewTrip, canEditTrip } = require('../middleware/user-permissions.js');
const Destination = require("../models/destination");
const Trip = require("../models/trip");

// Index Route: Get all destinations for a trip
router.get("/:tripId/destinations", verifyToken, canViewTrip, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate("destination");

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        res.status(200).json(trip.destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Show Route: Show a specific destination
router.get("/:tripId/destinations/:destinationId", verifyToken, canViewTrip, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
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

// Create a Destination:
router.post("/:tripId/destinations", verifyToken, canEditTrip, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        };

        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        const destinationData = {
            name: req.body.name,
            location: {
                lat: req.body.location.lat,
                lng: req.body.location.lng,
            },
            address: req.body.address,
            placeId: req.body.placeId,
            startDate: req.body.startDate || null,
            endDate: req.body.endDate || null,
            attractions: [],
        }

        const destination = await Destination.create(destinationData);

        if (!trip.destination) {
            trip.destination = [];
        };

        trip.destination.push(destination._id);
        await trip.save();

        res.status(201).json(destination);
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

        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId);

        if (!deletedDestination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        trip.destination = trip.destination.filter(destinationId => destinationId.toString() !== req.params.destinationId);
        
        await trip.save();

        res.status(200).json(deletedDestination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// --------------------------------------------------------------GRAVEYARD--------------------------------------------------------------

// PHASE II: CURRENTLY NOT USABLE VIA BUTTON ON FRONTEND

// Update Route: Update a destination
// router.put("/:tripId/destinations/:destinationId", verifyToken, canEditTrip, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);
//         const destination = await Destination.findById(req.params.destinationId);

//         if (!destination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         const userIsTraveller = trip.travellers.some(traveller =>
//             traveller.user && traveller.user.toString() === req.user._id.toString()
//         );

//         if (!userIsTraveller) {
//             return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
//         };

//         const updateData = {
//             name: req.body.name,
//             location: req.body.location,
//             placeId: req.body.placeId,
//             startDate: req.body.startDate,
//             endDate: req.body.endDate,
//         };

//         // If some fields aren't updated in this put request, the original data will be overridden with "undefined" (not what we want). So here we remove any undefined fields so the original data remains unchanged.
//         Object.keys(updateData).forEach(key =>
//             updateData[key] === undefined && delete updateData[key]
//         );

//         const updatedDestination = await Destination.findByIdAndUpdate(
//             req.params.destinationId,
//             updateData,
//             { new: true }
//         );

//         res.status(200).json(updatedDestination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });