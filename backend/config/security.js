const SECURITY_CONFIG = {
    MAX_REQUEST_SIZE: '10mb',
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    },
    CORS_OPTIONS: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    JWT: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },
    TELEGRAM: {
        webAppSecret: process.env.TELEGRAM_WEBAPP_SECRET,
        authTimeout: 86400 // 24 hours in seconds
    }
};

// Additional security configurations
const SECURITY_HEADERS = {
    // Disable browsers from performing MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Protect against clickjacking
    'X-Frame-Options': 'DENY',
    // Enable XSS filter in browsers
    'X-XSS-Protection': '1; mode=block',
    // Control how much information is sent in the Referer header
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Prevent loading in <frame>, <iframe>, <embed>, <object>
    'Content-Security-Policy': "frame-ancestors 'none'",
    // HTTP Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

module.exports = {
    SECURITY_CONFIG,
    SECURITY_HEADERS
}; 