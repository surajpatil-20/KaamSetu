
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    CheckCheck,
    BriefcaseBusiness,
    Star,
    UserCheck,
    Clock,
    CheckCircle2,
} from "lucide-react";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../api/notifications";

import "./CustomerNotifications.css";

function CustomerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getNotifications();

            setNotifications(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setError(
                err.response?.data?.error ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case "APPLICATION_RECEIVED":
                return <BriefcaseBusiness size={20} />;

            case "WORKER_SELECTED":
                return <UserCheck size={20} />;

            case "APPLICATION_REJECTED":
                return <BriefcaseBusiness size={20} />;

            case "WORK_SUBMITTED":
                return <CheckCircle2 size={20} />;

            case "WORK_COMPLETED":
                return <CheckCheck size={20} />;

            case "REVIEW_RECEIVED":
                return <Star size={20} />;

            default:
                return <Bell size={20} />;
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            setUpdatingId(notificationId);
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
            console.error("Failed to mark notification as read:", err);
            setError(
                err.response?.data?.error ||
                "Unable to update this notification."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;

        try {
            setMarkingAll(true);
            setError("");

            await markAllNotificationsRead();

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            setError(
                err.response?.data?.error ||
                "Unable to mark all notifications as read."
            );
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
                <div className="customer-notifications-state">
                    Loading notifications...
                </div>
        );
    }

    return (
            <div className="customer-notifications-page">
                <div className="customer-notifications-header">
                    <div>
                        <p className="page-eyebrow">UPDATES</p>
                        <h1>Notifications</h1>
                        <p>
                            Stay updated on applications and your work.
                        </p>
                    </div>

                    <div className="notification-header-actions">
                        <span className="notification-count">
                            {unreadCount} unread
                        </span>

                        <button
                            className="mark-all-read-button"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || markingAll}
                        >
                            <CheckCheck size={16} />
                            {markingAll ? "Updating..." : "Mark all as read"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="notification-error">
                        {error}
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="notifications-empty">
                        <div className="notifications-empty-icon">
                            <Bell size={28} />
                        </div>
                        <h2>You're all caught up!</h2>
                        <p>
                            New updates about your work will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="customer-notifications-list">
                        {notifications.map((notification) => (
                            <div
                                className={`customer-notification-card ${
                                    notification.is_read
                                        ? "notification-read"
                                        : "notification-unread"
                                }`}
                                key={notification.id}
                            >
                                <div className="notification-type-icon">
                                    {getNotificationIcon(
                                        notification.notification_type
                                    )}
                                </div>

                                <div className="notification-content">
                                    <p className="notification-message">
                                        {notification.message}
                                    </p>

                                    <span className="notification-time">
                                        <Clock size={13} />
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleString()}
                                    </span>

                                    {notification.work && (
                                        <Link
                                            to={`/customer/works/${notification.work}`}
                                            className="notification-work-link"
                                        >
                                            View work
                                        </Link>
                                    )}
                                </div>

                                {!notification.is_read && (
                                    <button
                                        className="mark-read-button"
                                        onClick={() =>
                                            handleMarkRead(notification.id)
                                        }
                                        disabled={
                                            updatingId === notification.id
                                        }
                                    >
                                        {updatingId === notification.id
                                            ? "Updating..."
                                            : "Mark read"}
                                    </button>
                                )}

                                {!notification.is_read && (
                                    <span
                                        className="notification-unread-dot"
                                        aria-label="Unread"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
    );
}

export default CustomerNotifications;
