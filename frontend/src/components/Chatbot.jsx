import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './Chatbot.css';
import ProfilePage from "./ProfilePage";
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (message = input) => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");

        try {
            const response = await axios.post("mental-health-chatbot-server.vercel.app/api/chat", { query: message });
            const botMessage = { sender: "bot", text: response.data.reply };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            speakText(response.data.reply); 
        } catch (error) {
            const errorMessage = { sender: "bot", text: "Sorry, something went wrong. Try again later." };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            speakText("Sorry, something went wrong. Try again later.");
        }
    };

    const startListening = () => {
        if (!recognitionRef.current || isListening) return;
        recognitionRef.current.start();
        setIsListening(true);
    };

    const speakText = (text) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.pitch = 3;
            utterance.rate = 0.84;
            utterance.volume = 0.8;

            const voices = window.speechSynthesis.getVoices();
            const soothingVoice = voices.find((voice) => voice.name === "Google US English Female");
            utterance.voice = voices[47];//f4/17/23/29/37/f45/46/47/

            if (soothingVoice) {
                console.log(soothingVoice);
                utterance.voice = soothingVoice;
            }

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech Synthesis is not supported in your browser.");
        }
    };

    return (
        <div className="home">
            <div className="chatbot-container">
                <div className="header">TheraBot</div>
                <div className="chatbox">
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button onClick={() => handleSend()}>
                        <FaPaperPlane size={20} />
                    </button>
                    <button onClick={startListening} disabled={isListening}>
                        {isListening ? "Listening..." : <FaMicrophone size={20} />}
                    </button>
                </div>
            </div>
            <ProfilePage />
        </div>
    );
};

export default Chatbot;
