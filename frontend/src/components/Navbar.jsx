
import { useCallback, useEffect, useState ,useRef, } from "react";
import {
    Bell,
    Menu,
    UserRound,
    KeyRound,
    LogOut,
    X,
    Home,
    BriefcaseBusiness,
    Info,
    Workflow,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../api/notifications";
import "./Navbar.css";

function Navbar({ onMenuClick }) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const accountMenuRef = useRef(null);

    const [unreadCount, setUnreadCount] = useState(0);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const role = user?.role?.toUpperCase();

    const profilePath =
        role === "CUSTOMER"
            ? "/customer/profile"
            : "/worker/profile";

    const notificationsPath =
        role === "CUSTOMER"
            ? "/customer/notifications"
            : "/worker/notifications";

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }

        try {
            const response = await getNotifications();

            const notifications = Array.isArray(response)
                ? response
                : response?.results ??
                  response?.notifications ??
                  response?.data?.results ??
                  response?.data?.notifications ??
                  response?.data ??
                  [];

            if (!Array.isArray(notifications)) return;

            const unread = notifications.filter(
                (notification) =>
                    notification.is_read === false ||
                    notification.read === false ||
                    notification.isRead === false
            ).length;

            setUnreadCount(unread);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchUnreadCount();

        if (!isAuthenticated) return undefined;

        const intervalId = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(intervalId);
    }, [fetchUnreadCount, isAuthenticated, location.pathname]);

    useEffect(() => {
        setIsAccountMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        setIsAccountMenuOpen(false);
        logout();
        navigate("/login");
    };

    const closeMenu = () => setIsAccountMenuOpen(false);

    const publicLinks = [
        {
            label: "Home",
            to: "/",
            icon: Home,
        },
        {
            label: "How it works",
            to: "/#how-it-works",
            icon: Workflow,
        },
        {
            label: "Services",
            to: "/#services",
            icon: BriefcaseBusiness,
        },
        {
            label: "About",
            to: "/#about",
            icon: Info,
        },
    ];

    useEffect(() => {
        if (!isAccountMenuOpen) return;

        const handleOutsideClick = (event) => {
            if (
                accountMenuRef.current &&
                !accountMenuRef.current.contains(event.target)
            ) {
                setIsAccountMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isAccountMenuOpen]);

    return (
        <nav className="navbar" aria-label="Main navigation">
            <div className="navbar-left">
                {isAuthenticated && (
                    <button
                        type="button"
                        className="navbar-menu-button"
                        onClick={onMenuClick}
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={21} />
                    </button>
                )}

                <Link
                    to="/"
                    className="navbar-logo"
                    aria-label="KaamSetu home"
                >
                    <span className="logo-kaam">Kaam</span>
                    <span className="logo-setu">Setu</span>
                </Link>
            </div>

            <div className="navbar-links">
                {publicLinks.map(({ label, to }) => (
                    <Link key={label} to={to}>
                        {label}
                    </Link>
                ))}
            </div>

            <div className="navbar-actions">
                {isAuthenticated ? (
                    <>
                        <button
                            type="button"
                            className="navbar-notification-button"
                            onClick={() => navigate(notificationsPath)}
                            aria-label={`Notifications${
                                unreadCount > 0
                                    ? `, ${unreadCount} unread`
                                    : ""
                            }`}
                            title="Notifications"
                        >
                            <Bell size={21} />

                            {unreadCount > 0 && (
                                <span className="navbar-notification-badge">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="navbar-account" ref={accountMenuRef}>
                            <button
                                type="button"
                                className="navbar-avatar-trigger"
                                onClick={() =>
                                    setIsAccountMenuOpen((previous) => !previous)
                                }
                                aria-label="Open account menu"
                                aria-expanded={isAccountMenuOpen}
                                aria-haspopup="menu"
                            >
                                {user?.profile_photo ? (
                                    <img
                                        src={user.profile_photo}
                                        alt=""
                                        className="navbar-avatar-image"
                                    />
                                ) : (
                                    <UserRound size={23} />
                                )}
                            </button>

                            {isAccountMenuOpen && (
                                <div
                                    className="navbar-account-dropdown"
                                    role="menu"
                                >
                                    <div className="navbar-dropdown-user">
                                        <strong>{user?.username}</strong>
                                        <span>
                                            {role === "CUSTOMER"
                                                ? "Customer Account"
                                                : "Worker Account"}
                                        </span>
                                    </div>

                                    <div className="navbar-dropdown-divider" />

                                    <div className="navbar-dropdown-public-links">
                                        {publicLinks.map(
                                            ({ label, to, icon: Icon }) => (
                                                <Link
                                                    key={label}
                                                    to={to}
                                                    className="navbar-dropdown-item"
                                                    role="menuitem"
                                                    onClick={closeMenu}
                                                >
                                                    <Icon size={17} />
                                                    <span>{label}</span>
                                                </Link>
                                            )
                                        )}

                                        <div className="navbar-dropdown-divider" />
                                    </div>

                                    <Link
                                        to={profilePath}
                                        className="navbar-dropdown-item"
                                        role="menuitem"
                                        onClick={closeMenu}
                                    >
                                        <UserRound size={17} />
                                        <span>Profile</span>
                                    </Link>

                                    <Link
                                        to="/change-password"
                                        className="navbar-dropdown-item"
                                        role="menuitem"
                                        onClick={closeMenu}
                                    >
                                        <KeyRound size={17} />
                                        <span>Change Password</span>
                                    </Link>

                                    <div className="navbar-dropdown-divider" />

                                    <button
                                        type="button"
                                        className="navbar-dropdown-item navbar-dropdown-logout"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={17} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-login">
                            Login
                        </Link>

                        <Link to="/register" className="navbar-signup">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
