const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Routes
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// GET /api/error
app.get('/api/error', (req, res) => {
    res.status(500).json({
        error: "Internal Server Error",
        message: "This is a deterministic error for testing."
    });
});

// GET/POST /api/echo
app.all('/api/echo', (req, res) => {
    res.json({
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Prism Test API listening at http://localhost:${port}`);
});
