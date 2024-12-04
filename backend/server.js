const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { detectIntent } = require("./chatbot");
// const setupSocket = require("./socket");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

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

// const httpServer = http.createServer(app);
// setupSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
