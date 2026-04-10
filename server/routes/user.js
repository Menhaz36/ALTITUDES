import express from 'express';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { verifyJWT } from '../middleware/auth.middleware.js';
 
const router = express.Router();
 
const generateTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};
 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });
        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });
        const { accessToken, refreshToken } = await generateTokens(user);
        return res.status(200).json({
            Username: user.name,
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
 
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields are required' });
    try {
        const existing = await User.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already registered' });
        const user = new User({
            _id: new mongoose.Types.ObjectId().toString(),
            name,
            email,
            password,
        });
        await user.save();
        return res.status(201).json({ message: 'Registration successful. Please log in.' });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
 
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        await User.findOneAndUpdate(
            { refreshToken },
            { $unset: { refreshToken: "" } }
        );
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
 
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(401).json({ message: 'Refresh token required' });
 
    try {
        // Use ignoreExpiration: false (default) for refresh token —
        // if refresh token itself is expired, the user must log in again.
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            // Refresh token expired or invalid — clear it from DB and force re-login
            if (err.name === 'TokenExpiredError') {
                await User.findOneAndUpdate(
                    { refreshToken },
                    { $unset: { refreshToken: "" } }
                );
                return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'REFRESH_EXPIRED' });
            }
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
 
        // Verify token still matches what's stored in DB (prevents reuse after logout)
        const user = await User.findOne({ _id: decoded._id, refreshToken });
        if (!user)
            return res.status(403).json({ message: 'Invalid refresh token' });
 
        // Issue new access token (and optionally rotate refresh token)
        const accessToken = user.generateAccessToken();
 
        // Rotate refresh token for extra security
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });
 
        return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        console.error('Refresh error:', err);
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
});
 
router.get('/me', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
});
 
export default router;