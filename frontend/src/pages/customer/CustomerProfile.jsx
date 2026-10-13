import { useEffect, useState } from "react";
import { UserRound, Camera, Save, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/auth";
import "./CustomerProfile.css";

export default function CustomerProfile() {
    const { user, setUser } = useAuth();

    const [form, setForm] = useState({
        username: "",
        email: "",
        about: "",
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const data = await getProfile();

                if (!active) return;

                setForm({
                    username: data.username || "",
                    email: data.email || "",
                    about: data.about || "",
                });

                setPhotoPreview(data.profile_photo || "");
                setUser(data);
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.detail ||
                        "Unable to load your profile."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, [setUser]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be 5 MB or less.");
            return;
        }

        setProfilePhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const data = new FormData();

            data.append("username", form.username.trim());
            data.append("email", form.email.trim());
            data.append("about", form.about.trim());

            if (profilePhoto) {
                data.append("profile_photo", profilePhoto);
            }

            const updatedProfile = await updateProfile(data);

            setUser(updatedProfile);

            setForm({
                username: updatedProfile.username || "",
                email: updatedProfile.email || "",
                about: updatedProfile.about || "",
            });

            setPhotoPreview(updatedProfile.profile_photo || "");
            setProfilePhoto(null);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            const responseData = err.response?.data;

            if (responseData && typeof responseData === "object") {
                const firstError = Object.values(responseData)
                    .flat()
                    .find((item) => typeof item === "string");

                setError(firstError || "Failed to update profile.");
            } else {
                setError("Failed to update profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="customer-profile-loading">
                <LoaderCircle className="profile-spinner" size={28} />
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="customer-profile-page">
            <div className="customer-profile-heading">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your personal information and profile photo.</p>
                </div>
            </div>

            <form
                className="customer-profile-card"
                onSubmit={handleSubmit}
            >
                <div className="customer-profile-photo-section">
                    <div className="customer-profile-avatar">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                            />
                        ) : (
                            <UserRound size={48} />
                        )}
                    </div>

                    <div className="customer-profile-photo-info">
                        <h3>Profile Photo</h3>
                        <p>Choose an image up to 5 MB.</p>

                        <label
                            className="customer-profile-upload"
                            htmlFor="profile-photo"
                        >
                            <Camera size={17} />
                            Change Photo
                        </label>

                        <input
                            id="profile-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            hidden
                        />
                    </div>
                </div>

                <div className="customer-profile-divider" />

                <div className="customer-profile-fields">
                    <div className="customer-profile-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            required
                            maxLength={150}
                        />
                    </div>

                    <div className="customer-profile-field">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="customer-profile-field customer-profile-phone">
                        <label>Phone Number</label>
                                        
                        <div className="customer-profile-verification">
                            <span>
                                {user?.phone_number || "No account phone added"}
                            </span>
                                        
                            <span
                                className={
                                    user?.phone_verified
                                        ? "profile-status verified"
                                        : "profile-status unverified"
                                }
                            >
                                {user?.phone_verified ? "Verified" : "Not verified"}
                            </span>
                        </div>
                            
                        <small>
                            Your account phone number is used for verification.
                            Changes should be verified through OTP.
                        </small>
                    </div>

                    <div className="customer-profile-field customer-profile-about">
                        <label htmlFor="about">About Me</label>

                        <textarea
                            id="about"
                            name="about"
                            value={form.about}
                            onChange={handleChange}
                            placeholder="Tell us a little about yourself..."
                            maxLength={500}
                            rows={4}
                        />

                        <small>
                            {form.about.length}/500 characters
                        </small>
                    </div>

                </div>

                {error && (
                    <div className="customer-profile-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="customer-profile-message success">
                        {success}
                    </div>
                )}

                <div className="customer-profile-actions">
                    <button
                        type="submit"
                        className="customer-profile-save"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="profile-spinner"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}