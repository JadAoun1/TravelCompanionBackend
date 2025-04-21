// models/trip.js

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        destination: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
        travellers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                role: {
                    type: String,
                    enum: ['Owner', 'Editor', 'Viewer'],
                    default: 'Viewer',
                }
            }
        ]
    },

    { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
