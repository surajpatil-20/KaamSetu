import {
    Menu,
    Search,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

function Navbar({ onMenuClick }) {

    const {
        isAuthenticated,
        user,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">

            {/* Left side */}

            <div className="navbar-left">

                {isAuthenticated && (
                    <button
                        className="navbar-menu-button"
                        onClick={onMenuClick}
                        aria-label="Open navigation"
                    >
                        <Menu size={21} />
                    </button>
                )}

                <Link
                    to="/"
                    className="navbar-logo"
                >
                    <span className="logo-kaam">
                        Kaam
                    </span>

                    <span className="logo-setu">
                        Setu
                    </span>
                </Link>

            </div>


            {/* Desktop navigation */}

            <div className="navbar-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/">
                    How it works
                </Link>

                <Link to="/">
                    Services
                </Link>

                <Link to="/">
                    About
                </Link>

            </div>


            {/* Right side */}

            <div className="navbar-actions">

                <button
                    className="navbar-icon-button"
                    aria-label="Search"
                >
                    <Search size={18} />
                </button>

                {isAuthenticated ? (
                    <>
                        <span className="navbar-user">
                            {user?.username}
                        </span>

                        <button
                            className="navbar-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="navbar-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="navbar-signup"
                        >
                            Sign Up
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;