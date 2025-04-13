const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

const testGoogleGeocoding = async () => {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        console.log('Using Google API Key:', apiKey ? 'Key exists' : 'Key missing');

        const address = 'New York, NY';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

        console.log('Making request to Google Maps Geocoding API...');
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            console.log('Google API is working correctly!');
            console.log('Results found:', response.data.results.length);
            console.log('First result:', response.data.results[0].formatted_address);
            console.log('Location:', response.data.results[0].geometry.location);

            return true;
        } else {
            console.error('API returned status:', response.data.status);
            console.error('Error message:', response.data.error_message);

            return false;
        }
    } catch (error) {
        console.error('Error testing Google API:', error.message);
        console.error('Full error:', error);

        return false;
    }
};

const testNearbySearch = async () => {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        const location = '40.7128,-74.0060'; // New York coordinates
        const radius = 1000; // 1km
        const type = 'restaurant';

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;

        console.log('\nMaking request to Google Places Nearby Search API...');
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            console.log('Google Places API is working correctly!');
            console.log('Results found:', response.data.results.length);
            console.log('First restaurant:', response.data.results[0].name);

            return true;
        } else {
            console.error('API returned status:', response.data.status);
            console.error('Error message:', response.data.error_message);

            return false;
        }
    } catch (error) {
        console.error('Error testing Google Places API:', error.message);

        return false;
    }
};

// Run both tests
const runTests = async () => {
    console.log('========== GOOGLE API TEST ==========');

    const geocodingResult = await testGoogleGeocoding();
    const placesResult = await testNearbySearch();

    if (geocodingResult && placesResult) {
        console.log('\n✅ All Google API tests passed!');
    } else {
        console.log('\n❌ Some tests failed. Please check your API key and implementation.');
    }
};

runTests(); 