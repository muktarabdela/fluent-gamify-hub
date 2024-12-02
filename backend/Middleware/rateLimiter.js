const rateLimit = require('express-rate-limit');
const { SECURITY_CONFIG } = require('../config/security');

const createRateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || SECURITY_CONFIG.RATE_LIMIT.windowMs,
        max: options.max || SECURITY_CONFIG.RATE_LIMIT.max,
        message: options.message || SECURITY_CONFIG.RATE_LIMIT.message,
        keyGenerator: (req) => {
            // Use both IP and user ID (if available) for rate limiting
            return req.user ? `${req.ip}-${req.user.userId}` : req.ip;
        }
    });
};

module.exports = createRateLimiter; 