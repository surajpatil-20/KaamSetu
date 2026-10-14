
import { useEffect, useState } from "react";
import {
    UserRound,
    Camera,
    Save,
    LoaderCircle,
    BriefcaseBusiness,
    IndianRupee,
    Pencil,
    X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/auth";
import "./WorkerProfile.css";

export default function WorkerProfile() {
    const { user, setUser } = useAuth();

    const [form, setForm] = useState({
        username: "",
        email: "",
        bio: "",
        skills: "",
        experience: "0",
        hourly_rate: "",
    });

    const [savedForm, setSavedForm] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [savedPhotoPreview, setSavedPhotoPreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const data = await getProfile();

                if (!active) return;

                const profileData = {
                    username: data.username || "",
                    email: data.email || "",
                    bio: data.bio || "",
                    skills: data.skills || "",
                    experience: String(data.experience ?? 0),
                    hourly_rate: data.hourly_rate ?? "",
                };

                setForm(profileData);
                setSavedForm(profileData);

                const profilePhoto = data.profile_photo || "";

                setPhotoPreview(profilePhoto);
                setSavedPhotoPreview(profilePhoto);
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
            setError("Please select a valid image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be 5 MB or less.");
            event.target.value = "";
            return;
        }

        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError("");
        setSuccess("");
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        if (savedForm) {
            setForm({ ...savedForm });
        }

        setPhoto(null);
        setPhotoPreview(savedPhotoPreview);
        setIsEditing(false);
        setError("");
        setSuccess("");

        const photoInput = document.getElementById(
            "worker-profile-photo"
        );

        if (photoInput) {
            photoInput.value = "";
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isEditing) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const data = new FormData();

            data.append("username", form.username.trim());
            data.append("email", form.email.trim());
            data.append("bio", form.bio.trim());
            data.append("skills", form.skills.trim());
            data.append("experience", form.experience);
            data.append("hourly_rate", form.hourly_rate);

            if (photo) {
                data.append("profile_photo", photo);
            }

            const updatedProfile = await updateProfile(data);

            const updatedForm = {
                username: updatedProfile.username || "",
                email: updatedProfile.email || "",
                bio: updatedProfile.bio || "",
                skills: updatedProfile.skills || "",
                experience: String(
                    updatedProfile.experience ?? 0
                ),
                hourly_rate: updatedProfile.hourly_rate ?? "",
            };

            const updatedPhoto =
                updatedProfile.profile_photo || "";

            setUser(updatedProfile);
            setForm(updatedForm);
            setSavedForm(updatedForm);

            setPhotoPreview(updatedPhoto);
            setSavedPhotoPreview(updatedPhoto);
            setPhoto(null);

            const photoInput = document.getElementById(
                "worker-profile-photo"
            );

            if (photoInput) {
                photoInput.value = "";
            }

            setIsEditing(false);
            setSuccess("Worker profile updated successfully!");
        } catch (err) {
            const responseData = err.response?.data;

            if (responseData && typeof responseData === "object") {
                const firstError = Object.values(responseData)
                    .flat()
                    .find((item) => typeof item === "string");

                setError(firstError || "Failed to update profile.");
            } else {
                setError(
                    "Failed to update profile. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="worker-profile-loading">
                <LoaderCircle
                    className="worker-profile-spinner"
                    size={28}
                />
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="worker-profile-page">
            <div className="worker-profile-heading">
                <div>
                    <h1>My Professional Profile</h1>
                    <p>
                        Showcase your experience and skills to attract
                        customers.
                    </p>
                </div>

                {!isEditing && (
                    <button
                        type="button"
                        className="worker-profile-edit"
                        onClick={handleEdit}
                    >
                        <Pencil size={17} />
                        Edit Profile
                    </button>
                )}
            </div>

            <form
                className="worker-profile-card"
                onSubmit={handleSubmit}
            >
                <div className="worker-profile-photo-section">
                    <div className="worker-profile-avatar">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Worker profile"
                            />
                        ) : (
                            <UserRound size={46} />
                        )}
                    </div>

                    <div className="worker-profile-photo-info">
                        <h3>Profile Photo</h3>
                        <p>
                            Use a clear photo so customers can recognize
                            you.
                        </p>

                        {isEditing && (
                            <>
                                <label
                                    htmlFor="worker-profile-photo"
                                    className="worker-profile-upload"
                                >
                                    <Camera size={17} />
                                    Change Photo
                                </label>

                                <input
                                    id="worker-profile-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="worker-profile-divider" />

                <div className="worker-profile-section-title">
                    <UserRound size={19} />
                    <h2>Personal Information</h2>
                </div>

                <div className="worker-profile-fields">
                    <div className="worker-profile-field">
                        <label htmlFor="worker-username">
                            Username
                        </label>
                        <input
                            id="worker-username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            maxLength={150}
                            required
                            disabled={!isEditing || saving}
                        />
                    </div>

                    <div className="worker-profile-field">
                        <label htmlFor="worker-email">
                            Email Address
                        </label>
                        <input
                            id="worker-email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={!isEditing || saving}
                        />
                    </div>

                    <div className="worker-profile-field full-width">
                        <label>Account Phone Number</label>

                        <div className="worker-profile-verification">
                            <span>
                                {user?.phone_number ||
                                    "No account phone added"}
                            </span>

                            <span
                                className={
                                    user?.phone_verified
                                        ? "worker-profile-status verified"
                                        : "worker-profile-status unverified"
                                }
                            >
                                {user?.phone_verified
                                    ? "Verified"
                                    : "Not verified"}
                            </span>
                        </div>

                        <small>
                            Your account phone number is managed through
                            phone verification.
                        </small>
                    </div>
                </div>

                <div className="worker-profile-divider" />

                <div className="worker-profile-section-title">
                    <BriefcaseBusiness size={19} />
                    <h2>Professional Information</h2>
                </div>

                <div className="worker-profile-fields">
                    <div className="worker-profile-field full-width">
                        <label htmlFor="worker-bio">
                            About Me
                        </label>
                        <textarea
                            id="worker-bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Introduce yourself and describe your work..."
                            rows={4}
                            maxLength={1000}
                            disabled={!isEditing || saving}
                        />
                        <small>
                            {form.bio.length}/1000 characters
                        </small>
                    </div>

                    <div className="worker-profile-field full-width">
                        <label htmlFor="worker-skills">
                            Skills and Services
                        </label>
                        <textarea
                            id="worker-skills"
                            name="skills"
                            value={form.skills}
                            onChange={handleChange}
                            placeholder="e.g. Plumbing, pipe fitting, bathroom repairs"
                            rows={3}
                            maxLength={1000}
                            disabled={!isEditing || saving}
                        />
                        <small>
                            Separate your skills with commas to make them
                            easier for customers to read.
                        </small>
                    </div>

                    <div className="worker-profile-field">
                        <label htmlFor="worker-experience">
                            Years of Experience
                        </label>
                        <input
                            id="worker-experience"
                            name="experience"
                            type="number"
                            min="0"
                            step="1"
                            value={form.experience}
                            onChange={handleChange}
                            required
                            disabled={!isEditing || saving}
                        />
                    </div>

                    <div className="worker-profile-field">
                        <label htmlFor="worker-hourly-rate">
                            Hourly Rate (₹)
                        </label>

                        <div className="worker-profile-rate-input">
                            <IndianRupee size={17} />
                            <input
                                id="worker-hourly-rate"
                                name="hourly_rate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.hourly_rate}
                                onChange={handleChange}
                                placeholder="e.g. 250"
                                disabled={!isEditing || saving}
                            />
                        </div>

                        <small>
                            Leave blank if you don't want to specify a rate.
                        </small>
                    </div>
                </div>

                {error && (
                    <div className="worker-profile-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="worker-profile-message success">
                        {success}
                    </div>
                )}

                {isEditing && (
                    <div className="worker-profile-actions">
                        <button
                            type="button"
                            className="worker-profile-cancel"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <X size={18} />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="worker-profile-save"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="worker-profile-spinner"
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
                )}
            </form>
        </div>
    );
}
