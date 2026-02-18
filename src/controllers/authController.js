const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { generateToken } = require('../utils/helpers');

// Validation rules
const signupRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * POST /auth/signup
 */
const signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password });

        // Create default settings for the new user
        await UserSettings.create({ userId: user._id });

        const token = generateToken(user);
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '30d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({ user, token, refreshToken });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '30d' });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({ user, token, refreshToken });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const user = await User.findOne({ _id: decoded.id, refreshToken });

        if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        return res.status(401).json({ message: 'Refresh token expired' });
    }
};

module.exports = { signup, login, logout, refresh, signupRules, loginRules };
