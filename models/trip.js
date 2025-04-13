// models/trip.js

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        // changing from "name" to "title"
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        // Reference destinationSchema in destination.js
        // Updated to make sure multiple destinations can be created since without the array [], a newly created destination was overriding any previously added destination 
        destination: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
        // Reference userSchema in user.js
        // Converting travellers to an array to allow multiple users to be added to a trip
        // travellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        // Converting travellers above to a new structure to allow for user roles. The goal is to allow multiple users to be assigned to one trip, and users will each have an assigned role.
        travellers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                role: {
                    type: String,
                    // Viewer, in theory, if the trip is made public (verus private) and does not have permissions to make any edits.
                    enum: ['Owner', 'Editor', 'Viewer'],
                    // Default ensures that the user doesn't have permissions to make any edits.
                    default: 'Viewer',
                }
            }
        ]
    },

    { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
