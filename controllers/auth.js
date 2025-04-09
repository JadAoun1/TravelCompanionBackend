// controllers/auth.js

// While this route will help to create a new user, which we’d typically make a users.js controller file for, we’re instead going to keep all the routes related to authentication in their own controller file - auth.js.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.js');

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
    // res.json({ message: 'Sign up route.' });
    try {
        // Make sure the username hasn't been taken
        const userInDatabase = await User.findOne({ username: req.body.username });

        if (userInDatabase) {
            // 409 indicates a conflict between client's request and current stat of the resource on the server
            return res.status(409).json({ error: 'Username is already taken.' });
        };

        // Create a new user with a hashed password (using bcrypt)
        const user = await User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, saltRounds)
        });

        // Construct the payload
        const payload = { username: user.username, _id: user._id };

        // Create the token and attach it to the payload
        const token = jwt.sign({ payload }, process.env.JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

// Sign in a user if their username exists in the database, and if the password matches. Then create and send back a token to the user.
router.post('/sign-in', async (req, res) => {
    try {
        // Look up the user in the database
        const user = await User.findOne({ username: req.body.username });
        // If the user doesn't exist, send an error message
        if (!user) {
            res.status(401).json({ error: "Invalid credentials." });
        };

        // Use bcrypt to check if password is correct
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        };

        // Construct the payload
        const payload = {username: user.username, _id: user._id };

        // Create the token and attach it to the payload
        const token = jwt.sign({ payload }, process.env.JWT_SECRET);

        // Send the token in the response
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;