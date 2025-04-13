const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Get nearby places (hotels, restaurants, attractions)
async function getNearbyPlaces(location, type, radius = 5000) {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching nearby ${type}:`, error.message);
        throw error;
    }
}

// Get place details
async function getPlaceDetails(placeId) {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,photos,formatted_phone_number,opening_hours,website,price_level,reviews&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching place details:', error.message);
        throw error;
    }
}

// Geocode an address to get coordinates
async function geocodeAddress(address) {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error geocoding address:', error.message);
        throw error;
    }
}

// Test the Google API
async function testGoogleApi() {
    try {
        const result = await geocodeAddress('New York');
        return {
            success: result.status === 'OK',
            message: result.status === 'OK' ? 'Google API is working correctly!' : 'Google API returned an error',
            data: result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to connect to Google API',
            error: error.message
        };
    }
}

module.exports = {
    getNearbyPlaces,
    getPlaceDetails,
    geocodeAddress,
    testGoogleApi
}; 