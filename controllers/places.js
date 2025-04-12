// controllers/places.js

// An API proxy is a server that sits between an application and a backend API, acting as a go-between for requests and responses.

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

// Get more details from the API about a specific place based on the place_id
router.get('/:placeId', verifyToken, async (req, res) => {
    try {
        const { placeId } = req.params;
        const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
            params: {
                place_id: placeId,
                // Fields to return: name (name), geometry (lng, lat), formatted_address (readable address)
                fields: 'name,geometry,formatted_address',
                key: GOOGLE_API_KEY,
            }
        });

        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching place details.' });
    };
});


module.exports = router;