// controllers/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const verifyToken = require('../middleware/verify-token');

// route to get details of all users
router.get('/', verifyToken, async (req, res) => {
    try {
        // Get a list of all users, but only return their username and _id
        const users = await User.find({}, "username");

        res.json(users);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// route to get details of a user
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        // Block the request if a user is looking for the details of another user
        if (req.user._id !== req.params.userId) {
            return res.status(403).json({ error: 'You are not authorized to view these details.' });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        };

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

// route to update a user
router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(403).json({ message: 'User not found.' });
        };

        // Check if user is authorized to update
        if (req.user._id !== req.params.userId) {
            return res.status(403).json({ error: 'You are not authorized to view these details.' });
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
