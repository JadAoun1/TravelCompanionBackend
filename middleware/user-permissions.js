// middleware/user-permissions.js

const Trip = require("../models/trip");

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

module.exports = { canEditTrip, canViewTrip };
