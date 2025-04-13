const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verify-token.js');
const axios = require('axios');

// Get hotel recommendations for a location
router.get('/hotels', verifyToken, async (req, res) => {
    try {
        const { location, radius = 5000 } = req.query;

        if (!location) {
            return res.status(400).json({ message: "Location (lat,lng) is required" });
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=lodging&key=${process.env.GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            res.status(200).json(response.data);
        } else {
            res.status(400).json({
                message: "Error fetching hotel recommendations",
                status: response.data.status,
                error: response.data.error_message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get restaurant recommendations for a location
router.get('/restaurants', verifyToken, async (req, res) => {
    try {
        const { location, radius = 5000, minprice, maxprice } = req.query;

        if (!location) {
            return res.status(400).json({ message: "Location (lat,lng) is required" });
        }

        let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=${process.env.GOOGLE_API_KEY}`;

        // Add optional price parameters if provided
        if (minprice) url += `&minprice=${minprice}`;
        if (maxprice) url += `&maxprice=${maxprice}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            res.status(200).json(response.data);
        } else {
            res.status(400).json({
                message: "Error fetching restaurant recommendations",
                status: response.data.status,
                error: response.data.error_message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attraction recommendations for a location
router.get('/attractions', verifyToken, async (req, res) => {
    try {
        const { location, radius = 5000 } = req.query;

        if (!location) {
            return res.status(400).json({ message: "Location (lat,lng) is required" });
        }

        // Get various types of attractions by making parallel requests
        const types = ['tourist_attraction', 'museum', 'amusement_park', 'park'];
        const promises = types.map(type => {
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_API_KEY}`;
            return axios.get(url);
        });

        const responses = await Promise.all(promises);

        // Combine results from all types, removing duplicates by place_id
        const allResults = {};
        responses.forEach((response, index) => {
            if (response.data.status === 'OK') {
                response.data.results.forEach(place => {
                    if (!allResults[place.place_id]) {
                        place.types = [...place.types, types[index]]; // Add the specific type we searched for
                        allResults[place.place_id] = place;
                    }
                });
            }
        });

        res.status(200).json({
            status: 'OK',
            results: Object.values(allResults)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get details for a specific place
router.get('/place/:placeId', verifyToken, async (req, res) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({ message: "Place ID is required" });
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,photos,formatted_phone_number,opening_hours,website,price_level,reviews&key=${process.env.GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            res.status(200).json(response.data);
        } else {
            res.status(400).json({
                message: "Error fetching place details",
                status: response.data.status,
                error: response.data.error_message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Geocode an address to get coordinates
router.get('/geocode', verifyToken, async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            res.status(200).json(response.data);
        } else {
            res.status(400).json({
                message: "Error geocoding address",
                status: response.data.status,
                error: response.data.error_message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint to verify Google API is working
router.get('/test', async (req, res) => {
    try {
        const address = 'New York, NY';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            res.status(200).json({
                message: "Google API is working correctly!",
                apiKeyStatus: "Valid",
                testResult: {
                    query: address,
                    foundResults: response.data.results.length,
                    firstResult: response.data.results[0].formatted_address
                }
            });
        } else {
            res.status(200).json({
                message: "Google API returned an error",
                apiKeyStatus: "Invalid or has issues",
                error: response.data.error_message,
                status: response.data.status
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