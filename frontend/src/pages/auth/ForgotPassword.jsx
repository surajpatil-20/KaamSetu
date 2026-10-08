import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    KeyRound,
} from "lucide-react";

import {
    forgotPassword,
} from "../../api/auth";

import "./ForgotPassword.css";


function ForgotPassword() {

    const navigate = useNavigate();

    const [identifier, setIdentifier] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!identifier.trim()) {

            setError(
                "Enter your username or mobile number."
            );

            return;
        }

        try {

            setLoading(true);

            const data = await forgotPassword({
                identifier:
                    identifier.trim(),
            });

            /*
             * Backend intentionally returns a
             * generic response so we don't reveal
             * whether an account exists.
             */

            navigate(
                "/reset-password",
                {
                    replace: true,
                    state: {
                        identifier:
                            identifier.trim(),

                        message:
                            data.message,
                    },
                }
            );

        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
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
                    "Unable to process your request. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card forgot-card">

                {/* Back */}

                <Link
                    to="/login"
                    className="verify-back"
                >

                    <ArrowLeft size={17} />

                    Back to login

                </Link>


                {/* Icon */}

                <div className="verify-icon">

                    <KeyRound size={28} />

                </div>


                {/* Heading */}

                <div className="auth-heading">

                    <h1>
                        Forgot password?
                    </h1>

                    <p>
                        Enter your username or mobile
                        number and we'll send you an OTP.
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
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label htmlFor="identifier">
                            Username or mobile number
                        </label>

                        <input
                            id="identifier"
                            className="standalone-input"
                            type="text"
                            placeholder="Username or 10-digit mobile"
                            value={identifier}
                            onChange={(e) =>
                                setIdentifier(
                                    e.target.value
                                )
                            }
                            autoComplete="username"
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Sending OTP...
                            </>
                        ) : (
                            <>
                                <KeyRound size={19} />
                                Send OTP
                            </>
                        )}

                    </button>

                </form>


                {/* Footer */}

                <div className="auth-footer">

                    <span>
                        Remember your password?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;