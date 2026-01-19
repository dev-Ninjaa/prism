const express = require('express');
const router = express.Router();

// 1. PARAMS TEST
router.get('/params', (req, res) => {
    res.json({
        query: req.query
    });
});

// 2. HEADERS TEST
router.get('/headers', (req, res) => {
    res.json({
        headers: req.headers
    });
});

// 3. BODY TEST
router.post('/body', (req, res) => {
    // Express text parser will put raw body in req.body if it's not JSON
    // express.json() will have already parsed it if it was JSON
    if (req.headers['content-type'] === 'application/json') {
        if (typeof req.body !== 'object') {
            return res.status(400).json({
                error: "Invalid JSON",
                message: "The provided body is not valid JSON"
            });
        }
    }
    
    res.json({
        body: req.body,
        contentType: req.headers['content-type']
    });
});

// 4. ENV TEST
router.get('/env/:value', (req, res) => {
    res.json({
        value: req.params.value
    });
});

// 5. AUTH TESTS
router.get('/auth/bearer', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Missing or invalid Bearer token"
        });
    }
    res.json({
        message: "Authenticated with Bearer token",
        token: authHeader.split(' ')[1]
    });
});

router.get('/auth/basic', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Missing or invalid Basic auth"
        });
    }
    
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    res.json({
        message: "Authenticated with Basic auth",
        username: username
    });
});

router.get('/auth/apikey', (req, res) => {
    const apiKeyHeader = req.headers['x-api-key'];
    const apiKeyQuery = req.query['api_key'];
    
    if (!apiKeyHeader && !apiKeyQuery) {
        return res.status(403).json({
            error: "Forbidden",
            message: "Missing API key in header (x-api-key) or query (api_key)"
        });
    }
    
    res.json({
        message: "Authenticated with API key",
        key: apiKeyHeader || apiKeyQuery,
        location: apiKeyHeader ? "header" : "query"
    });
});

// 6. MIXED TEST
router.post('/mixed', (req, res) => {
    res.json({
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        auth: req.headers['authorization'] || req.headers['x-api-key'] || req.query['api_key'] ? "Present" : "Missing"
    });
});

module.exports = router;
