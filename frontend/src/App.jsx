import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import Navbar from "./components/Navbar";
// import CommunitySupport from "./components/CommunitySupport";

import './App.css';
const App = () => (
    <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<Chatbot />} />
{/*             <Route path="/community" element={<CommunitySupport />} /> */}
        </Routes>
    </Router>
);

export default App;
