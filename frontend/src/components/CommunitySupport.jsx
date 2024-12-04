import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./CommunitySupport.css";

const socket = io("mental-health-chatbot-server.vercel.app");

const CommunitySupport = () => {
    const [room, setRoom] = useState("General");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [username] = useState("You");

    useEffect(() => {
        socket.emit("joinRoom", { room, username });

        socket.off("message");
        socket.on("message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.emit("leaveRoom", room);
            socket.off("message");
        };
    }, [room, username]);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = { sender: username, text: message };
            socket.emit("chatMessage", { room, message: newMessage });
            setMessage("");
        }
    };

    return (
        <div className="body">
            <div className="community-container">
            <div className="header">Community</div>
            <div className="room-selector">
                    <label>Choose a Room: </label>
                    <select value={room} onChange={(e) => setRoom(e.target.value)}>
                        <option value="General">General</option>
                        <option value="Coping Strategies">Coping Strategies</option>
                        <option value="PTSD Symptoms">PTSD Symptoms</option>
                    </select>
                </div>
                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender === username ? "user-message" : "peer-message"}`}
                        >
                            <strong>{msg.sender}:</strong> <span>{msg.text}</span>
                        </div>
                    ))}
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default CommunitySupport;
