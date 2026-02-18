const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

module.exports = { generateToken };
