const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const { checkVerified } = require("./middlewares/authMiddleware");

app.get("/api/private-route", authenticateToken, checkVerified, (req, res) => {
    res.json({ message: "Welcome to the private route!" });
});

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRole('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin dashboard', user: req.user });
});

module.exports = router;
