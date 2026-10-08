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

import {
    verifyPhone,
    resendPhoneOTP,
} from "../../api/auth";

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

    const [otp, setOtp] =
        useState("");

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    const [seconds, setSeconds] =
        useState(0);

    const otpInputRef = useRef(null);


    /*
     * Countdown
     */

    useEffect(() => {

        if (seconds <= 0) {
            return;
        }

        const timer = setInterval(() => {

            setSeconds((previous) =>
                previous - 1
            );

        }, 1000);

        return () => clearInterval(timer);

    }, [seconds]);


    /*
     * Focus OTP input
     */

    useEffect(() => {

        otpInputRef.current?.focus();

    }, []);


    const formatPhone = (phone) => {

        const cleaned =
            phone
                .replace(/\s/g, "")
                .replace(/-/g, "");

        if (cleaned.startsWith("+91")) {
            return cleaned;
        }

        return `+91${cleaned}`;
    };


    const handleVerify = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        const cleanPhone =
            phoneNumber
                .replace(/\s/g, "")
                .replace(/-/g, "");

        if (!/^(?:\+91)?\d{10}$/.test(
            cleanPhone
        )) {

            setError(
                "Enter a valid 10-digit Indian mobile number."
            );

            return;
        }

        if (!/^\d{6}$/.test(otp)) {

            setError(
                "Enter the 6-digit OTP."
            );

            return;
        }

        try {

            setLoading(true);

            const data = await verifyPhone({
                phone_number: formatPhone(
                    cleanPhone
                ),
                otp,
            });

            setMessage(
                data.message ||
                "Phone number verified successfully."
            );

            /*
             * Give the user a moment to see
             * the success message.
             */

            setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

            }, 900);

        } catch (error) {

            console.error(
                "PHONE VERIFICATION ERROR:",
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

            } else if (
                typeof backendError === "string"
            ) {

                setError(
                    backendError
                );

            } else {

                setError(
                    "Invalid or expired OTP."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    /*
     * Resend placeholder
     *
     * The backend currently has no dedicated
     * resend-phone-OTP endpoint.
     *
     * We will connect this after adding it
     * properly on the backend.
     */

    const handleResend = async () => {

        setError("");
        setMessage("");
        
        try {
        
            setResendLoading(true);
        
            const data = await resendPhoneOTP({
                phone_number: formatPhone(
                    phoneNumber
                ),
            });
        
            setMessage(
                data.message ||
                "If the account exists and is not verified, a new OTP has been sent."
            );
        
            setSeconds(60);
        
            setOtp("");
        
            otpInputRef.current?.focus();
        
        } catch (error) {
        
            console.error(
                "RESEND OTP ERROR:",
                error.response?.data || error
            );
        
            const backendError =
                error.response?.data;
        
            setError(
                backendError?.detail ||
                backendError?.error ||
                "Unable to resend OTP."
            );
        
        } finally {
        
            setResendLoading(false);
        
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

                    <h1>
                        Verify your phone
                    </h1>

                    <p>
                        Enter the 6-digit OTP sent to
                        your mobile number.
                    </p>

                </div>


                {/* Username */}

                {usernameFromRegister && (

                    <div className="verify-user">

                        Creating account for
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

                        <span>
                            {message}
                        </span>

                    </div>

                )}


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

                        <span className="otp-help">
                            Enter the 6-digit code
                            received on your phone.
                        </span>

                    </div>


                    {/* Verify */}

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
                                Verify phone
                            </>
                        )}

                    </button>

                </form>


                {/* Resend */}

                <div className="resend-section">

                    {seconds > 0 ? (

                        <span>
                            Resend OTP in{" "}
                            <strong>
                                {seconds}s
                            </strong>
                        </span>

                    ) : (

                        <span>
                            Didn't receive the OTP?
                        </span>

                    )}

                    <button
                        type="button"
                        className="resend-button"
                        disabled={
                            seconds > 0 ||
                            resendLoading
                        }
                        onClick={handleResend}
                    >
                        Resend OTP
                    </button>

                </div>


                {/* Login */}

                <div className="auth-footer">

                    <span>
                        Already verified?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default VerifyPhone;