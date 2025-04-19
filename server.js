// server.js

// ------------------------------------------------------------------ npm ------------------------------------------------------------------

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

// ------------------------------------------------------------- Import Routers -------------------------------------------------------------

const authRouter = require('./controllers/auth.js');
const tripRouter = require('./controllers/trip.js');
const userRouter = require('./controllers/users.js');
const destinationRouter = require('./controllers/destination.js');
const attractionsRouter = require('./controllers/attractions.js');
const placesRouter = require('./controllers/places.js');

// ----------------------------------------------------------- Connect to MongoDB ------------------------------------------------------------

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// --------------------------------------------------------------- Middleware ----------------------------------------------------------------

// --- Recommended Detailed CORS Configuration ---
const allowedOrigins = [
    'https://triplabapp.netlify.app',
    'http://localhost:5173',
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Explicitly allow methods including OPTIONS
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Allow common headers + Authorization
    credentials: true, // Allow credentials (cookies/auth headers)
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Apply detailed CORS options

// --- Other Middleware ---
app.use(express.json()); // Parses incoming JSON requests (Essential for POST/PUT)
app.use(logger('dev')); // Morgan logger

// ----------------------------------------------------------------- Routes ------------------------------------------------------------------
// Routes AFTER middleware

app.use('/auth', authRouter);
app.use('/trips', tripRouter);
app.use('/users', userRouter);
app.use('/trips', destinationRouter);
app.use('/', attractionsRouter); // Consider namespacing? /attractions
app.use('/api/places', placesRouter);
app.get('/', (req, res) => { // Basic test route
  res.send('TripLab API Backend is running!');
});


// ----------------------------------------------------------------- Server ------------------------------------------------------------------

// CRITICAL FIX FOR HEROKU: Use process.env.PORT
const PORT = process.env.PORT || 3000; // Use Heroku's port or 3000 locally

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}.`); // Log the correct port
});