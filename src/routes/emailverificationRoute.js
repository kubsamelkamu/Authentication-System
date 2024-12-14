const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    try {
      
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.verified) return res.status(400).json({ message: "Email already verified." });

        user.verified = true;
        user.verificationToken = null; 
        await user.save();

        res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Invalid or expired token." });
    }
});

module.exports = router;
