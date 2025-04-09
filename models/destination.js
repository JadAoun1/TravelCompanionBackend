// models/destination.js

const attractionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
});

const destinationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    // Embed attractionsSchema
    attractions: [],
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;