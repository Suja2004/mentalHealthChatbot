import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="left">
                <Link className="logo" to="/">CalmCare</Link>
            </div>
            <div className="right">
                <Link className="links" to="/">Home</Link>
{/*                 <Link className="links" to="/community">Community Support</Link> */}
            </div>
        </nav>
    );
};

export default Navbar;
