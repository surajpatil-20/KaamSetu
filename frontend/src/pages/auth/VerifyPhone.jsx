
import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    CheckCircle2,
    Phone,
} from "lucide-react";

import { verifyPhone } from "../../api/auth";

import {
    sendPhoneOtp,
    verifyPhoneOtp,
    clearPhoneOtp,
} from "../../firebasePhoneAuth";

import "./VerifyPhone.css";

function VerifyPhone() {
    const navigate = useNavigate();
    const location = useLocation();

    const phoneFromRegister =
        location.state?.phoneNumber || "";

    const usernameFromRegister =
        location.state?.username || "";

    const [phoneNumber, setPhoneNumber] =
        useState(phoneFromRegister);

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [otpSent, setOtpSent] = useState(false);

    const otpInputRef = useRef(null);

    // Countdown timer
    useEffect(() => {
        if (seconds <= 0) return;

        const timer = setInterval(() => {
            setSeconds((previous) => previous - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    // Clear Firebase verification state when leaving this page.
    useEffect(() => {
        return () => {
            clearPhoneOtp();
        };
    }, []);

    const getIndianNumber = () => {
        const cleaned = phoneNumber
            .replace(/\s/g, "")
            .replace(/-/g, "");

        const number = cleaned.startsWith("+91")
            ? cleaned.slice(3)
            : cleaned;

        if (!/^\d{10}$/.test(number)) {
            return null;
        }

        return number;
    };

    // Request or resend the Firebase test OTP.
    const handleResend = async () => {
        setError("");
        setMessage("");

        const number = getIndianNumber();

        if (!number) {
            setError(
                "Enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        try {
            setResendLoading(true);

            await sendPhoneOtp(
                `+91${number}`,
                "recaptcha-container"
            );

            setOtpSent(true);
            setOtp("");
            setSeconds(60);

            setMessage(
                "OTP requested successfully. Enter your Firebase test code."
            );

            otpInputRef.current?.focus();
        } catch (error) {
            console.error(
                "FIREBASE OTP ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to request OTP. Please try again."
            );
        } finally {
            setResendLoading(false);
        }
    };

    // Verify the Firebase code, then verify its ID token in Django.
    const handleVerify = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        const number = getIndianNumber();

        if (!number) {
            setError(
                "Enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        if (!otpSent) {
            setError("Please click Send OTP first.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);

            // Firebase confirms the code configured in Firebase Console.
            const result = await verifyPhoneOtp(otp);

            const expectedPhone = `+91${number}`;

            if (result.phoneNumber !== expectedPhone) {
                setError(
                    "The verified Firebase number does not match the entered number."
                );
                return;
            }

            // Django validates the Firebase ID token.
            const data = await verifyPhone({
                id_token: result.idToken,
            });

            setMessage(
                data.message ||
                "Phone number verified successfully."
            );

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 900);
        } catch (error) {
            console.error(
                "PHONE VERIFICATION ERROR:",
                error.response?.data || error
            );

            const backendError = error.response?.data;

            setError(
                backendError?.detail ||
                backendError?.error ||
                error.message ||
                "Phone verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card verify-card">

                {/* Back */}
                <Link
                    to="/register"
                    className="verify-back"
                >
                    <ArrowLeft size={17} />
                    Back to registration
                </Link>

                {/* Icon */}
                <div className="verify-icon">
                    <Phone size={28} />
                </div>

                {/* Heading */}
                <div className="auth-heading">
                    <h1>Verify your phone</h1>
                    <p>
                        Enter the 6-digit OTP for your
                        mobile number.
                    </p>
                </div>

                {/* Username */}
                {usernameFromRegister && (
                    <div className="verify-user">
                        Creating account for{" "}
                        <strong>
                            {usernameFromRegister}
                        </strong>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div className="auth-success">
                        <CheckCircle2 size={18} />
                        <span>{message}</span>
                    </div>
                )}

                {/* Firebase reCAPTCHA */}
                <div id="recaptcha-container"></div>

                {/* Verification form */}
                <form
                    className="auth-form"
                    onSubmit={handleVerify}
                >
                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="verify-phone">
                            Mobile number
                        </label>

                        <div className="input-wrapper">
                            <Phone
                                size={19}
                                className="input-icon"
                            />

                            <input
                                id="verify-phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) =>
                                    setPhoneNumber(
                                        e.target.value
                                    )
                                }
                                placeholder="10-digit mobile number"
                                autoComplete="tel"
                                disabled={loading || resendLoading}
                            />
                        </div>
                    </div>

                    {/* OTP */}
                    <div className="form-group">
                        <label htmlFor="otp">
                            Verification code
                        </label>

                        <input
                            ref={otpInputRef}
                            id="otp"
                            className="otp-input"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6);

                                setOtp(value);
                            }}
                            disabled={!otpSent || loading}
                        />

                        <span className="otp-help">
                            Enter the 6-digit test code
                            configured in Firebase.
                        </span>
                    </div>

                    {/* Verify button */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={
                            loading ||
                            !otpSent ||
                            otp.length !== 6
                        }
                    >
                        {loading ? (
                            <>
                                <span className="auth-spinner" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={19} />
                                Verify phone
                            </>
                        )}
                    </button>
                </form>

                {/* Send / Resend OTP */}
                <div className="resend-section">
                    {seconds > 0 ? (
                        <span>
                            Resend OTP in{" "}
                            <strong>{seconds}s</strong>
                        </span>
                    ) : (
                        <span>
                            {otpSent
                                ? "Didn't receive the OTP?"
                                : "Ready to verify your number?"}
                        </span>
                    )}

                    <button
                        type="button"
                        className="resend-button"
                        disabled={
                            seconds > 0 ||
                            resendLoading ||
                            loading
                        }
                        onClick={handleResend}
                    >
                        {resendLoading
                            ? "Requesting..."
                            : otpSent
                                ? "Resend OTP"
                                : "Send OTP"}
                    </button>
                </div>

                {/* Login */}
                <div className="auth-footer">
                    <span>Already verified?</span>
                    <Link to="/login">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VerifyPhone;
