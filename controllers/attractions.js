const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verify-token.js');
const { canViewTrip, canEditTrip } = require('../middleware/user-permissions.js');
const Destination = require('../models/destination.js');
const axios = require('axios');

// Index Route: Get all attractions for a destination
router.get('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, canViewTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        res.status(200).json(destination.attractions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Show Route: Get a specific attraction
router.get('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, canViewTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        const attraction = destination.attractions.id(req.params.attractionId);
        if (!attraction) {
            return res.status(404).json({ message: "Attraction not found" });
        }
        res.status(200).json(attraction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Route: Create a new attraction
router.post('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, canEditTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        const attractionData = {
            name: req.body.name,
            location: {
                lat: req.body.location.lat,
                lng: req.body.location.lng,
            },
            address: req.body.address,
            placeId: req.body.placeId,
            notes: req.body.notes,
            visitDate: req.body.visitDate || null,
        };

        destination.attractions.push(attractionData);

        await destination.save();

        res.status(201).json(destination.attractions[destination.attractions.length - 1]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Route: Delete an attraction
router.delete('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, canEditTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        const attraction = destination.attractions.id(req.params.attractionId);
        if (!attraction) {
            return res.status(404).json({ message: "Attraction not found" });
        }
        destination.attractions.pull(req.params.attractionId);
        await destination.save();
        res.status(200).json({ message: "Attraction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 


// --------------------------------------------------------------GRAVEYARD--------------------------------------------------------------

// PHASE II: CURRENTLY NOT USABLE VIA BUTTON ON FRONTEND

// Update Route: Update an attraction
// router.put('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, canEditTrip, async (req, res) => {
//     try {
//         const destination = await Destination.findById(req.params.destinationId);
//         if (!destination) {
//             return res.status(404).json({ message: "Destination not found" });
//         };
//         const attraction = destination.attractions.id(req.params.attractionId);
//         if (!attraction) {
//             return res.status(404).json({ message: "Attraction not found" });
//         };

//         if (req.body.name) attraction.name = req.body.name;
//         if (req.body.location) attraction.location = req.body.location;
//         if (req.body.address) attraction.address = req.body.address;
//         if (req.body.photos) attraction.photos = req.body.photos;
//         if (req.body.notes) attraction.notes = req.body.notes;
//         if (req.body.visitDate) attraction.visitDate = req.body.visitDate;

//         attraction.set(req.body);

//         await destination.save();

//         res.status(200).json(attraction);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });