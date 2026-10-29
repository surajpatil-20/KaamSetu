
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { sendPhoneOtp } from "../../firebasePhoneAuth";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const digits = identifier
            .trim()
            .replace(/[\s-]/g, "")
            .replace(/^\+91/, "");

        if (!/^\d{10}$/.test(digits)) {
            setError("Enter your registered 10-digit Indian mobile number.");
            return;
        }

        const phoneNumber = `+91${digits}`;

        try {
            setLoading(true);

            await sendPhoneOtp(
                phoneNumber,
                "forgot-password-recaptcha"
            );

            navigate("/reset-password", {
                replace: true,
                state: { identifier: phoneNumber },
            });
        } catch (err) {
            console.error("FIREBASE PASSWORD OTP ERROR:", err);

            const messages = {
                "auth/invalid-phone-number": "Enter a valid phone number.",
                "auth/too-many-requests": "Too many attempts. Please try again later.",
                "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
                "auth/operation-not-allowed": "Phone authentication is not enabled in Firebase.",
            };

            setError(
                messages[err.code] ||
                err.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card forgot-card">
                <Link to="/login" className="verify-back">
                    <ArrowLeft size={17} />
                    Back to login
                </Link>

                <div className="verify-icon">
                    <KeyRound size={28} />
                </div>

                <div className="auth-heading">
                    <h1>Forgot password?</h1>
                    <p>
                        Enter your registered mobile number.
                        Firebase will send you a verification code.
                    </p>
                </div>

                {error && (
                    <div className="auth-error">{error}</div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="identifier">
                            Registered mobile number
                        </label>
                        <input
                            id="identifier"
                            className="standalone-input"
                            type="tel"
                            inputMode="tel"
                            placeholder="10-digit mobile number"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>

                    <div id="forgot-password-recaptcha" />
                </form>

                <div className="auth-footer">
                    <span>Remember your password?</span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
