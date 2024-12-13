const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRole('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin dashboard', user: req.user });
});

module.exports = router;
