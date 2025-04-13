# Travel Companion Backend

A backend application for a travel planning platform, featuring trip management, destination tracking, and Google Places API integration for travel recommendations.

## Google Places API Integration

This application integrates with Google Places API to provide travel recommendations for destinations, including:

- Nearby attractions
- Restaurant recommendations
- Hotel options

### Setup and Configuration

1. **Google API Key**: Make sure you have a valid Google API key with the following APIs enabled:

   - Places API
   - Geocoding API
   - Maps JavaScript API (for frontend integration)

2. **Environment Variables**: Add your Google API key to the `.env` file:

   ```
   GOOGLE_API_KEY=your_google_api_key
   ```

3. **Testing the API**: Run the included test scripts to verify your API key is working correctly:
   ```
   node testGoogleApi.js
   node testGoogleService.js
   ```

### Available Services

The application provides the following Google Places services through `services/googlePlaces.js`:

- **Geocoding**: Convert addresses to coordinates
- **Nearby Places**: Find attractions, restaurants, and hotels near a location
- **Place Details**: Get detailed information about a specific place

### API Endpoints

#### Destination Recommendations

Get travel recommendations for a destination:

```
GET /trips/:tripId/destinations/:destinationId/recommendations
```

This endpoint returns attractions, restaurants, and hotels near the destination location.

### Usage in Frontend

To integrate with the frontend:

1. Make API calls to the backend recommendation endpoints
2. For maps and location selection, use the Google Maps JavaScript API directly
3. For search autocomplete, use the Google Places Autocomplete widget

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Set up environment variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_API_KEY=your_google_api_key
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Access the API at `http://localhost:3000`

## API Testing

Use the included test scripts to verify functionality:

- `testGoogleApi.js`: Basic Google API connectivity test
- `testGoogleService.js`: Comprehensive Google Places services test
