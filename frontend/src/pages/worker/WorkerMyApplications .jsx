
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../../api/applications";
import "./WorkerMyApplications .css";

const FILTERS = [
    { label: "All Applications", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Rejected", value: "REJECTED" },
];

const STATUS_STYLES = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
};

function formatDate(date) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === "") {
        return "Not specified";
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) return amount;

    return value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    });
}

function getWorkTitle(application) {
    if (application.work && typeof application.work === "object") {
        return application.work.title || "Untitled Work";
    }

    return "Work #" + (application.work ?? "Unknown");
}

function getWorkId(application) {
    if (application.work && typeof application.work === "object") {
        return application.work.id;
    }

    return application.work;
}

function WorkerMyApplications () {
    const [applications, setApplications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyApplications();

                if (isMounted) {
                    // DRF pagination may return results inside `results`.
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                            ? data.results
                            : [];

                    setApplications(list);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.detail ||
                        "Unable to load your applications. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchApplications();

        return () => {
            isMounted = false;
        };
    }, []);

    const counts = useMemo(() => {
        return {
            ALL: applications.length,
            PENDING: applications.filter(
                (item) => item.status === "PENDING"
            ).length,
            ACCEPTED: applications.filter(
                (item) => item.status === "ACCEPTED"
            ).length,
            REJECTED: applications.filter(
                (item) => item.status === "REJECTED"
            ).length,
        };
    }, [applications]);

    const filteredApplications = useMemo(() => {
        if (activeFilter === "ALL") return applications;

        return applications.filter(
            (application) => application.status === activeFilter
        );
    }, [applications, activeFilter]);

    if (loading) {
        return (
            <div className="my-applications-page">
                <div className="applications-message">
                    <div className="applications-spinner" />
                    <p>Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-applications-page">
            <header className="applications-header">
                <div>
                    <span className="applications-eyebrow">
                        WORKER WORKSPACE
                    </span>
                    <h1>My Applications</h1>
                    <p>
                        Track the jobs you've applied for and check their
                        latest status.
                    </p>
                </div>

                <Link
                    to="/worker/works"
                    className="applications-browse-button"
                >
                    Browse Jobs
                </Link>
            </header>

            {error && (
                <div className="applications-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="applications-stats">
                <div className="applications-stat-card">
                    <span>Total Applications</span>
                    <strong>{counts.ALL}</strong>
                </div>

                <div className="applications-stat-card">
                    <span>Pending</span>
                    <strong>{counts.PENDING}</strong>
                </div>

                <div className="applications-stat-card">
                    <span>Accepted</span>
                    <strong>{counts.ACCEPTED}</strong>
                </div>

                <div className="applications-stat-card">
                    <span>Rejected</span>
                    <strong>{counts.REJECTED}</strong>
                </div>
            </section>

            <section className="applications-list-section">
                <div className="applications-list-heading">
                    <div>
                        <h2>Your Applications</h2>
                        <p>
                            {filteredApplications.length} application
                            {filteredApplications.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div
                    className="applications-filters"
                    role="group"
                    aria-label="Filter applications by status"
                >
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            className={
                                activeFilter === filter.value
                                    ? "applications-filter active"
                                    : "applications-filter"
                            }
                            onClick={() => setActiveFilter(filter.value)}
                        >
                            {filter.label}
                            <span>{counts[filter.value]}</span>
                        </button>
                    ))}
                </div>

                {error ? null : filteredApplications.length === 0 ? (
                    <div className="applications-empty">
                        <div className="applications-empty-icon">📋</div>

                        <h3>
                            {applications.length === 0
                                ? "No applications yet"
                                : "No applications in this category"}
                        </h3>

                        <p>
                            {applications.length === 0
                                ? "Browse available jobs and apply for work that matches your skills."
                                : "Try selecting another status filter."}
                        </p>

                        {applications.length === 0 && (
                            <Link
                                to="/worker/works"
                                className="applications-browse-button"
                            >
                                Explore Available Jobs
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="applications-cards">
                        {filteredApplications.map((application) => {
                            const status =
                                STATUS_STYLES[application.status] || "pending";

                            const workId = getWorkId(application);

                            return (
                                <article
                                    className="application-card"
                                    key={application.id}
                                >
                                    <div className="application-card-top">
                                        <div className="application-work-info">
                                            <span className="application-id">
                                                Application #
                                                {application.id}
                                            </span>

                                            <h3>
                                                {getWorkTitle(application)}
                                            </h3>

                                            {application.work &&
                                                typeof application.work ===
                                                    "object" &&
                                                application.work.category && (
                                                    <span className="application-category">
                                                        {application.work.category.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </span>
                                                )}
                                        </div>

                                        <span
                                            className={`application-status ${status}`}
                                        >
                                            {application.status || "UNKNOWN"}
                                        </span>
                                    </div>

                                    <div className="application-details-grid">
                                        <div className="application-detail">
                                            <span>Proposed Price</span>
                                            <strong>
                                                {formatCurrency(
                                                    application.proposed_price
                                                )}
                                            </strong>
                                        </div>

                                        <div className="application-detail">
                                            <span>Applied On</span>
                                            <strong>
                                                {formatDate(
                                                    application.applied_at
                                                )}
                                            </strong>
                                        </div>

                                        {application.work &&
                                            typeof application.work ===
                                                "object" &&
                                            application.work.budget !==
                                                undefined && (
                                                <div className="application-detail">
                                                    <span>Customer Budget</span>
                                                    <strong>
                                                        {formatCurrency(
                                                            application.work
                                                                .budget
                                                        )}
                                                    </strong>
                                                </div>
                                            )}
                                    </div>

                                    {application.message && (
                                        <div className="application-message">
                                            <span>Your Message</span>
                                            <p>{application.message}</p>
                                        </div>
                                    )}

                                    {application.status === "ACCEPTED" && (
                                        <div className="application-notice accepted-notice">
                                            You've been selected for this job!
                                            Check My Works to start it when
                                            you're ready.
                                        </div>
                                    )}

                                    {application.status === "REJECTED" && (
                                        <div className="application-notice rejected-notice">
                                            This application was not selected.
                                            You can continue browsing other jobs.
                                        </div>
                                    )}

                                    <div className="application-card-footer">
                                        {workId && (
                                            <Link
                                                to={`/worker/my-works`}
                                                className="application-view-button"
                                            >
                                                {application.status ===
                                                "ACCEPTED"
                                                    ? "Go to My Works"
                                                    : "View My Works"}
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default WorkerMyApplications ;
