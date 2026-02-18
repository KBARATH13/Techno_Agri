const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: 'No authentication token, authorization denied.' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified || !verified.id) {
            return res.status(401).json({ msg: 'Token verification failed, authorization denied.' });
        }

        // Verify user still exists in the database
        const user = await User.findById(verified.id);
        if (!user) {
            return res.status(401).json({ msg: 'User no longer exists, authorization denied.' });
        }

        req.user = verified.id;
        next();
    } catch (err) {
        res.status(401).json({ error: err.message, status: 401 });
    }
};

module.exports = auth;
