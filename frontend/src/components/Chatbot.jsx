import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef(null); 

    useEffect(() => {
        if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            alert("Speech Recognition is not supported in your browser. Please use Google Chrome or Edge.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); 
            handleSend(transcript); 
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            alert("An error occurred: " + event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false); 
        };

        recognitionRef.current = recognition; 

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const handleSend = async (message = input) => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(""); 
        if (message.toLowerCase().includes("open") || message.toLowerCase().includes("go to") || message.toLowerCase().includes("com")) {
            const url = extractUrlFromMessage(message);
            if (url) {
                window.location.href = url;
                const botMessage = { sender: "bot", text: `Opening ${url}` };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
                return;
            }
        }

        try {
            const response = await axios.post("https://mental-health-chatbot-server.vercel.app/api/chat", { query: message });
            const botMessage = { sender: "bot", text: response.data.reply };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            const errorMessage = { sender: "bot", text: "Sorry, something went wrong. Try again later." };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    const extractUrlFromMessage = (message) => {
        const regex = /open\s(https?:\/\/[^\s]+)/i;
        const match = message.match(regex);
        return match ? match[1] : null;
    };

    const startListening = () => {
        if (!recognitionRef.current || isListening) return;
        recognitionRef.current.start();
        setIsListening(true);
    };

    return (
        <div className="chatbot-container">
            <div className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={() => handleSend()}>Send</button>
                <button onClick={startListening} disabled={isListening}>
                    {isListening ? "Listening..." : "🎤"}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
