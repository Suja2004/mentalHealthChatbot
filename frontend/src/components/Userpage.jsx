import React, { useState, useEffect } from "react";
import './Userpage.css';
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../axiosConfig";

const UserPage = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [userDetails, setUserDetails] = useState({
        username: '',
        email: '',
        age: 0,
        gender: 'Male',
        frequency: 'Weekly',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [nextQuizDate, setNextQuizDate] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsFetching(true);
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');

                const response = await axiosInstance.get(`/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(response.data);
                setNextQuizDate(calculateNextDate(response.data.frequency));
            } catch (error) {
                handleError('Error fetching user details.');
                console.error(error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchUserDetails();
    }, []);

    const handleEdit = () => setIsEditing(!isEditing);

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                handleError('User is not authenticated. Please log in again.');
                return;
            }
            const response = await axiosInstance.put(
                "/user",
                userDetails,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                handleError('Profile updated successfully!');
            } else {
                handleError('Failed to update profile. Please try again later.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating profile.';
            handleError(errorMessage);
            console.error('Profile Update Error:', error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }

        setNextQuizDate(calculateNextDate(userDetails.frequency));
    };

    const handleChange = (field, value) => {
        setUserDetails({
            ...userDetails,
            [field]: field === 'age' ? Number(value) : value,
        });
    };

    const handleError = (message, isError = true) => {
        setError(message);
        if (isError) {
            setTimeout(() => {
                setError('');
            }, 5000);
        }
    };

    function calculateNextDate(frequency) {
        const today = new Date();
        let daysToAdd;
        switch (frequency) {
            case "Weekly":
                daysToAdd = 7;
                break;
            case "Bi-Weekly":
                daysToAdd = 14;
                break;
            case "Monthly":
                daysToAdd = 30;
                break;
            default:
                daysToAdd = 7;
        }
        const nextDate = new Date(today.setDate(today.getDate() + daysToAdd));
        return nextDate.toDateString();
    }

    if (isFetching) {
        return <div className="userpage-container user-details">Loading user details...</div>;
    }

    return (
        <div className="userpage-container">
            <h1 className="header">
                <div className="left">CalmCare</div>
                <Navbar />
            </h1>
            <div className="user-details">
                <div className="user-icon">
                    <h2>
                        <FontAwesomeIcon icon={faUser} />
                    </h2>
                </div>
                {error && <p className="error">{error}</p>}
                {isEditing ? (
                    <div className="edit-form">
                        <label>
                            Name:
                            <input
                                type="text"
                                value={userDetails.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                readOnly
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                value={userDetails.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                readOnly
                            />
                        </label>
                        <label>
                            Age:
                            <input
                                type="number"
                                value={userDetails.age}
                                onChange={(e) => handleChange("age", e.target.value)}
                            />
                        </label>
                        <label>
                            Gender:
                            <select
                                value={userDetails.gender}
                                onChange={(e) => handleChange("gender", e.target.value)}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label>
                            Assessment Frequency:
                            <select
                                value={userDetails.frequency}
                                onChange={(e) => handleChange("frequency", e.target.value)}
                            >
                                <option value="Weekly">Weekly</option>
                                <option value="Bi-Weekly">Bi-Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </label>
                        <button className="save-button" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                ) : (
                    <div className="details-display">
                        <p>Username: {userDetails.username}</p>
                        <p>Email: {userDetails.email}</p>
                        <p>Age: {userDetails.age}</p>
                        <p>Gender: {userDetails.gender}</p>
                        <p>Assessment Frequency: {userDetails.frequency}</p>
                        <p>Next Assessment Date: {nextQuizDate}</p>
                        <button className="edit-button" onClick={handleEdit}>
                            Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPage;
