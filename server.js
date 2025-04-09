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



// ----------------------------------------------------------------- Server ------------------------------------------------------------------

app.listen(3000, () => {
    console.log('Running on Port 3000.');
});
