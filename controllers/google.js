const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verify-token.js');
const {
    searchPlaces,
    getPlaceDetails,
    getNearbyPlaces,
    geocodeAddress
} = require('../middleware/googleApi.js');

// Search for places
router.get('/search', verifyToken, async (req, res) => {
    try {
        const { query, location, radius, type } = req.query;

        if (!query || !location) {
            return res.status(400).json({ message: "Query and location are required" });
        }

        const results = await searchPlaces(query, location, radius, type);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get place details
router.get('/details/:placeId', verifyToken, async (req, res) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({ message: "Place ID is required" });
        }

        const details = await getPlaceDetails(placeId);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get nearby places
router.get('/nearby', verifyToken, async (req, res) => {
    try {
        const { location, radius, type } = req.query;

        if (!location) {
            return res.status(400).json({ message: "Location is required" });
        }

        const places = await getNearbyPlaces(location, radius, type);
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Geocode an address
router.get('/geocode', verifyToken, async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }

        const result = await geocodeAddress(address);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to test if Google API key is working
router.get('/test', async (req, res) => {
    try {
        // Try to geocode a simple address to test API key
        const result = await geocodeAddress('New York');

        if (result && result.results && result.results.length > 0) {
            res.status(200).json({
                message: "Google API is working correctly!",
                apiKeyStatus: "Valid",
                testResult: {
                    query: "New York",
                    foundResults: result.results.length
                }
            });
        } else {
            res.status(200).json({
                message: "Google API returned an empty result. API key might be valid but other issues exist.",
                apiKeyStatus: "Potentially valid but check response",
                testResult: result
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Google API test failed",
            apiKeyStatus: "Invalid or has issues",
            error: error.message
        });
    }
});

module.exports = router; 