import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET_KEY = 'your-secret-key';
const USERS_FILE = path.join(__dirname, 'Users.json');

export class UserController {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data || '[]');
    }

    saveUsers() {
        fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    }

    async register(username, password, role = 'user') {
        if (this.users.some(user => user.username === username)) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword, role };
        this.users.push(newUser);
        this.saveUsers();

        const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '1h' });
        return { message: 'User registered successfully.', token };
    }

    async login(username, password) {
        const user = this.users.find(user => user.username === username);
        if (!user) throw new Error('Invalid username or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid username or password');

        const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        return { message: 'Login successful.', token };
    }
}
