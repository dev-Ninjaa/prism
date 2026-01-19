const express = require('express');
const router = express.Router();

let users = [
    { id: 1, name: "Ninja", email: "ninja@example.com" },
    { id: 2, name: "Rex", email: "rex@example.com" },
    { id: 3, name: "Ace", email: "ace@example.com" }
];

// GET /api/users
router.get('/', (req, res) => {
    res.status(200).json(users);
});

// POST /api/users
router.post('/', (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({
            error: "Bad Request",
            message: "Missing 'name' in request body"
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
});

module.exports = router;
