import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    User,
    Phone,
    UserRound,
} from "lucide-react";

import { registerUser } from "../../api/auth";

import "./Register.css";


function Register() {

    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    const [phoneNumber, setPhoneNumber] =
        useState("");

    const [role, setRole] =
        useState("CUSTOMER");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");

        const cleanPhone =
            phoneNumber
                .replace(/\s/g, "")
                .replace(/-/g, "");

        if (!username.trim()) {

            setError(
                "Please enter a username."
            );

            return;
        }

        if (!/^\d{10}$/.test(cleanPhone)) {

            setError(
                "Enter a valid 10-digit Indian mobile number."
            );

            return;
        }

        if (!password) {

            setError(
                "Please enter a password."
            );

            return;
        }

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        try {

            setLoading(true);

            await registerUser({
                username: username.trim(),
                password,
                phone_number: cleanPhone,
                role,
            });

            /*
             * Registration succeeded.
             *
             * Phone verification will be connected
             * after the backend verification endpoint
             * is finalized.
             */

            navigate(
                "/verify-phone",
                {
                    replace: true,
                    state: {
                        phoneNumber: cleanPhone,
                        username: username.trim(),
                    },
                }
            );

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error.response?.data || error
            );

            const backendError =
                error.response?.data;

            if (
                backendError?.username
            ) {

                setError(
                    backendError.username[0]
                );

            } else if (
                backendError?.phone_number
            ) {

                setError(
                    backendError.phone_number[0]
                );

            } else if (
                backendError?.password
            ) {

                setError(
                    backendError.password[0]
                );

            } else if (
                backendError?.role
            ) {

                setError(
                    backendError.role[0]
                );

            } else if (
                backendError?.detail
            ) {

                setError(
                    backendError.detail
                );

            } else if (
                backendError?.error
            ) {

                setError(
                    backendError.error
                );

            } else {

                setError(
                    "Registration failed. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card register-card">

                {/* Logo */}

                <Link
                    to="/"
                    className="auth-logo"
                >

                    <span className="auth-logo-mark">
                        K
                    </span>

                    <span>
                        KaamSetu
                    </span>

                </Link>


                {/* Heading */}

                <div className="auth-heading">

                    <h1>
                        Create your account
                    </h1>

                    <p>
                        Join KaamSetu and get started
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                {/* Form */}

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >

                    {/* Username */}

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <div className="input-wrapper">

                            <User
                                size={19}
                                className="input-icon"
                            />

                            <input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                autoComplete="username"
                            />

                        </div>

                    </div>


                    {/* Phone */}

                    <div className="form-group">

                        <label htmlFor="phone">
                            Mobile number
                        </label>

                        <div className="input-wrapper">

                            <Phone
                                size={19}
                                className="input-icon"
                            />

                            <input
                                id="phone"
                                type="tel"
                                placeholder="10-digit mobile number"
                                value={phoneNumber}
                                onChange={(e) =>
                                    setPhoneNumber(
                                        e.target.value
                                    )
                                }
                                maxLength={10}
                                autoComplete="tel"
                            />

                        </div>

                    </div>


                    {/* Role */}

                    <div className="form-group">

                        <label>
                            I want to
                        </label>

                        <div className="role-options">

                            <button
                                type="button"
                                className={
                                    role === "CUSTOMER"
                                        ? "role-option active"
                                        : "role-option"
                                }
                                onClick={() =>
                                    setRole("CUSTOMER")
                                }
                            >

                                <UserRound size={18} />

                                <span>
                                    Hire a worker
                                </span>

                            </button>


                            <button
                                type="button"
                                className={
                                    role === "WORKER"
                                        ? "role-option active"
                                        : "role-option"
                                }
                                onClick={() =>
                                    setRole("WORKER")
                                }
                            >

                                <User size={18} />

                                <span>
                                    Find work
                                </span>

                            </button>

                        </div>

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="input-wrapper">

                            <LockKeyhole
                                size={19}
                                className="input-icon"
                            />

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
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


                    {/* Confirm Password */}

                    <div className="form-group">

                        <label htmlFor="confirm-password">
                            Confirm password
                        </label>

                        <div className="input-wrapper">

                            <LockKeyhole
                                size={19}
                                className="input-icon"
                            />

                            <input
                                id="confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
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


                    {/* Submit */}

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
                            <>
                                Create account
                            </>
                        )}

                    </button>

                </form>


                {/* Login */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;