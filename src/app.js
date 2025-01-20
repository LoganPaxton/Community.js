const express = require('express');
const db = require('./database'); // Import the database module

const app = express();
const PORT = 3000;

app.use(express.json());

// Register user
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const query = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    db.run(query, [username, password, role || 'user'], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.status(400).json({ message: 'Username already exists.' });
            }
            return res.status(500).json({ message: 'Error registering user.', error: err.message });
        }

        res.status(201).json({ message: 'User registered successfully.', userId: this.lastID });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in.', error: err.message });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        res.status(200).json({ message: 'Login successful.', user });
    });
});

// Fetch all users (admin-only route)
app.get('/users', (req, res) => {
    const query = `SELECT id, username, role FROM users`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching users.', error: err.message });
        }

        res.status(200).json({ users: rows });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
