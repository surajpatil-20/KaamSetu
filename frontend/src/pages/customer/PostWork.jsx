import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    IndianRupee,
    MapPin,
    FileText,
} from "lucide-react";

import { createWork } from "../../api/works";

import "./PostWork.css";

function PostWork() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        budget: "",
        location: "",
        work_date: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.title.trim()) {
            setError("Please enter a work title.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please describe the work.");
            return;
        }

        if (!formData.category) {
            setError("Please select a category.");
            return;
        }

        if (!formData.budget || Number(formData.budget) <= 0) {
            setError("Please enter a valid budget.");
            return;
        }

        if (!formData.location.trim()) {
            setError("Please enter the work location.");
            return;
        }

        if (!formData.work_date) {
            setError("Please select the work date.");
            return;
        }

        try {
            setLoading(true);

            const work = await createWork({
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                budget: formData.budget,
                location: formData.location.trim(),
                work_date: formData.work_date,
            });

            navigate(`/customer/works/${work.id}`);
        } catch (err) {
            console.error("Failed to create work:", err);

            const backendError = err.response?.data;

            if (backendError?.error) {
                setError(backendError.error);
            } else if (typeof backendError === "object") {
                const firstError = Object.values(backendError)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to create work."
                );
            } else {
                setError("Failed to create work. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (

            <div className="post-work-page">

                {/* Header */}

                <div className="post-work-header">

                    <Link
                        to="/customer/dashboard"
                        className="back-link"
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </Link>

                    <div>
                        <p className="page-eyebrow">
                            CUSTOMER
                        </p>

                        <h1>
                            Post a New Work
                        </h1>

                        <p>
                            Tell us what work you need and find the
                            right worker.
                        </p>
                    </div>

                </div>


                {/* Form */}

                <form
                    className="post-work-form"
                    onSubmit={handleSubmit}
                >

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}


                    {/* Basic Information */}

                    <section className="form-section">

                        <div className="form-section-header">
                            <div className="form-section-icon">
                                <BriefcaseBusiness size={19} />
                            </div>

                            <div>
                                <h2>
                                    Work Details
                                </h2>

                                <p>
                                    Describe the work you need.
                                </p>
                            </div>
                        </div>


                        {/* Title */}

                        <div className="form-group">

                            <label htmlFor="title">
                                Work Title
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Paint my 2BHK house"
                                maxLength={200}
                            />

                        </div>


                        {/* Description */}

                        <div className="form-group">

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the work in detail..."
                                rows={5}
                            />

                        </div>


                        {/* Category */}

                        <div className="form-group">

                            <label htmlFor="category">
                                Category
                            </label>

                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select a category
                                </option>

                                <option value="PAINTING">
                                    Painting
                                </option>

                                <option value="PLUMBING">
                                    Plumbing
                                </option>

                                <option value="ELECTRICAL">
                                    Electrical
                                </option>

                                <option value="CLEANING">
                                    Cleaning
                                </option>

                                <option value="CARPENTRY">
                                    Carpentry
                                </option>

                                <option value="REPAIR">
                                    Repair
                                </option>

                                <option value="MOVING">
                                    Moving
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>

                        </div>

                    </section>


                    {/* Budget & Location */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <div className="form-section-icon">
                                <IndianRupee size={19} />
                            </div>

                            <div>
                                <h2>
                                    Budget & Location
                                </h2>

                                <p>
                                    Help workers understand your
                                    requirements.
                                </p>
                            </div>

                        </div>


                        <div className="form-grid">

                            {/* Budget */}

                            <div className="form-group">

                                <label htmlFor="budget">
                                    Budget
                                </label>

                                <div className="input-with-icon">

                                    <IndianRupee size={16} />

                                    <input
                                        id="budget"
                                        name="budget"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="15000"
                                    />

                                </div>

                            </div>


                            {/* Date */}

                            <div className="form-group">

                                <label htmlFor="work_date">
                                    Work Date
                                </label>

                                <div className="input-with-icon">

                                    <CalendarDays size={16} />

                                    <input
                                        id="work_date"
                                        name="work_date"
                                        type="date"
                                        value={formData.work_date}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Location */}

                        <div className="form-group">

                            <label htmlFor="location">
                                Location
                            </label>

                            <div className="input-with-icon">

                                <MapPin size={16} />

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Rankala, Kolhapur"
                                />

                            </div>

                        </div>

                    </section>


                    {/* Submit */}

                    <div className="form-actions">

                        <Link
                            to="/customer/dashboard"
                            className="cancel-button"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="submit-work-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Posting..."
                                : "Post Work"
                            }
                        </button>

                    </div>

                </form>

            </div>

    );
}

export default PostWork;