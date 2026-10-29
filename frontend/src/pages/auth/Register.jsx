
import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    User,
    Phone,
    UserRound,
    ArrowLeft,
} from "lucide-react";

import { registerUser } from "../../api/auth";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const requestedRole = searchParams.get("role");

    const initialRole =
        requestedRole === "CUSTOMER" || requestedRole === "WORKER"
            ? requestedRole
            : "CUSTOMER";

    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [role, setRole] = useState(initialRole);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        const cleanPhone = phoneNumber
            .replace(/\s/g, "")
            .replace(/-/g, "");

        if (!username.trim()) {
            setError("Please enter a username.");
            return;
        }

        if (!/^\d{10}$/.test(cleanPhone)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!password) {
            setError("Please enter a password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const getMessage = (value) => {
            if (typeof value === "string") return value;

            if (Array.isArray(value)) {
                return value.map(getMessage).filter(Boolean).join(" ");
            }

            if (value && typeof value === "object") {
                return Object.values(value)
                    .map(getMessage)
                    .filter(Boolean)
                    .join(" ");
            }

            return "";
        };

        try {
            setLoading(true);

            await registerUser({
                username: username.trim(),
                password,
                phone_number: cleanPhone,
                role,
            });

            navigate("/verify-phone", {
                replace: true,
                state: {
                    phoneNumber: cleanPhone,
                    username: username.trim(),
                },
            });
        } catch (err) {
            console.error(
                "Registration failed:",
                err.response?.data || err
            );

            const responseData = err.response?.data ?? {};

            const backendError =
                responseData.error &&
                    typeof responseData.error === "object"
                    ? responseData.error
                    : responseData;

            const message =
                getMessage(backendError.username) ||
                getMessage(backendError.phone_number) ||
                getMessage(backendError.password) ||
                getMessage(backendError.role) ||
                getMessage(backendError.detail) ||
                getMessage(backendError.non_field_errors) ||
                (typeof responseData.error === "string"
                    ? responseData.error
                    : "");

            setError(
                message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card register-card">
                <Link to="/" className="back-home-btn">
                    <ArrowLeft size={18} />
                    <span>Back to Home</span>
                </Link>

                <Link to="/" className="auth-logo">
                    <span className="auth-logo-mark">K</span>
                    <span>KaamSetu</span>
                </Link>

                <div className="auth-heading">
                    <h1>Create your account</h1>
                    <p>Join KaamSetu and get started</p>
                </div>

                {error && (
                    <div className="auth-error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <User size={19} className="input-icon" />
                            <input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Mobile number</label>
                        <div className="input-wrapper">
                            <Phone size={19} className="input-icon" />
                            <input
                                id="phone"
                                type="tel"
                                placeholder="10-digit mobile number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                maxLength={10}
                                autoComplete="tel"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>I want to</label>
                        <div className="role-options">
                            <button
                                type="button"
                                className={
                                    role === "CUSTOMER"
                                        ? "role-option active"
                                        : "role-option"
                                }
                                onClick={() => setRole("CUSTOMER")}
                            >
                                <UserRound size={18} />
                                <span>Hire a worker</span>
                            </button>

                            <button
                                type="button"
                                className={
                                    role === "WORKER"
                                        ? "role-option active"
                                        : "role-option"
                                }
                                onClick={() => setRole("WORKER")}
                            >
                                <User size={18} />
                                <span>Find work</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <LockKeyhole size={19} className="input-icon" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">
                            Confirm password
                        </label>
                        <div className="input-wrapper">
                            <LockKeyhole size={19} className="input-icon" />
                            <input
                                id="confirm-password"
                                type={
                                    showConfirmPassword ? "text" : "password"
                                }
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
