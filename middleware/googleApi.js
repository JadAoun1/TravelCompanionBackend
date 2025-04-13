const { Client } = require('@googlemaps/google-maps-services-js');
const axios = require('axios');

// Initialize Google Maps client
const client = new Client({});

// Get places based on query and location
const searchPlaces = async (query, location, radius = 5000, type = null) => {
    try {
        const params = {
            key: process.env.GOOGLE_API_KEY,
            query,
            location,
            radius,
        };

        if (type) {
            params.type = type;
        }

        const response = await client.textSearch({
            params: params
        });

        return response.data;
    } catch (error) {
        console.error('Error searching places:', error);
        throw error;
    }
};

// Get place details
const getPlaceDetails = async (placeId) => {
    try {
        const response = await client.placeDetails({
            params: {
                key: process.env.GOOGLE_API_KEY,
                place_id: placeId,
                fields: ['name', 'formatted_address', 'geometry', 'rating', 'photos', 'formatted_phone_number', 'opening_hours', 'website', 'price_level', 'reviews']
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error getting place details:', error);
        throw error;
    }
};

// Get nearby places
const getNearbyPlaces = async (location, radius = 5000, type = null) => {
    try {
        const params = {
            key: process.env.GOOGLE_API_KEY,
            location,
            radius
        };

        if (type) {
            params.type = type;
        }

        const response = await client.placesNearby({
            params: params
        });

        return response.data;
    } catch (error) {
        console.error('Error getting nearby places:', error);
        throw error;
    }
};

// Get place photo
const getPlacePhoto = async (photoReference, maxWidth = 400) => {
    try {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${process.env.GOOGLE_API_KEY}`;
        return photoUrl;
    } catch (error) {
        console.error('Error getting place photo:', error);
        throw error;
    }
};

// Geocode an address to get coordinates
const geocodeAddress = async (address) => {
    try {
        const response = await client.geocode({
            params: {
                key: process.env.GOOGLE_API_KEY,
                address
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
};

module.exports = {
    searchPlaces,
    getPlaceDetails,
    getNearbyPlaces,
    getPlacePhoto,
    geocodeAddress
}; 