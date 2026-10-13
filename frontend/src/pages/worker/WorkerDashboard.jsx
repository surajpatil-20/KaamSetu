import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Send,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    ArrowRight,
    Bell,
    MapPin,
    CalendarDays,
    IndianRupee,
    RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyWorks, getAvailableWorks } from "../../api/works";
import { getNotifications } from "../../api/notifications";
import "./WorkerDashboard.css";

const ACTIVE_STATUSES = ["WORKER_SELECTED", "IN_PROGRESS"];

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.works)) return data.works;
    if (Array.isArray(data?.notifications)) return data.notifications;
    return [];
}

function formatDate(date) {
    if (!date) return "Date not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function WorkerDashboard() {
    const { user } = useAuth();

    const [availableWorks, setAvailableWorks] = useState([]);
    const [myWorks, setMyWorks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const results = await Promise.allSettled([
                getAvailableWorks(),
                getMyWorks(),
                getNotifications(),
            ]);

            const [availableResult, myWorksResult, notificationResult] =
                results;

            if (availableResult.status === "fulfilled") {
                setAvailableWorks(getList(availableResult.value));
            }

            if (myWorksResult.status === "fulfilled") {
                setMyWorks(getList(myWorksResult.value));
            }

            if (notificationResult.status === "fulfilled") {
                setNotifications(getList(notificationResult.value));
            }

            const failed = results.some(
                (result) => result.status === "rejected"
            );

            if (failed) {
                setError(
                    "Some dashboard information could not be loaded. Please refresh to try again."
                );
            }
        } catch {
            setError("Unable to load dashboard information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const activeWorks = myWorks.filter((work) =>
        ACTIVE_STATUSES.includes(work.status)
    );

    const completedWorks = myWorks.filter(
        (work) => work.status === "COMPLETED"
    );

    const submittedWorks = myWorks.filter(
        (work) => work.status === "SUBMITTED"
    );

    const stats = [
        {
            label: "Available Jobs",
            value: availableWorks.length,
            icon: Search,
            className: "available",
        },
        {
            label: "Active Jobs",
            value: activeWorks.length,
            icon: BriefcaseBusiness,
            className: "active",
        },
        {
            label: "Awaiting Approval",
            value: submittedWorks.length,
            icon: Clock3,
            className: "pending",
        },
        {
            label: "Completed Jobs",
            value: completedWorks.length,
            icon: CheckCircle2,
            className: "completed",
        },
    ];

    const recentWorks = [...myWorks]
        .sort(
            (a, b) =>
                new Date(b.updated_at || b.created_at || 0) -
                new Date(a.updated_at || a.created_at || 0)
        )
        .slice(0, 4);

    const recentNotifications = notifications.slice(0, 4);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const statusLabels = {
        WORKER_SELECTED: "Worker Selected",
        IN_PROGRESS: "In Progress",
        SUBMITTED: "Awaiting Approval",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };

    return (
        <div className="worker-dashboard">
            <section className="worker-dashboard-welcome">
                <div>
                    <span className="worker-dashboard-eyebrow">
                        WORKER WORKSPACE
                    </span>

                    <h1>
                        Welcome back, {user?.username || "Worker"}!
                    </h1>

                    <p>
                        Find new opportunities and keep track of your work.
                    </p>
                </div>

                <button
                    type="button"
                    className="worker-refresh-button"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </section>

            {error && (
                <div className="worker-dashboard-error">
                    {error}
                </div>
            )}

            <section className="worker-dashboard-stats">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className="worker-stat-card"
                            key={stat.label}
                        >
                            <div
                                className={`worker-stat-icon ${stat.className}`}
                            >
                                <Icon size={22} />
                            </div>

                            <div className="worker-stat-info">
                                <span>{stat.label}</span>
                                <strong>
                                    {loading ? "—" : stat.value}
                                </strong>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="worker-dashboard-quick-actions">
                <Link
                    to="/worker/available-works"
                    className="worker-quick-action primary"
                >
                    <Search size={19} />
                    <span>Find Jobs</span>
                    <ArrowRight size={17} />
                </Link>

                <Link
                    to="/worker/applications"
                    className="worker-quick-action"
                >
                    <Send size={19} />
                    <span>My Applications</span>
                    <ArrowRight size={17} />
                </Link>

                <Link
                    to="/worker/profile"
                    className="worker-quick-action"
                >
                    <BriefcaseBusiness size={19} />
                    <span>My Profile</span>
                    <ArrowRight size={17} />
                </Link>
            </section>

            <div className="worker-dashboard-content">
                <section className="worker-dashboard-panel">
                    <div className="worker-panel-heading">
                        <div>
                            <h2>My Current Work</h2>
                            <p>Track your selected and ongoing jobs.</p>
                        </div>

                        <Link to="/worker/my-works">
                            View all <ArrowRight size={15} />
                        </Link>
                    </div>

                    {loading ? (
                        <p className="worker-dashboard-empty">
                            Loading your work...
                        </p>
                    ) : recentWorks.length === 0 ? (
                        <div className="worker-dashboard-empty">
                            <BriefcaseBusiness size={32} />
                            <h3>No assigned work yet</h3>
                            <p>
                                Explore available jobs and apply for work
                                that matches your skills.
                            </p>
                            <Link to="/worker/available-works">
                                Browse available jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="worker-recent-works">
                            {recentWorks.map((work) => (
                                <article
                                    className="worker-work-item"
                                    key={work.id}
                                >
                                    <div className="worker-work-icon">
                                        <BriefcaseBusiness size={20} />
                                    </div>

                                    <div className="worker-work-details">
                                        <h3>{work.title}</h3>

                                        <div className="worker-work-meta">
                                            <span>
                                                <MapPin size={14} />
                                                {work.location || "Location not specified"}
                                            </span>

                                            <span>
                                                <CalendarDays size={14} />
                                                {formatDate(work.work_date)}
                                            </span>
                                        </div>

                                        <span
                                            className={`worker-work-status ${String(
                                                work.status
                                            ).toLowerCase()}`}
                                        >
                                            {statusLabels[work.status] ||
                                                work.status}
                                        </span>
                                    </div>

                                    <div className="worker-work-budget">
                                        <span>Budget</span>
                                        <strong>
                                            <IndianRupee size={14} />
                                            {Number(work.budget || 0).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="worker-dashboard-panel">
                    <div className="worker-panel-heading">
                        <div>
                            <h2>Recent Notifications</h2>
                            <p>Stay updated on your work.</p>
                        </div>

                        <Link to="/worker/notifications">
                            View all <ArrowRight size={15} />
                        </Link>
                    </div>

                    {loading ? (
                        <p className="worker-dashboard-empty">
                            Loading notifications...
                        </p>
                    ) : recentNotifications.length === 0 ? (
                        <div className="worker-dashboard-empty">
                            <Bell size={30} />
                            <h3>You're all caught up!</h3>
                            <p>
                                Updates about your applications and work
                                will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="worker-notification-list">
                            {recentNotifications.map((notification) => (
                                <div
                                    className={`worker-notification-item ${
                                        notification.is_read
                                            ? ""
                                            : "unread"
                                    }`}
                                    key={notification.id}
                                >
                                    <div className="worker-notification-icon">
                                        <Bell size={17} />
                                    </div>

                                    <div>
                                        <p>
                                            {notification.message ||
                                                "You have a new notification."}
                                        </p>

                                        <span>
                                            {notification.created_at
                                                ? new Date(
                                                      notification.created_at
                                                  ).toLocaleString("en-IN", {
                                                      day: "numeric",
                                                      month: "short",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : ""}
                                        </span>
                                    </div>

                                    {!notification.is_read && (
                                        <span className="worker-unread-dot" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && unreadCount > 0 && (
                        <div className="worker-unread-summary">
                            {unreadCount} unread notification
                            {unreadCount === 1 ? "" : "s"}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default WorkerDashboard;