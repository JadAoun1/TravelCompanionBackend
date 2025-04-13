const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token.js");
const Destination = require("../models/destination");
const Trip = require("../models/trip");


// Create a Destination:
// Updating this route to ensure data is explicitly selected from only specific req.body field which protects against data being added unnecessarily (whether malicious or accidental)
router.post("/:tripId/destinations", verifyToken, async (req, res) => {
    try {
        // First find the trip to verify ownership
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        };

        // Updated check if user is an authorized traveller so it supports complex traveller objects (ie more than just an ID). Converting IDs to strings means they can be compared accurately to ensure a traveller is authorized (this is because I was started to get errors about a user not being authorized, even though I knew they were...).
        const userIsTraveller = trip.travellers.some(traveller => 
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        // Create the destination using Google places data
        // Testing this now by entering name and lat/lng
        const destinationData = {
            name: req.body.name,
            location: {
                lat: req.body.location.lat,
                lng: req.body.location.lng,
            },
            address: req.body.address,
            placeId: req.body.placeId,
            startDate: req.body.startDate || null,
            endDate: req.body.endDate || null,
            accommodations: req.body.accommodations || '',
            // Start as an empty array so we can add to it later
            attractions: [],
        }

        // Now pass through destinationData instead of req.body
        const destination = await Destination.create(destinationData);

        // Update the trip with the new destination; updated again to add a new destination to the destinations array because each new destination created was overriding the previously created destination
        trip.destination.push(destination._id);
        await trip.save();

        res.status(201).json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Index Route: Get all destinations for a trip
router.get("/:tripId/destinations", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate("destination");

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers (with updates mirroring the create route)
        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        res.status(200).json(trip.destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Show Route: Show a specific destination
router.get("/:tripId/destinations/:destinationId", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers (with updates mirroring the create route)
        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        const destination = await Destination.findById(req.params.destinationId);

        if (!destination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.status(200).json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Route: Update a destination
router.put("/:tripId/destinations/:destinationId", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers (with updates mirroring the create route)
        const userIsTraveller = trip.travellers.some(traveller =>
            traveller.user && traveller.user.toString() === req.user._id.toString()
        );

        if (!userIsTraveller) {
            return res.status(403).json({ message: "You are not authorized to add destinations to this trip" })
        };

        // Here we explicitly define which fields are actually able to be updated instead of leaving it all up to the user. 
        const updateData = {
            name: req.body.name,
            location: req.body.location,
            placeId: req.body.placeId,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            accommodations: req.body.accommodations,
        };

        // If some fields aren't updated in this put request, the original data will be overridden with "undefined" (not what we want). So here we remove any undefinited fields so the original data remains unchanged.
        // Object.key(updateData) => returns an array of all keys of updateData (name, location, etc.)
        // For each key, if the key is undefined, delete that key from updateData (so that when updateData is used to update updatedDestination, there are no undefined keys passed through to the new object).
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const updatedDestination = await Destination.findByIdAndUpdate(
            req.params.destinationId,
            // Now pass through updateData instead of req.body
            updateData,
            { new: true }
        );

        if (!updatedDestination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.status(200).json(updatedDestination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Route: Delete a destination
router.delete("/:tripId/destinations/:destinationId", verifyToken, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check if user is one of the travellers
        if (!trip.travellers.includes(req.user._id)) {
            return res.status(403).json({ message: "You are not authorized to delete this destination" });
        }

        const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId);

        if (!deletedDestination) {
            return res.status(404).json({ message: "Destination not found" });
        }

        // Remove the destination reference from the trip
        trip.destination = null;
        await trip.save();

        res.status(200).json(deletedDestination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// Below is a code graveyard for all my reverted changed. There were route conflicts that I tried to fix but still wasn't having luck. I then commented it all out, found a previous version of Jad's working destination routes, and added it above. Tested and working! Leaving the code below because I'm nervous about losing it.

// const express = require("express");
// // const router = express.Router();
// // Updating to merge routes so that we can access params
// const router = express.Router({ mergeParams: true });

// const verifyToken = require("../middleware/verify-token.js");
// const Destination = require("../models/destination");
// const Trip = require("../models/trip");
// const mongoose = require("mongoose");

// // New Route: Form for creating a new destination
// // router.get("/trips/:tripId/destinations", verifyToken, async (req, res) => {
// //     try {
// //         const trip = await Trip.findById(req.params.tripId);
// //         if (!trip) {
// //             return res.status(404).json({ message: "Trip not found" });
// //         }

// //         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
// //             return res.status(403).json({ message: "Unauthorized to access this trip" });
// //         }

// //         res.status(200).json({ message: "New Destination Form" });
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // });

// // Create a Destination:
// router.post("/", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);
//         console.log(req.params.tripId)

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to add destinations to this trip" });
//         }

//         const destination = await Destination.create(req.body);

//         trip.destination.push(destination._id);
//         await trip.save();

//         res.status(201).json(destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Index Route: Get all destinations for a trip
// router.get("/", verifyToken, async (req, res) => {
//     console.log("🔥 GET /destinations route hit");
//     console.log("tripId:", req.params.tripId);
//     try {
//         const trip = await Trip.findById(req.params.tripId)
//             .populate("destination travellers");

//         if (!trip) {
//             // Updated to a more clear error message.
//             return res.status(404).json({ message: "Looks like you haven't added any destinations yet!" });
//         }

//         if (!trip.travellers.some(traveller => traveller._id.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to view destinations for this trip" });
//         }

//         res.status(200).json(trip.destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Show Route: Show a specific destination
// router.get("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to view this destination" });
//         }

//         const destination = await Destination.findById(req.params.destinationId);

//         if (!destination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         res.status(200).json(destination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Update Route: Update a destination
// router.put("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to update this destination" });
//         }

//         const updatedDestination = await Destination.findByIdAndUpdate(
//             req.params.destinationId,
//             req.body,
//             { new: true }
//         );

//         if (!updatedDestination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         res.status(200).json(updatedDestination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Delete Route: Delete a destination
// router.delete("/:destinationId", verifyToken, async (req, res) => {
//     try {
//         const trip = await Trip.findById(req.params.tripId);

//         if (!trip) {
//             return res.status(404).json({ message: "Trip not found" });
//         }

//         if (!trip.travellers.some(travellerId => travellerId.equals(req.user._id))) {
//             return res.status(403).json({ message: "You are not authorized to delete this destination" });
//         }

//         const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId);

//         if (!deletedDestination) {
//             return res.status(404).json({ message: "Destination not found" });
//         }

//         const destinationIndex = trip.destination.findIndex(destId => destId.toString() === req.params.destinationId);
//         if (destinationIndex > -1) {
//             trip.destination.splice(destinationIndex, 1);
//         }
//         await trip.save();

//         res.status(200).json(deletedDestination);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;