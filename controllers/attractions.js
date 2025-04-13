const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token.js');
const Destination = require('../models/destination.js');
const Trip = require('../models/trip');

// Helper function to validate trip access
async function validateTripAccess(req, res) {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
        return { error: true, status: 404, message: "Trip not found" };
    }

    // Check if user is authorized using ObjectId.equals()
    if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
        return { error: true, status: 403, message: "Unauthorized to access this trip" };
    }

    return { error: false, trip };
}

// New Route: Form for creating a new attraction
router.get('/users/:userId/trips/:tripId/destinations/:destinationId/attractions/new', verifyToken, async (req, res) => {
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        res.status(200).json({ message: "New Attraction Form" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Index Route: Get all attractions for a destination
router.get('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, async (req, res) => {
router.get('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, async (req, res) => {
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

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
router.get('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

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
router.post('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, async (req, res) => {
router.post('/trips/:tripId/destinations/:destinationId/attractions', verifyToken, async (req, res) => {
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        destination.attractions.push(req.body);
        await destination.save();
        res.status(201).json(destination.attractions[destination.attractions.length - 1]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Route: Update an attraction
router.put('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
router.put('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

        const destination = await Destination.findById(req.params.destinationId);
        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        const attraction = destination.attractions.id(req.params.attractionId);
        if (!attraction) {
            return res.status(404).json({ message: "Attraction not found" });
        }
        attraction.set(req.body);
        await destination.save();
        res.status(200).json(attraction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Route: Delete an attraction
router.delete('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
router.delete('/trips/:tripId/destinations/:destinationId/attractions/:attractionId', verifyToken, async (req, res) => {
    
    try {
        // Validate trip access
        const tripValidation = await validateTripAccess(req, res);
        if (tripValidation.error) {
            return res.status(tripValidation.status).json({ message: tripValidation.message });
        }

        
        const destination = await Destination.findById(req.params.destinationId);

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }
        
        const attraction = destination.attractions.id(req.params.attractionId);
        console.log(attraction)
        
        if (!attraction) {
            return res.status(404).json({ message: "Attraction not found" });
        }
        
        attraction.id(req.params.attractionId).remove();
        
        await destination.save();
        
        res.status(200).json({ message: "Attraction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 