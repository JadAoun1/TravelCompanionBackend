// middleware/verify-token.js

// We'll need to import jwt to use the verify method
const jwt = require('jsonwebtoken');
const Trip = require("../models/trip");

function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Assign decoded payload to req.user
        req.user = decoded.payload;

        // Call next() to invoke the next middleware function
        next();
    } catch (err) {
        // If any errors, send back a 401 status and an 'Invalid token.' error message
        res.status(401).json({ err: 'Invalid token.' });
    };
};

// Add middleware to check if a user can edit a particular trip
const canEditTrip = async (req, res, next) => {
    try {
        const tripId = req.params.tripId;
        const userId = req.params.userId;

        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found.' });
        };
        
        const userInTrip = trip.travellers.find((user) => {
            // Check if each user explicitly equals the userId and has either the role of an owner or an editor. 
            // Access the user property of each element of the travellers array within the trip schema.
            return user.travellers.toString() === userId.toString() && ['Owner', 'Editor'].includes(user.role);
        });

        if (!userInTrip) {
            return res.status(403).json({ message: 'You do not have correct permissions to edit this trip.' });
        };

        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    };
};

// We'll need to export this function to use it in our controller files
module.exports = verifyToken;
