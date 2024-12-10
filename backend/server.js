const express = require("express");
const mongoose = require('mongoose');
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { detectIntent } = require("./chatbot");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, default: null },
});

const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(username)) {
        return res.status(400).json({ message: 'Username cannot contain special characters' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
        const expiry = Date.now() + 36000000;

        res.json({ token, userId: user._id, expiry });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in', error: error.message });
    }
});

// Chatbot API endpoint
app.post("/api/chat", async (req, res) => {
    const { query } = req.body;

    try {
        const reply = await detectIntent(query);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ reply: "Error connecting to the chatbot." });
    }
});

// Create HTTP server and attach Socket.IO
// const httpServer = http.createServer(app);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
