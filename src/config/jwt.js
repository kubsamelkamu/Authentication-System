const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRY,
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
