// controllers/places.js

const express = require('express');
const router = express.Router();
// Requiring axios as a way to make an HTTP request to an external API (versus interacting with my own database in MongoDB via Mongoose)
const axios = require('axios');
const verifyToken = require('../middleware/verify-token.js');

// Environment variables for Google API key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

// Search for cities/countries and make sure autocomplete is used
router.get('/autocomplete', verifyToken, async (req, res) => {
    try {
        const { input } = req.query;
        const response = await axios.get(`${PLACES_API_BASE}/autocomplete/json`, {
            params: {
                input,
                // This was suggested, but I'm leaving it out for broader search results so it's not limited to 'cities.'
                // types: '(cities)',
                key: GOOGLE_API_KEY
            }
        });

        res.json(response.data);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching place suggestions.' });
    };
});

module.exports = router;