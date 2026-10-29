import {
    useState,
    useEffect,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
} from "lucide-react";

import {
    verifyResetOTP,
    resetPassword,
    resendPasswordOTP,
} from "../../api/auth";

import {
    verifyPhoneOtp,
    sendPhoneOtp,
} from "../../firebasePhoneAuth";

import "./ResetPassword.css";


function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const identifierFromState =
        location.state?.identifier || "";

    const messageFromState =
        location.state?.message || "";


    const [identifier, setIdentifier] =
        useState(identifierFromState);

    const [otp, setOtp] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [otpVerified, setOtpVerified] =
        useState(false);

    const [resetData, setResetData] =
        useState(null);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState(messageFromState);

    const [loading, setLoading] =
        useState(false);

    const [seconds, setSeconds] =
        useState(0);

    const [resendLoading, setResendLoading] =
        useState(false);


    // OTP resend countdown
    useEffect(() => {
        if (seconds <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setSeconds(
                (previous) => previous - 1
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);


    /*
     * Verify OTP
     */

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);

            // Verify the SMS code through Firebase.
            const result = await verifyPhoneOtp(otp);

            // Ask Django to verify the Firebase ID token
            // and issue the password-reset token.
            const data = await verifyResetOTP({
                id_token: result.idToken,
            });

            setResetData({
                uid: data.uid,
                token: data.reset_token,
            });

            setOtpVerified(true);
            setMessage("Phone verified. You can now create a new password.");
        } catch (err) {
            console.error(
                "RESET OTP ERROR:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.error ||
                err.message ||
                "Unable to verify the OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Resend OTP
     */

    const handleResend = async () => {
        setError("");
        setMessage("");

        try {
            setResendLoading(true);

            await sendPhoneOtp(
                identifier,
                "reset-password-recaptcha"
            );

            setOtp("");
            setSeconds(60);
            setMessage("A new verification code has been sent.");
        } catch (err) {
            console.error("FIREBASE OTP RESEND ERROR:", err);

            setError(
                err.message || "Unable to resend OTP."
            );
        } finally {
            setResendLoading(false);
        }
    };

    /*
     * Reset password
     */

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");

        if (!newPassword) {
            setError(
                "Enter your new password."
            );
            return;
        }

        if (
            newPassword !== confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        if (!resetData) {
            setError(
                "Please verify the OTP first."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await resetPassword({
                uid: resetData.uid,
                token: resetData.token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            setMessage(
                data.message ||
                "Password reset successfully."
            );

            setTimeout(() => {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );
            }, 1000);

        } catch (error) {
            console.error(
                "PASSWORD RESET ERROR:",
                error.response?.data || error
            );

            const backendError =
                error.response?.data;

            if (
                backendError?.confirm_password
            ) {
                setError(
                    Array.isArray(
                        backendError.confirm_password
                    )
                        ? backendError.confirm_password[0]
                        : backendError.confirm_password
                );
            } else if (
                backendError?.new_password
            ) {
                setError(
                    Array.isArray(
                        backendError.new_password
                    )
                        ? backendError.new_password[0]
                        : backendError.new_password
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
                    "Unable to reset password."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card reset-card">

                <Link
                    to="/login"
                    className="verify-back"
                >
                    <ArrowLeft size={17} />
                    Back to login
                </Link>


                <div className="verify-icon">
                    <KeyRound size={28} />
                </div>


                <div className="auth-heading">
                    <h1>
                        Reset your password
                    </h1>

                    <p>
                        {otpVerified
                            ? "Create a new password for your account."
                            : "Enter the OTP sent to your registered mobile number."
                        }
                    </p>
                </div>
                
                <div id="reset-password-recaptcha" />


                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                {message && !error && (
                    <div className="auth-success">
                        <CheckCircle2 size={18} />

                        <span>
                            {message}
                        </span>
                    </div>
                )}


                {!otpVerified ? (

                    <form
                        className="auth-form"
                        onSubmit={handleVerifyOTP}
                    >

                        <div className="form-group">

                            <label htmlFor="identifier">
                                Username or mobile number
                            </label>

                            <input
                                id="identifier"
                                className="standalone-input"
                                type="text"
                                value={identifier}
                                onChange={(e) =>
                                    setIdentifier(
                                        e.target.value
                                    )
                                }
                                placeholder="Username or mobile"
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="reset-otp">
                                Verification code
                            </label>

                            <input
                                id="reset-otp"
                                className="otp-input"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => {
                                    const value =
                                        e.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                            .slice(0, 6);

                                    setOtp(value);
                                }}
                            />

                            {/* RESEND OTP SECTION */}
                            <div className="resend-section">

                                {seconds > 0 ? (

                                    <p className="otp-help">
                                        Resend OTP in{" "}
                                        {seconds}s
                                    </p>

                                ) : (

                                    <button
                                        type="button"
                                        className="resend-button"
                                        onClick={handleResend}
                                        disabled={
                                            resendLoading ||
                                            !identifier.trim()
                                        }
                                    >
                                        {resendLoading
                                            ? "Sending..."
                                            : "Resend OTP"
                                        }
                                    </button>

                                )}

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={
                                loading ||
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
                                    Verify OTP
                                </>
                            )}
                        </button>

                    </form>

                ) : (

                    <form
                        className="auth-form"
                        onSubmit={handleResetPassword}
                    >

                        {/* New Password */}

                        <div className="form-group">

                            <label htmlFor="new-password">
                                New password
                            </label>

                            <div className="input-wrapper">

                                <LockKeyhole
                                    size={19}
                                    className="input-icon"
                                />

                                <input
                                    id="new-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
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


                        {/* Confirm */}

                        <div className="form-group">

                            <label htmlFor="confirm-password">
                                Confirm new password
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
                                    placeholder="Confirm new password"
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


                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner" />
                                    Resetting password...
                                </>
                            ) : (
                                <>
                                    <LockKeyhole size={19} />
                                    Reset password
                                </>
                            )}
                        </button>

                    </form>

                )}


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

export default ResetPassword;