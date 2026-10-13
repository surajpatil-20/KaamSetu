
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../api/notifications";
import "./WorkerNotifications.css";

const notificationConfig = {
    WORKER_SELECTED: {
        icon: "✓",
        title: "You've been selected!",
        className: "selected",
        link: "/worker/my-works",
        linkText: "View My Works",
    },
    APPLICATION_REJECTED: {
        icon: "×",
        title: "Application update",
        className: "rejected",
        link: "/worker/applications",
        linkText: "View Applications",
    },
    WORK_SUBMITTED: {
        icon: "↗",
        title: "Work submitted",
        className: "submitted",
        link: "/worker/my-works",
        linkText: "View My Works",
    },
    WORK_COMPLETED: {
        icon: "✓",
        title: "Work completed",
        className: "completed",
        link: "/worker/my-works",
        linkText: "View My Works",
    },
    REVIEW_RECEIVED: {
        icon: "★",
        title: "New review",
        className: "review",
        link: null,
        linkText: null,
    },
};

function formatNotificationDate(date) {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function WorkerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getNotifications();

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.results)
                    ? data.results
                    : [];

            setNotifications(list);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load notifications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const filteredNotifications = notifications.filter((notification) => {
        if (activeFilter === "UNREAD") return !notification.is_read;
        return true;
    });

    const handleMarkRead = async (notificationId) => {
        try {
            setActionLoading(notificationId);
            setError("");

            await markNotificationRead(notificationId);

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to mark this notification as read."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setActionLoading("all");
            setError("");

            await markAllNotificationsRead();

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to mark all notifications as read."
            );
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="worker-notifications-page">
            <header className="worker-notifications-header">
                <div>
                    <span className="worker-notifications-eyebrow">
                        WORKER WORKSPACE
                    </span>

                    <h1>Notifications</h1>

                    <p>
                        Stay updated on your applications and assigned work.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        className="worker-mark-all-button"
                        onClick={handleMarkAllRead}
                        disabled={actionLoading !== null}
                    >
                        {actionLoading === "all"
                            ? "Marking..."
                            : "Mark all as read"}
                    </button>
                )}
            </header>

            <section className="worker-notification-summary">
                <div className="worker-notification-summary-icon">
                    <span>♧</span>
                </div>

                <div>
                    <strong>
                        {unreadCount === 0
                            ? "You're all caught up!"
                            : `You have ${unreadCount} unread notification${
                                  unreadCount === 1 ? "" : "s"
                              }`}
                    </strong>

                    <p>
                        Important updates about your work appear here.
                    </p>
                </div>
            </section>

            {error && (
                <div className="worker-notifications-error" role="alert">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchNotifications}
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            )}

            <section className="worker-notifications-content">
                <div className="worker-notifications-toolbar">
                    <div>
                        <h2>Recent Activity</h2>
                        <p>
                            {notifications.length} notification
                            {notifications.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    <div
                        className="worker-notification-filters"
                        role="group"
                        aria-label="Filter notifications"
                    >
                        <button
                            type="button"
                            className={
                                activeFilter === "ALL"
                                    ? "worker-notification-filter active"
                                    : "worker-notification-filter"
                            }
                            onClick={() => setActiveFilter("ALL")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                activeFilter === "UNREAD"
                                    ? "worker-notification-filter active"
                                    : "worker-notification-filter"
                            }
                            onClick={() => setActiveFilter("UNREAD")}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="worker-notifications-state">
                        <div className="worker-notifications-spinner" />
                        <p>Loading your notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="worker-notifications-state">
                        <div className="worker-notifications-empty-icon">
                            ♧
                        </div>

                        <h3>
                            {notifications.length === 0
                                ? "No notifications yet"
                                : "No unread notifications"}
                        </h3>

                        <p>
                            {notifications.length === 0
                                ? "When customers select you or your work status changes, updates will appear here."
                                : "You're up to date. Check back later for new updates."}
                        </p>

                        {notifications.length === 0 && (
                            <Link
                                to="/worker/works"
                                className="worker-notifications-browse"
                            >
                                Browse Available Jobs
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="worker-notification-list">
                        {filteredNotifications.map((notification) => {
                            const config =
                                notificationConfig[
                                    notification.notification_type
                                ] || {
                                    icon: "i",
                                    title: "Notification",
                                    className: "general",
                                    link: null,
                                    linkText: null,
                                };

                            return (
                                <article
                                    key={notification.id}
                                    className={`worker-notification-card ${
                                        notification.is_read
                                            ? "read"
                                            : "unread"
                                    }`}
                                >
                                    <div
                                        className={`worker-notification-icon ${config.className}`}
                                    >
                                        {config.icon}
                                    </div>

                                    <div className="worker-notification-body">
                                        <div className="worker-notification-title-row">
                                            <h3>{config.title}</h3>

                                            {!notification.is_read && (
                                                <span className="worker-unread-dot" />
                                            )}
                                        </div>

                                        <p className="worker-notification-message">
                                            {notification.message}
                                        </p>

                                        <span className="worker-notification-date">
                                            {formatNotificationDate(
                                                notification.created_at
                                            )}
                                        </span>

                                        <div className="worker-notification-actions">
                                            {config.link && (
                                                <Link
                                                    to={config.link}
                                                    className="worker-notification-link"
                                                >
                                                    {config.linkText}
                                                </Link>
                                            )}

                                            {!notification.is_read && (
                                                <button
                                                    type="button"
                                                    className="worker-notification-read-button"
                                                    onClick={() =>
                                                        handleMarkRead(
                                                            notification.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading !== null
                                                    }
                                                >
                                                    {actionLoading ===
                                                    notification.id
                                                        ? "Updating..."
                                                        : "Mark as read"}
                                                </button>
                                            )}
                                        </div>
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

export default WorkerNotifications;
