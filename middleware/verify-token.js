// middleware/verify-token.js

const jwt = require("jsonwebtoken");
const Trip = require("../models/trip");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.payload;

    next();
  } catch (err) {
    res.status(401).json({ err: "Invalid token." });
  }
}

const canEditTrip = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user._id; 

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

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

    req.userRole = userInTrip.role; 
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const canViewTrip = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    const userInTrip = trip.travellers.find((traveller) => {
      return traveller.user.toString() === userId.toString(); 
    });

    if (!userInTrip) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this trip." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { verifyToken, canEditTrip, canViewTrip};
