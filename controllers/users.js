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
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        };

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    };
});

module.exports = router;
