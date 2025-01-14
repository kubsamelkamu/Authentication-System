const User = require('../models/User');
const Token = require('../models/Token');
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");


exports .registerUser = async (req, res) => {
    const {  name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists." });

        const newUser = new User({
            name,
            email,
            password, 
        });

        const verificationToken = jwt.sign(
            { email },
            process.env.EMAIL_PASS,
            { expiresIn: "1h" }
        );
        newUser.verificationToken = verificationToken;
        await newUser.save();

        const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
        await sendEmail(
            email,
            "Verify Your Email",
            "Please verify your email by clicking the link below.",
            `<p>Please verify your email by clicking the <a href="${verificationLink}">link</a>.</p>`
        );

        res.status(201).json({ message: "User registered. Please verify your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user." });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.status(200).json({
            message: "Login successful",
            accessToken,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
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
