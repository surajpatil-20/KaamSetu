import {
    useEffect,
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
    LogIn,
    User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";


function Login() {

    const navigate = useNavigate();

    const {
        login,
        loading,
        isAuthenticated,
        user,
    } = useAuth();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        if (!isAuthenticated || !user) {
            return;
        }

        if (user.role === "CUSTOMER") {

            navigate(
                "/customer/dashboard",
                {
                    replace: true,
                }
            );

        } else if (user.role === "WORKER") {

            navigate(
                "/worker/dashboard",
                {
                    replace: true,
                }
            );
        }

    }, [
        isAuthenticated,
        user,
        navigate,
    ]);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        if (!username.trim()) {

            setError(
                "Please enter your username."
            );

            return;
        }

        if (!password) {

            setError(
                "Please enter your password."
            );

            return;
        }

        try {

            await login({
                username: username.trim(),
                password,
            });

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error.response?.data || error
            );

            const backendError =
                error.response?.data;

            if (
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
                    "Invalid username or password."
                );
            }
        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card">

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
                        Welcome back
                    </h1>

                    <p>
                        Login to continue to KaamSetu
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
                    onSubmit={handleLogin}
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
                                placeholder="Enter your username"
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


                    {/* Password */}

                    <div className="form-group">

                        <div className="password-label-row">

                            <label htmlFor="password">
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="forgot-link"
                            >
                                Forgot password?
                            </Link>

                        </div>


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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
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


                    {/* Login Button */}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Logging in...
                            </>
                        ) : (
                            <>
                                <LogIn size={19} />
                                Login
                            </>
                        )}

                    </button>

                </form>


                {/* Register */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create account
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;