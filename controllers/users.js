// controllers/users.js

// --------------------------------------------------------------GRAVEYARD--------------------------------------------------------------

const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const { verifyToken } = require('../middleware/verify-token');

// Index Route: Show all users
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, "username");

        res.json(users);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// Show route: Show details of one user
router.get('/:userId', verifyToken, async (req, res) => {
    try {
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

// Update route: Update a user
router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(403).json({ message: 'User not found.' });
        };

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

// Delete route: Delete a user
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(403).json({ message: 'User not found.' });
        };

        if (req.user._id !== req.params.userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this user.' });
        };

        const deletedUser = await User.findByIdAndDelete(req.params.userId);

        res.status(200).json({ deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

module.exports = router;