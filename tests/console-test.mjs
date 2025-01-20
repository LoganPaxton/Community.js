import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

let users = [];

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists.' });
    }
    users.push({ username, password, role });
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'User registered successfully.', token });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful.', token });
});

app.get('/admin-route', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
        }
        res.json({ message: 'Admin route accessed successfully.', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
});

app.get('/user-route', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'User route accessed successfully.', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send({ status: 'OK' });
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    runTests(); // Run tests after the server starts
});

// Test Logic
async function runTests() {
    const BASE_URL = `http://localhost:${PORT}`;

    const waitForServer = async () => {
        let retries = 10;
        const delay = 1000;

        while (retries > 0) {
            try {
                const res = await fetch(`${BASE_URL}/health`);
                if (res.ok) {
                    console.log('Server is running...');
                    return true;
                }
            } catch {
                console.log('Waiting for server...');
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
        }
        throw new Error('Server is not running.');
    };

    try {
        await waitForServer();

        console.log('Registering user...');
        const userRegisterResponse = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'exampleUser',
                password: 'password123',
                role: 'user'
            })
        });
        console.log('User Register Result:', await userRegisterResponse.json());

        console.log('Registering admin...');
        const adminRegisterResponse = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'adminUser',
                password: 'admin123',
                role: 'admin'
            })
        });
        console.log('Admin Register Result:', await adminRegisterResponse.json());

        console.log('Logging in as user...');
        const userLoginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'exampleUser',
                password: 'password123'
            })
        });
        const userLoginResult = await userLoginResponse.json();
        console.log('User Login Result:', userLoginResult);

        console.log('Logging in as admin...');
        const adminLoginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'adminUser',
                password: 'admin123'
            })
        });
        const adminLoginResult = await adminLoginResponse.json();
        console.log('Admin Login Result:', adminLoginResult);

        const userToken = userLoginResult.token;
        const adminToken = adminLoginResult.token;

        console.log('Accessing admin-only route as user...');
        const adminRouteAsUserResponse = await fetch(`${BASE_URL}/admin-route`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('Admin-only route as user:', await adminRouteAsUserResponse.json());

        console.log('Accessing admin-only route as admin...');
        const adminRouteAsAdminResponse = await fetch(`${BASE_URL}/admin-route`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Admin-only route as admin:', await adminRouteAsAdminResponse.json());

        console.log('Accessing user-only route as user...');
        const userRouteResponse = await fetch(`${BASE_URL}/user-route`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('User-only route as user:', await userRouteResponse.json());
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        server.close(); // Stop the server after tests
    }
}
