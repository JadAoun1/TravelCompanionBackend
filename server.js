
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
// const placesRouter = require('./controllers/places.js');
const googleRouter = require('./controllers/google.js');
const recommendationsRouter = require('./controllers/recommendations.js');

// ----------------------------------------------------------- Connect to MongoDB ------------------------------------------------------------

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// --------------------------------------------------------------- Middleware ----------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// ----------------------------------------------------------------- Routes ------------------------------------------------------------------

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running correctly!' });
});

app.use('/auth', authRouter);
app.use('/trips', tripRouter);
app.use('/users', userRouter);
app.use('/trips', destinationRouter);
// trying to avoid route conflicts to updating to:
// app.use('/trips/:tripId/destinations', destinationRouter);
app.use('/', attractionsRouter);
// app.use('/api/places', placesRouter);
app.use('/google', googleRouter);
app.use('/recommendations', recommendationsRouter);

// ----------------------------------------------------------------- Server ------------------------------------------------------------------

app.listen(3000, () => {
    console.log('Running on Port 3000.');
});
