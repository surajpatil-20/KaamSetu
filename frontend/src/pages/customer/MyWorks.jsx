import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    CalendarDays,
    MapPin,
    IndianRupee,
    ArrowRight,
    Plus,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getMyWorks } from "../../api/works";

import "./MyWorks.css";

function MyWorks() {
    const [works, setWorks] = useState([]);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadWorks = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyWorks();

                setWorks(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (err) {
                console.error(
                    "Failed to load works:",
                    err
                );

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

    const filteredWorks = useMemo(() => {
        if (activeFilter === "ALL") {
            return works;
        }

        if (activeFilter === "ACTIVE") {
            return works.filter((work) =>
                [
                    "WORKER_SELECTED",
                    "IN_PROGRESS",
                    "SUBMITTED",
                ].includes(work.status)
            );
        }

        return works.filter(
            (work) => work.status === activeFilter
        );
    }, [works, activeFilter]);

    const counts = useMemo(() => {
        return {
            all: works.length,

            open: works.filter(
                (work) => work.status === "OPEN"
            ).length,

            active: works.filter((work) =>
                [
                    "WORKER_SELECTED",
                    "IN_PROGRESS",
                    "SUBMITTED",
                ].includes(work.status)
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

            <div className="my-works-page">

                {/* Header */}

                <div className="my-works-header">

                    <div>
                        <p className="page-eyebrow">
                            CUSTOMER
                        </p>

                        <h1>
                            My Works
                        </h1>

                        <p>
                            Manage all the work you have
                            posted.
                        </p>
                    </div>

                    <Link
                        to="/customer/post-work"
                        className="post-work-button"
                    >
                        <Plus size={17} />
                        Post New Work
                    </Link>

                </div>


                {/* Filters */}

                <div className="work-filters">

                    <button
                        className={
                            activeFilter === "ALL"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter("ALL")
                        }
                    >
                        All
                        <span>
                            {counts.all}
                        </span>
                    </button>

                    <button
                        className={
                            activeFilter === "OPEN"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter("OPEN")
                        }
                    >
                        Open
                        <span>
                            {counts.open}
                        </span>
                    </button>

                    <button
                        className={
                            activeFilter === "ACTIVE"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter("ACTIVE")
                        }
                    >
                        Active
                        <span>
                            {counts.active}
                        </span>
                    </button>

                    <button
                        className={
                            activeFilter === "COMPLETED"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setActiveFilter("COMPLETED")
                        }
                    >
                        Completed
                        <span>
                            {counts.completed}
                        </span>
                    </button>

                </div>


                {/* Error */}

                {error && (
                    <div className="works-error">
                        {error}
                    </div>
                )}


                {/* Loading */}

                {loading && (
                    <div className="works-state">
                        Loading your works...
                    </div>
                )}


                {/* Empty */}

                {!loading &&
                    !error &&
                    filteredWorks.length === 0 && (

                        <div className="works-empty">

                            <div className="empty-icon">
                                <BriefcaseBusiness
                                    size={28}
                                />
                            </div>

                            <h2>
                                {activeFilter === "ALL"
                                    ? "No works yet"
                                    : "No works found"}
                            </h2>

                            <p>
                                {activeFilter === "ALL"
                                    ? "Post your first work and start finding the right worker."
                                    : "There are no works in this category."}
                            </p>

                            {activeFilter === "ALL" && (
                                <Link
                                    to="/customer/post-work"
                                    className="empty-post-button"
                                >
                                    Post Your First Work
                                </Link>
                            )}

                        </div>
                    )}


                {/* Works */}

                {!loading &&
                    !error &&
                    filteredWorks.length > 0 && (

                        <div className="my-works-list">

                            {filteredWorks.map((work) => (

                                <div
                                    className="my-work-card"
                                    key={work.id}
                                >

                                    <div className="my-work-main">

                                        <div className="my-work-title-row">

                                            <div className="work-card-icon">
                                                <BriefcaseBusiness
                                                    size={18}
                                                />
                                            </div>

                                            <div>
                                                <h2>
                                                    {work.title}
                                                </h2>

                                                <p className="work-category">
                                                    {work.category}
                                                </p>
                                            </div>

                                        </div>


                                        <span
                                            className={`work-status ${getStatusClass(
                                                work.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                work.status
                                            )}
                                        </span>

                                    </div>


                                    <div className="my-work-details">

                                        <div className="work-detail">

                                            <MapPin size={15} />

                                            <span>
                                                {work.location}
                                            </span>

                                        </div>


                                        <div className="work-detail">

                                            <CalendarDays size={15} />

                                            <span>
                                                {work.work_date}
                                            </span>

                                        </div>


                                        <div className="work-detail">

                                            <IndianRupee size={15} />

                                            <span>
                                                {work.budget}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="my-work-footer">

                                        <span>
                                            Posted{" "}
                                            {work.created_at
                                                ? new Date(
                                                    work.created_at
                                                ).toLocaleDateString()
                                                : ""}
                                        </span>

                                        <Link
                                            to={`/customer/works/${work.id}`}
                                            className="view-work-link"
                                        >
                                            View Details
                                            <ArrowRight
                                                size={15}
                                            />
                                        </Link>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

            </div>

    );
}

export default MyWorks;