import { useEffect, useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    MapPin,
    CalendarDays,
    IndianRupee,
    Clock3,
    CheckCircle2,
    Play,
    Send,
    RefreshCw,
} from "lucide-react";

import {
    getWorkerMyWorks,
    startWork,
    submitWork,
} from "../../api/works";

import "./MyWorks.css";

const FILTERS = [
    { value: "ALL", label: "All Work" },
    { value: "WORKER_SELECTED", label: "Ready to Start" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "SUBMITTED", label: "Awaiting Approval" },
    { value: "COMPLETED", label: "Completed" },
];

const STATUS_LABELS = {
    WORKER_SELECTED: "Ready to Start",
    IN_PROGRESS: "In Progress",
    SUBMITTED: "Awaiting Approval",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

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

function MyWorks() {
    const [works, setWorks] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadWorks = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getWorkerMyWorks();
            setWorks(getList(data));
        } catch (err) {
            console.error("Failed to load worker works:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load your work. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorks();
    }, []);

    const counts = useMemo(() => {
        const result = { ALL: works.length };

        FILTERS.forEach(({ value }) => {
            if (value !== "ALL") {
                result[value] = works.filter(
                    (work) => work.status === value
                ).length;
            }
        });

        return result;
    }, [works]);

    const filteredWorks = useMemo(() => {
        if (filter === "ALL") return works;

        return works.filter((work) => work.status === filter);
    }, [works, filter]);

    const handleAction = async (work, action) => {
        setProcessingId(work.id);
        setError("");
        setSuccess("");

        try {
            if (action === "start") {
                await startWork(work.id);
                setSuccess(`"${work.title}" has been started.`);
            } else {
                await submitWork(work.id);
                setSuccess(
                    `"${work.title}" has been submitted for customer approval.`
                );
            }

            await loadWorks();
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
                "The action failed. Please try again.";

            setError(message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="worker-my-works">
            <header className="my-works-header">
                <div>
                    <span className="my-works-eyebrow">
                        YOUR WORKSPACE
                    </span>
                    <h1>My Work</h1>
                    <p>
                        Manage your selected jobs and track their progress.
                    </p>
                </div>

                <button
                    type="button"
                    className="my-works-refresh"
                    onClick={loadWorks}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </header>

            <section className="my-works-summary">
                <div className="my-works-summary-icon">
                    <BriefcaseBusiness size={24} />
                </div>
                <div>
                    <span>Total Assigned Jobs</span>
                    <strong>{loading ? "—" : works.length}</strong>
                </div>
            </section>

            <div className="my-works-filters">
                {FILTERS.map((item) => (
                    <button
                        type="button"
                        key={item.value}
                        className={
                            filter === item.value
                                ? "my-works-filter active"
                                : "my-works-filter"
                        }
                        onClick={() => setFilter(item.value)}
                    >
                        {item.label}
                        <span>{loading ? "—" : counts[item.value] ?? 0}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="my-works-message error">
                    <span>{error}</span>
                    <button type="button" onClick={loadWorks}>
                        Retry
                    </button>
                </div>
            )}

            {success && (
                <div className="my-works-message success">
                    {success}
                </div>
            )}

            <div className="my-works-results-heading">
                <h2>
                    {FILTERS.find((item) => item.value === filter)?.label}
                </h2>
                <span>
                    {loading
                        ? "Loading..."
                        : `${filteredWorks.length} job${
                              filteredWorks.length === 1 ? "" : "s"
                          }`}
                </span>
            </div>

            {loading ? (
                <div className="my-works-empty">
                    <RefreshCw
                        size={28}
                        className="my-works-spinner"
                    />
                    <p>Loading your assigned work...</p>
                </div>
            ) : filteredWorks.length === 0 ? (
                <div className="my-works-empty">
                    <BriefcaseBusiness size={36} />
                    <h3>
                        {filter === "ALL"
                            ? "No assigned jobs yet"
                            : "No jobs in this category"}
                    </h3>
                    <p>
                        {filter === "ALL"
                            ? "When a customer selects your application, the job will appear here."
                            : "Your jobs will appear here when they reach this stage."}
                    </p>
                </div>
            ) : (
                <div className="my-works-grid">
                    {filteredWorks.map((work) => (
                        <article
                            className="my-work-card"
                            key={work.id}
                        >
                            <div className="my-work-card-top">
                                <span className="my-work-category">
                                    {work.category || "General"}
                                </span>

                                <span
                                    className={`my-work-status ${String(
                                        work.status
                                    ).toLowerCase()}`}
                                >
                                    {STATUS_LABELS[work.status] ||
                                        work.status}
                                </span>
                            </div>

                            <h3>{work.title}</h3>

                            <p className="my-work-description">
                                {work.description ||
                                    "No description provided."}
                            </p>

                            <div className="my-work-meta">
                                <span>
                                    <MapPin size={16} />
                                    {work.location ||
                                        "Location not specified"}
                                </span>
                                <span>
                                    <CalendarDays size={16} />
                                    {formatDate(work.work_date)}
                                </span>
                            </div>

                            <div className="my-work-budget">
                                <span>Work Budget</span>
                                <strong>
                                    <IndianRupee size={17} />
                                    {Number(
                                        work.budget || 0
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>

                            {work.status === "WORKER_SELECTED" && (
                                <button
                                    type="button"
                                    className="my-work-action start"
                                    disabled={processingId === work.id}
                                    onClick={() =>
                                        handleAction(work, "start")
                                    }
                                >
                                    <Play size={17} />
                                    {processingId === work.id
                                        ? "Starting..."
                                        : "Start Work"}
                                </button>
                            )}

                            {work.status === "IN_PROGRESS" && (
                                <button
                                    type="button"
                                    className="my-work-action submit"
                                    disabled={processingId === work.id}
                                    onClick={() =>
                                        handleAction(work, "submit")
                                    }
                                >
                                    <Send size={17} />
                                    {processingId === work.id
                                        ? "Submitting..."
                                        : "Submit Completed Work"}
                                </button>
                            )}

                            {work.status === "SUBMITTED" && (
                                <div className="my-work-info pending">
                                    <Clock3 size={17} />
                                    Waiting for the customer to approve
                                    your submitted work.
                                </div>
                            )}

                            {work.status === "COMPLETED" && (
                                <div className="my-work-info completed">
                                    <CheckCircle2 size={17} />
                                    Work completed successfully.
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyWorks;