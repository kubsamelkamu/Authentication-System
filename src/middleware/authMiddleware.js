const jwt = require('jsonwebtoken');
const User = require("../models/User");

exports.checkVerified = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user.verified) {
        return res.status(403).json({ message: "Please verify your email to access this resource." });
    }
    next();
};


const authenticateToken = (req, res, next) => {

    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
