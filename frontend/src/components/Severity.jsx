import React, { useState } from "react";
import axios from "axios";
import './Severity.css';
import Navbar from "./Navbar";

const Severity = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(10).fill(1));
    const [severity, setSeverity] = useState(null);
    const [error, setError] = useState(null);

    const questions = [
        "On a scale of 1 to 10, how severe are unwanted or disturbing memories of a traumatic event?",
        "On a scale of 1 to 10, how severe are upsetting dreams related to a traumatic event?",
        "On a scale of 1 to 10, how severe is your emotional distress when reminded of a traumatic event?",
        "On a scale of 1 to 10, how severe is your urge to avoid memories, thoughts, or feelings about a traumatic event?",
        "On a scale of 1 to 10, how severe is your urge to avoid external reminders (people, places, conversations) about a traumatic event?",
        "On a scale of 1 to 10, how severe is your emotional numbness or inability to experience positive emotions?",
        "On a scale of 1 to 10, how severe is your feeling of being overly alert or on edge, as if something bad might happen?",
        "On a scale of 1 to 10, how severe is your difficulty concentrating due to thoughts about a traumatic event?",
        "On a scale of 1 to 10, how severe is your irritability or anger without clear reason?",
        "On a scale of 1 to 10, how severe are your physical reactions (sweating, heart racing) when reminded of a traumatic event?",
    ];

    const handleResponseChange = (value) => {
        const updatedResponses = [...responses];
        updatedResponses[currentQuestionIndex] = parseInt(value, 10);
        setResponses(updatedResponses);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        try {
            const totalScore = responses.reduce((acc, val) => acc + val, 0);
            setSeverity(totalScore);

            await axios.post("https://severityserver.onrender.com/predict", {
                responses: responses,
            });
        } catch (err) {
            setError("An error occurred while calculating severity. Please try again.");
        }
    };

    const severityLevel = () => {
        if (severity <= 33) return "Mild";
        if (severity <= 56) return "Moderate";
        return "Severe";
    };

    const pointerRotation = severity ? (severity / 100 * 180) + (-90) : 0;

    return (
        <div className="severity-container">
            <h1 className="header">
                <div className="left">
                    CalmCare
                </div>
                <Navbar />
            </h1>
            {severity !== null ? (
                <div className="severity-result">
                    <h2>Predicted Severity: {severityLevel()} </h2>
                    <div className="semicircle-meter">
                        <div className="labels">
                            <span>Mild</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                        </div>
                        <div className="meter">
                            <div
                                className="pointer"
                                style={{ transform: `rotate(${pointerRotation}deg)` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="severity-content question">
                    <p>
                        Question {currentQuestionIndex + 1}/{questions.length}:
                    </p>
                    <p>{questions[currentQuestionIndex]}</p>
                    <div className="response">
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={responses[currentQuestionIndex] || ""}
                            onChange={(e) => handleResponseChange(e.target.value)}
                            placeholder="1 - 10"
                        />
                    </div>
                    <div className="navigation-buttons">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="prev-button"
                        >
                            Previous
                        </button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button onClick={handleSubmit} className="submit-button">
                                Submit
                            </button>
                        ) : (
                            <button onClick={handleNext} className="next-button">
                                Next
                            </button>
                        )}
                    </div>
                </div>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Severity;
