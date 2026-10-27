
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    KeyRound,
    Eye,
    EyeOff,
    ShieldCheck,
    LockKeyhole,
} from "lucide-react";

import { changePassword } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import "./ChangePassword.css";

function ChangePassword() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [visible, setVisible] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const toggleVisibility = (field) => {
        setVisible((previous) => ({
            ...previous,
            [field]: !previous[field],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            !form.current_password ||
            !form.new_password ||
            !form.confirm_password
        ) {
            setError("Please fill in all password fields.");
            return;
        }

        if (form.new_password !== form.confirm_password) {
            setError("Your new passwords do not match.");
            return;
        }

        if (form.current_password === form.new_password) {
            setError(
                "Your new password must differ from your current password."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword(form);

            setSuccess(
                response.message || "Password changed successfully."
            );

            setForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (err) {
            const data = err.response?.data;

            const message =
                data?.detail ||
                data?.current_password?.[0] ||
                data?.new_password?.[0] ||
                data?.confirm_password?.[0] ||
                "Unable to change password. Please try again.";

            setError(
                typeof message === "string"
                    ? message
                    : "Please check your password details."
            );
        } finally {
            setLoading(false);
        }
    };

    const dashboardPath =
        user?.role?.toUpperCase() === "CUSTOMER"
            ? "/customer/dashboard"
            : "/worker/dashboard";

    const passwordFields = [
        {
            name: "current_password",
            label: "Current password",
            key: "current",
            placeholder: "Enter current password",
        },
        {
            name: "new_password",
            label: "New password",
            key: "new",
            placeholder: "Enter new password",
        },
        {
            name: "confirm_password",
            label: "Confirm new password",
            key: "confirm",
            placeholder: "Re-enter new password",
        },
    ];

    return (
        <div className="change-password-page">
            <div className="change-password-container">
                <Link
                    to={dashboardPath}
                    className="change-password-back"
                >
                    <ArrowLeft size={17} />
                    Back to Dashboard
                </Link>

                <section className="change-password-card">
                    <div className="change-password-icon">
                        <KeyRound size={27} />
                    </div>

                    <span className="change-password-eyebrow">
                        ACCOUNT SECURITY
                    </span>

                    <h1>Change Password</h1>

                    <p className="change-password-description">
                        Update your password to keep your KaamSetu
                        account secure.
                    </p>

                    {error && (
                        <div
                            className="change-password-alert error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="change-password-alert success"
                            role="status"
                        >
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {passwordFields.map((field) => (
                            <div
                                className="change-password-field"
                                key={field.name}
                            >
                                <label htmlFor={field.name}>
                                    {field.label}
                                </label>

                                <div className="change-password-input-wrap">
                                    <LockKeyhole
                                        size={18}
                                        className="change-password-input-icon"
                                    />

                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={
                                            visible[field.key]
                                                ? "text"
                                                : "password"
                                        }
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        autoComplete={
                                            field.name === "current_password"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="change-password-toggle"
                                        onClick={() =>
                                            toggleVisibility(field.key)
                                        }
                                        aria-label={
                                            visible[field.key]
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {visible[field.key] ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="change-password-tip">
                            <ShieldCheck size={18} />
                            <span>
                                Choose a strong password you don't use
                                on other websites.
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="change-password-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating password..."
                                : "Update Password"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ChangePassword;
