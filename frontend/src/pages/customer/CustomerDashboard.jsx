import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    Clock3,
    CheckCircle2,
    CircleDot,
    Plus,
    ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyWorks } from "../../api/works";

import "./CustomerDashboard.css";

function CustomerDashboard() {
    const { user } = useAuth();

    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadWorks = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyWorks();

                setWorks(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error("Failed to load works:", err);

                setError(
                    err.response?.data?.error ||
                    "Unable to load your works."
                );
            } finally {
                setLoading(false);
            }
        };

        loadWorks();
    }, []);

    const statistics = useMemo(() => {
        return {
            total: works.length,

            open: works.filter(
                (work) => work.status === "OPEN"
            ).length,

            active: works.filter((work) =>
                ["WORKER_SELECTED", "IN_PROGRESS", "SUBMITTED"].includes(
                    work.status
                )
            ).length,

            completed: works.filter(
                (work) => work.status === "COMPLETED"
            ).length,
        };
    }, [works]);

    const getStatusLabel = (status) => {
        const labels = {
            OPEN: "Open",
            WORKER_SELECTED: "Worker Selected",
            IN_PROGRESS: "In Progress",
            SUBMITTED: "Submitted",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
        };

        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        const classes = {
            OPEN: "status-open",
            WORKER_SELECTED: "status-selected",
            IN_PROGRESS: "status-progress",
            SUBMITTED: "status-submitted",
            COMPLETED: "status-completed",
            CANCELLED: "status-cancelled",
        };

        return classes[status] || "";
    };

    return (
        
            <div className="customer-dashboard">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <p className="dashboard-eyebrow">
                            CUSTOMER DASHBOARD
                        </p>

                        <h1>
                            Good morning, {user?.username || "there"} 👋
                        </h1>

                        <p className="dashboard-subtitle">
                            Manage your work and find the right workers
                            for your needs.
                        </p>
                    </div>

                    <Link
                        to="/customer/post-work"
                        className="primary-action"
                    >
                        <Plus size={18} />
                        Post New Work
                    </Link>
                </div>

                {/* Error */}
                {error && (
                    <div className="dashboard-error">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-icon">
                            <BriefcaseBusiness size={22} />
                        </div>

                        <div>
                            <p>Total Works</p>

                            <h2>
                                {loading ? "—" : statistics.total}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <CircleDot size={22} />
                        </div>

                        <div>
                            <p>Open Works</p>

                            <h2>
                                {loading ? "—" : statistics.open}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Clock3 size={22} />
                        </div>

                        <div>
                            <p>Active Works</p>

                            <h2>
                                {loading ? "—" : statistics.active}
                            </h2>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <CheckCircle2 size={22} />
                        </div>

                        <div>
                            <p>Completed</p>

                            <h2>
                                {loading ? "—" : statistics.completed}
                            </h2>
                        </div>
                    </div>

                </div>

                {/* Recent Works */}
                <section className="recent-works-section">

                    <div className="section-header">
                        <div>
                            <h2>Recent Works</h2>
                            <p>
                                Your latest posted work
                            </p>
                        </div>

                        <Link
                            to="/customer/works"
                            className="view-all-link"
                        >
                            View all
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="dashboard-empty">
                            Loading your works...
                        </div>
                    ) : works.length === 0 ? (
                        <div className="dashboard-empty">
                            <BriefcaseBusiness size={36} />

                            <h3>No works yet</h3>

                            <p>
                                Post your first work and start finding
                                the right worker.
                            </p>

                            <Link
                                to="/customer/post-work"
                                className="empty-action"
                            >
                                Post Your First Work
                            </Link>
                        </div>
                    ) : (
                        <div className="works-list">

                            {works.slice(0, 5).map((work) => (
                                <div
                                    className="work-card"
                                    key={work.id}
                                >
                                    <div className="work-card-main">

                                        <div>
                                            <h3>
                                                {work.title}
                                            </h3>

                                            <p className="work-location">
                                                {work.location}
                                            </p>

                                            <p className="work-date">
                                                Work date:{" "}
                                                {work.work_date}
                                            </p>
                                        </div>

                                        <div className="work-card-right">

                                            <strong>
                                                ₹{work.budget}
                                            </strong>

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    work.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    work.status
                                                )}
                                            </span>

                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </section>

            </div>
    );
}

export default CustomerDashboard;