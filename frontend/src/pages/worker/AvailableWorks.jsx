import { useEffect, useMemo, useState } from "react";
import {
    Search,
    MapPin,
    CalendarDays,
    IndianRupee,
    BriefcaseBusiness,
    SlidersHorizontal,
    X,
    Send,
    RefreshCw,
} from "lucide-react";

import { getAvailableWorks } from "../../api/works";
import { applyToWork } from "../../api/applications";
import "./AvailableWorks.css";

const CATEGORIES = [
    { value: "ALL", label: "All Categories" },
    { value: "PAINTING", label: "Painting" },
    { value: "PLUMBING", label: "Plumbing" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "CARPENTRY", label: "Carpentry" },
    { value: "REPAIR", label: "Repair" },
    { value: "MOVING", label: "Moving" },
    { value: "OTHER", label: "Other" },
];

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.works)) return data.works;
    return [];
}

function formatDate(date) {
    if (!date) return "Not specified";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function AvailableWorks() {
    const [works, setWorks] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [applyingId, setApplyingId] = useState(null);
    const [applicationForms, setApplicationForms] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const loadWorks = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAvailableWorks();
            setWorks(getList(data));
        } catch (err) {
            console.error("Failed to load available works:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load available jobs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorks();
    }, []);

    const filteredWorks = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = works.filter((work) => {
            const matchesCategory =
                category === "ALL" || work.category === category;

            const searchableText = [
                work.title,
                work.description,
                work.location,
                work.category,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesCategory && searchableText.includes(query);
        });

        return filtered.sort((a, b) => {
            if (sort === "budget-high") {
                return Number(b.budget || 0) - Number(a.budget || 0);
            }

            if (sort === "budget-low") {
                return Number(a.budget || 0) - Number(b.budget || 0);
            }

            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );
        });
    }, [works, search, category, sort]);

    const updateApplicationForm = (workId, field, value) => {
        setApplicationForms((previous) => ({
            ...previous,
            [workId]: {
                proposed_price:
                    previous[workId]?.proposed_price ?? "",
                message: previous[workId]?.message ?? "",
                [field]: value,
            },
        }));
    };

    const handleApply = async (event, workId) => {
        event.preventDefault();

        const form = applicationForms[workId] || {
            proposed_price: "",
            message: "",
        };

        const price = Number(form.proposed_price);

        if (
            form.proposed_price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setNotice("");
            setError("Enter a valid proposed price before applying.");
            return;
        }

        setApplyingId(workId);
        setError("");
        setNotice("");

        try {
            await applyToWork(workId, {
                proposed_price: price,
                message: form.message.trim(),
            });

            setNotice("Application submitted successfully!");
            setExpandedId(null);
            setApplicationForms((previous) => {
                const next = { ...previous };
                delete next[workId];
                return next;
            });

            // Remove the job from available results after applying.
            setWorks((previous) =>
                previous.filter((work) => work.id !== workId)
            );
        } catch (err) {
            const data = err.response?.data;

            const message =
                data?.detail ||
                data?.error ||
                (data && typeof data === "object"
                    ? Object.values(data).flat().find(
                          (value) => typeof value === "string"
                      )
                    : null) ||
                "Could not submit your application. Please try again.";

            setError(message);
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className="available-works-page">
            <header className="available-works-header">
                <div>
                    <span className="available-works-eyebrow">
                        FIND YOUR NEXT OPPORTUNITY
                    </span>
                    <h1>Available Works</h1>
                    <p>
                        Discover jobs that match your skills and apply
                        with your proposed price.
                    </p>
                </div>

                <button
                    type="button"
                    className="available-refresh-button"
                    onClick={loadWorks}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </header>

            <section className="available-works-toolbar">
                <div className="available-search-box">
                    <Search size={19} />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by job, skill, or location..."
                        aria-label="Search available jobs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <X size={17} />
                        </button>
                    )}
                </div>

                <div className="available-filter-control">
                    <SlidersHorizontal size={17} />
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="Filter by category"
                    >
                        {CATEGORIES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <select
                    className="available-sort-select"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label="Sort jobs"
                >
                    <option value="newest">Newest first</option>
                    <option value="budget-high">Highest budget</option>
                    <option value="budget-low">Lowest budget</option>
                </select>
            </section>

            <div className="available-results-heading">
                <div>
                    <h2>Jobs for you</h2>
                    <p>
                        {loading
                            ? "Finding available jobs..."
                            : `${filteredWorks.length} job${
                                  filteredWorks.length === 1 ? "" : "s"
                              } found`}
                    </p>
                </div>
            </div>

            {error && (
                <div className="available-message error">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            loadWorks();
                        }}
                    >
                        Try again
                    </button>
                </div>
            )}

            {notice && (
                <div className="available-message success">
                    {notice}
                </div>
            )}

            {loading ? (
                <div className="available-empty-state">
                    <RefreshCw size={28} className="available-spinner" />
                    <p>Loading available jobs...</p>
                </div>
            ) : filteredWorks.length === 0 ? (
                <div className="available-empty-state">
                    <div className="available-empty-icon">
                        <BriefcaseBusiness size={32} />
                    </div>
                    <h3>
                        {works.length === 0
                            ? "No available jobs right now"
                            : "No matching jobs found"}
                    </h3>
                    <p>
                        {works.length === 0
                            ? "New opportunities will appear here when customers post work."
                            : "Try another search term or category."}
                    </p>

                    {(search || category !== "ALL") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("ALL");
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="available-jobs-grid">
                    {filteredWorks.map((work) => {
                        const form = applicationForms[work.id] || {
                            proposed_price: "",
                            message: "",
                        };

                        const isExpanded = expandedId === work.id;
                        const isApplying = applyingId === work.id;

                        return (
                            <article
                                className="available-job-card"
                                key={work.id}
                            >
                                <div className="available-job-card-top">
                                    <span className="available-category-badge">
                                        {CATEGORIES.find(
                                            (item) => item.value === work.category
                                        )?.label || work.category || "Other"}
                                    </span>
                                    <span className="available-open-badge">
                                        Open
                                    </span>
                                </div>

                                <h3>{work.title}</h3>

                                <p className="available-job-description">
                                    {work.description || "No description provided."}
                                </p>

                                <div className="available-job-meta">
                                    <span>
                                        <MapPin size={16} />
                                        {work.location || "Location not specified"}
                                    </span>
                                    <span>
                                        <CalendarDays size={16} />
                                        {formatDate(work.work_date)}
                                    </span>
                                </div>

                                <div className="available-job-budget">
                                    <span>Customer's budget</span>
                                    <strong>
                                        <IndianRupee size={18} />
                                        {Number(work.budget || 0).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                </div>

                                {!isExpanded ? (
                                    <button
                                        type="button"
                                        className="available-apply-button"
                                        onClick={() => {
                                            setExpandedId(work.id);
                                            setError("");
                                            setNotice("");
                                        }}
                                    >
                                        <Send size={17} />
                                        Apply for this job
                                    </button>
                                ) : (
                                    <form
                                        className="available-application-form"
                                        onSubmit={(event) =>
                                            handleApply(event, work.id)
                                        }
                                    >
                                        <div className="available-form-heading">
                                            <h4>Your application</h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedId(null)
                                                }
                                                aria-label="Close application form"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <label htmlFor={`price-${work.id}`}>
                                            Your proposed price (₹)
                                        </label>
                                        <input
                                            id={`price-${work.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={form.proposed_price}
                                            onChange={(event) =>
                                                updateApplicationForm(
                                                    work.id,
                                                    "proposed_price",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your price"
                                        />

                                        <label htmlFor={`message-${work.id}`}>
                                            Message to customer
                                        </label>
                                        <textarea
                                            id={`message-${work.id}`}
                                            rows={3}
                                            value={form.message}
                                            onChange={(event) =>
                                                updateApplicationForm(
                                                    work.id,
                                                    "message",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Explain why you're suitable for this job..."
                                        />

                                        <button
                                            type="submit"
                                            className="available-apply-button"
                                            disabled={isApplying}
                                        >
                                            <Send size={16} />
                                            {isApplying
                                                ? "Submitting..."
                                                : "Submit Application"}
                                        </button>
                                    </form>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AvailableWorks;