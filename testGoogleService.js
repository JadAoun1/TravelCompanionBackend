require('dotenv').config();
const googlePlaces = require('./services/googlePlaces');

async function runTests() {
    console.log('===== Testing Google Places Service =====');

    try {
        // Test the API
        console.log('\n1. Testing Google API connectivity:');
        const apiTest = await googlePlaces.testGoogleApi();
        console.log('API Test Result:', apiTest.success ? 'Success' : 'Failed');
        console.log('Message:', apiTest.message);

        if (!apiTest.success) {
            console.error('API test failed. Stopping tests.');
            return;
        }

        // Test geocoding
        console.log('\n2. Testing Geocoding:');
        const geocodeResult = await googlePlaces.geocodeAddress('Paris, France');
        console.log('Geocoding Success:', geocodeResult.status === 'OK');
        if (geocodeResult.status === 'OK') {
            const location = geocodeResult.results[0].geometry.location;
            console.log('Geocoded Location:', geocodeResult.results[0].formatted_address);
            console.log('Coordinates:', location);

            // Test nearby places with the geocoded location
            const locationString = `${location.lat},${location.lng}`;

            // Test attractions
            console.log('\n3. Testing Nearby Attractions:');
            const attractions = await googlePlaces.getNearbyPlaces(locationString, 'tourist_attraction');
            console.log('Found Attractions:', attractions.results ? attractions.results.length : 0);
            if (attractions.results && attractions.results.length > 0) {
                console.log('First Attraction:', attractions.results[0].name);
            }

            // Test restaurants
            console.log('\n4. Testing Nearby Restaurants:');
            const restaurants = await googlePlaces.getNearbyPlaces(locationString, 'restaurant');
            console.log('Found Restaurants:', restaurants.results ? restaurants.results.length : 0);
            if (restaurants.results && restaurants.results.length > 0) {
                console.log('First Restaurant:', restaurants.results[0].name);
            }

            // Test hotels
            console.log('\n5. Testing Nearby Hotels:');
            const hotels = await googlePlaces.getNearbyPlaces(locationString, 'lodging');
            console.log('Found Hotels:', hotels.results ? hotels.results.length : 0);
            if (hotels.results && hotels.results.length > 0) {
                console.log('First Hotel:', hotels.results[0].name);
            }

            // Test place details if we have results
            if (attractions.results && attractions.results.length > 0) {
                console.log('\n6. Testing Place Details:');
                const placeId = attractions.results[0].place_id;
                const placeDetails = await googlePlaces.getPlaceDetails(placeId);
                console.log('Place Details Success:', placeDetails.status === 'OK');
                if (placeDetails.status === 'OK') {
                    console.log('Place Name:', placeDetails.result.name);
                    console.log('Rating:', placeDetails.result.rating);
                    console.log('Has Photos:', placeDetails.result.photos ? 'Yes' : 'No');
                }
            }
        }

        console.log('\n===== All Tests Completed Successfully =====');
    } catch (error) {
        console.error('Error running tests:', error.message);
    }
}

runTests(); 