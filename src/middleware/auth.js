const jwt = require('jsonwebtoken');

/**
 * Verify JWT from the Authorization header and attach user payload to req.user
 */
const protect = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized – no token' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;          // { id, email, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized – invalid token' });
    }
};

module.exports = protect;
