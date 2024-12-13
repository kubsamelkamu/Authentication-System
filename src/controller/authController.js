const User = require('../models/User');
const Token = require('../models/Token');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await User.create({
            username,
            email,
            password,
            role: role || 'user', 
        });

        res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, username: newUser.username, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const newToken = new Token({ userId: user._id, token: refreshToken });
        await newToken.save();

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const storedToken = await Token.findOne({ token: refreshToken });
        if (!storedToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateAccessToken({ id: decoded.id });

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired refresh token', error: error.message });
    }
};


exports.logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }


        await Token.findOneAndDelete({ token: refreshToken });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
