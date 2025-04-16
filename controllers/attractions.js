const express = require('express');
const router = express.Router();
const { verifyToken, canEditTrip } = require('../middleware/verify-token.js');
const Destination = require('../models/destination.js');
const axios = require('axios');

// Index Route: Get all attractions for a destination
router.get('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, async (req, res) => {
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
router.get('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
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

        // Modeled after destination controller
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

// Update Route: Update an attraction
router.put('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, canEditTrip, async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        };
        const attraction = destination.attractions.id(req.params.attractionId);
        if (!attraction) {
            return res.status(404).json({ message: "Attraction not found" });
        };

        // This method updates data in an embedded subdocument (compare to destinations update route that uses a different method better for updating on a "top level document").
        // This method modifies the updated fields directly on the object.
        // A benefit to this method is that it automatically prevents overwriting fields that weren't updated in the request (also compare to the way we did this in the destination route).
        if (req.body.name) attraction.name = req.body.name;
        if (req.body.location) attraction.location = req.body.location;
        if (req.body.address) attraction.address = req.body.address;
        if (req.body.description) attraction.description = req.body.description;
        if (req.body.visitDate) attraction.visitDate = req.body.visitDate;
        if (req.body.cost !== undefined) attraction.cost = req.body.cost;
        if (req.body.notes) attraction.notes = req.body.notes;
        if (req.body.isVisited !== undefined) attraction.isVisited = req.body.isVisited;
        if (req.body.photos) attraction.photos = req.body.photos;

        attraction.set(req.body);

        await destination.save();

        res.status(200).json(attraction);
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