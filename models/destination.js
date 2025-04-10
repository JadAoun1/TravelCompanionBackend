// models/destination.js
const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    visitDate: {
        type: Date,
    },
    cost: {
        type: Number,
    },
    notes: {
        type: String,
    },
    isVisited: {
        type: Boolean,
        default: false,
    }
});

const destinationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    accommodations: {
        type: String,
    },
    // Properly embed attractionsSchema as a subdocument array
    attractions: [attractionSchema],
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;