// models/trip.js

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // Reference destinationSchema in destination.js
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    // Reference userSchema in user.js
    travellers: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;