const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
    const user = req.user;
    res.status(200).json({ message: 'User profile', user });
});

module.exports = router;
