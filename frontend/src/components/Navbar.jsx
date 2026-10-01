import { Bell, Search, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <header className="navbar">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
                <span className="logo-kaam">Kaam</span>
                <span className="logo-setu">Setu</span>
            </Link>

            {/* Public Navigation */}
            <nav className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/how-it-works">How it works</Link>
                <Link to="/services">Services</Link>
                <Link to="/about">About</Link>
            </nav>

            {/* Right Side */}
            <div className="navbar-actions">

                <button className="navbar-icon-button">
                    <Search size={19} />
                </button>

                <Link to="/login" className="navbar-login">
                    Login
                </Link>

                <Link to="/register" className="navbar-signup">
                    Sign Up
                </Link>

            </div>
        </header>
    );
}

export default Navbar;