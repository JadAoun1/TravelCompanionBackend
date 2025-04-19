// middleware/verify-token.js

// We'll need to import jwt to use the verify method
const jwt = require("jsonwebtoken");
const Trip = require("../models/trip");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign decoded payload to req.user
    req.user = decoded.payload;

    // Call next() to invoke the next middleware function
    next();
  } catch (err) {
    // If any errors, send back a 401 status and an 'Invalid token.' error message
    res.status(401).json({ err: "Invalid token." });
  }
}

// Add middleware to check if a user can edit a particular trip
const canEditTrip = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user._id; // Get user ID from the authenticated user

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    // Find if the user is in the travellers array and has Editor or Owner role
    const userInTrip = trip.travellers.find((traveller) => {
      return (
        traveller.user.toString() === userId.toString() &&
        ["Owner", "Editor"].includes(traveller.role)
      );
    });

    if (!userInTrip) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this trip." });
    }

    req.userRole = userInTrip.role; // Store the user's role in the request object for later use this will be necessary for the trip controller to know if the user is an owner or editor
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Same logic as canEditTrip but for viewing trips, difference is that user role is not checked so any user in the travellers array can view the trip
const canViewTrip = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    const userInTrip = trip.travellers.find((traveller) => {
      return traveller.user.toString() === userId.toString(); // User role is not checked here so any user in the travellers array can view the trip
    });

    if (!userInTrip) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this trip." });
    }
    // req.userRole = userInTrip.role; This line is not necessary for viewing trips because we don't need to check the role for viewing
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Not Needed anymore since it is not being used across the app and only needs to be used in the trip controller to delete trip. 
// Delete middleware for owner only
// Same logic as before but changing userinTrip to only check for owner role
// const canDeleteTrip = async (req, res, next) => {
//     try {
//         const tripId = req.params.tripId;
//         const userId = req.user._id;

//         const trip = await Trip.findById(tripId);
//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found." });
//         }

//         const userInTrip = trip.travellers.find((traveller) => {
//             return (
//                 traveller.user.toString() === userId.toString() &&
//                 traveller.role === "Owner"
//             );
//         });

//         if (!userInTrip) {
//             return res
//                 .status(403)
//                 .json({ message: "You do not have permission to delete this trip." });
//         }
//         next();
//     } catch {
//         res.status(500).json({ error: error.message });
//     }
// }

// We'll need to export both middleware functions
module.exports = { verifyToken, canEditTrip, canViewTrip};
