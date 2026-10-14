import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Star,
    BriefcaseBusiness,
    Clock3,
    IndianRupee,
    UserRound,
} from "lucide-react";

import { getWork } from "../../api/works";
import {
    getWorkApplications,
    selectWorker,
} from "../../api/applications";

import "./Applications.css";

function Applications() {
    const { id } = useParams();

    const [work, setWork] = useState(null);
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [workData, applicationData] =
                    await Promise.all([
                        getWork(id),
                        getWorkApplications(id),
                    ]);

                setWork(workData);

                setApplications(
                    Array.isArray(applicationData)
                        ? applicationData
                        : applicationData.results || []
                );

            } catch (err) {
                console.error(
                    "Failed to load applications:",
                    err
                );

                setError(
                    err.response?.data?.error ||
                    "Unable to load applications."
                );

            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const getStatusClass = (status) => {
        const classes = {
            PENDING: "application-pending",
            ACCEPTED: "application-accepted",
            REJECTED: "application-rejected",
        };

        return classes[status] || "";
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: "Pending",
            ACCEPTED: "Accepted",
            REJECTED: "Rejected",
        };

        return labels[status] || status;
    };

    const handleSelectWorker = async (applicationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to select this worker?"
        );
    
        if (!confirmed) return;
    
        try {
            setError("");
        
            await selectWorker(applicationId);
        
            setApplications((previousApplications) =>
                previousApplications.map((application) => {
                    if (application.id === applicationId) {
                        return {
                            ...application,
                            status: "ACCEPTED",
                        };
                    }
                
                    return {
                        ...application,
                        status: "REJECTED",
                    };
                })
            );
        
            setWork((previousWork) => ({
                ...previousWork,
                status: "WORKER_SELECTED",
            }));
        } catch (err) {
            console.error("Failed to select worker:", err);
        
            setError(
                err.response?.data?.error ||
                "Unable to select this worker."
            );
        }
    };

    if (loading) {
        return (
            
                <div className="applications-state">
                    Loading applications...
                </div>
            
        );
    }

    if (error) {
        return (
            

                <div className="applications-state">

                    <h2>
                        Unable to load applications
                    </h2>

                    <p>
                        {error}
                    </p>

                    <Link
                        to={`/customer/works/${id}`}
                        className="applications-back-button"
                    >
                        <ArrowLeft size={16} />
                        Back to Work
                    </Link>

                </div>

            
        );
    }

    return (
        

            <div className="applications-page">

                {/* Header */}

                <Link
                    to={`/customer/works/${id}`}
                    className="applications-back-link"
                >
                    <ArrowLeft size={16} />
                    Back to Work
                </Link>

                <div className="applications-header">

                    <div>

                        <p className="page-eyebrow">
                            APPLICATIONS
                        </p>

                        <h1>
                            {work?.title}
                        </h1>

                        <p>
                            Review workers who applied for
                            this work.
                        </p>

                    </div>

                    <div className="application-count">

                        <strong>
                            {applications.length}
                        </strong>

                        <span>
                            {applications.length === 1
                                ? "Application"
                                : "Applications"}
                        </span>

                    </div>

                </div>


                {/* Empty state */}

                {applications.length === 0 && (

                    <div className="applications-empty">

                        <div className="empty-icon">
                            <BriefcaseBusiness
                                size={28}
                            />
                        </div>

                        <h2>
                            No applications yet
                        </h2>

                        <p>
                            Workers haven't applied for
                            this work yet.
                        </p>

                    </div>

                )}


                {/* Applications */}

                {applications.length > 0 && (

                    <div className="applications-list">

                        {applications.map((application) => {

                            const worker =
                                application.worker;

                            return (
                                <div
                                    className="application-card"
                                    key={application.id}
                                >

                                    {/* Top */}

                                    <div className="application-top">

                                        <div className="worker-info">

                                            <div className="worker-avatar">

                                                {worker?.profile_photo ? (
                                                    <img
                                                        src={
                                                            worker.profile_photo
                                                        }
                                                        alt={
                                                            worker.username
                                                        }
                                                    />
                                                ) : (
                                                    <UserRound
                                                        size={22}
                                                    />
                                                )}

                                            </div>

                                            <div>

                                                <h2>
                                                    {worker?.username ||
                                                        "Worker"}
                                                </h2>

                                                <div className="worker-rating">

                                                    <Star
                                                        size={14}
                                                        fill="currentColor"
                                                    />

                                                    <strong>
                                                        {worker?.average_rating ??
                                                            0}
                                                    </strong>

                                                    <span>
                                                        (
                                                        {worker?.total_reviews ??
                                                            0}{" "}
                                                        reviews)
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <span
                                            className={`application-status ${getStatusClass(
                                                application.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                application.status
                                            )}
                                        </span>

                                    </div>


                                    {/* Worker details */}

                                    <div className="worker-details">

                                        <div className="worker-detail">

                                            <BriefcaseBusiness
                                                size={15}
                                            />

                                            <div>

                                                <span>
                                                    Experience
                                                </span>

                                                <strong>
                                                    {worker?.experience ??
                                                        0}{" "}
                                                    years
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="worker-detail">

                                            <IndianRupee
                                                size={15}
                                            />

                                            <div>

                                                <span>
                                                    Proposed Price
                                                </span>

                                                <strong>
                                                    ₹
                                                    {
                                                        application.proposed_price
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="worker-detail">

                                            <Clock3
                                                size={15}
                                            />

                                            <div>

                                                <span>
                                                    Applied
                                                </span>

                                                <strong>
                                                    {application.applied_at
                                                        ? new Date(
                                                            application.applied_at
                                                        ).toLocaleDateString()
                                                        : "Recently"}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Skills */}

                                    {worker?.skills && (
                                        <div className="worker-skills">

                                            <span>
                                                Skills
                                            </span>

                                            <p>
                                                {worker.skills}
                                            </p>

                                        </div>
                                    )}


                                    {/* Message */}

                                    {application.message && (
                                        <div className="worker-message">

                                            <span>
                                                Message
                                            </span>

                                            <p>
                                                "{application.message}"
                                            </p>

                                        </div>
                                    )}


                                    {/* Actions */}

                                    <div className="application-footer">

                                        <Link
                                            to={`/customer/works/${id}`}
                                            className="view-worker-button"
                                        >
                                            View Work
                                        </Link>

                                        {application.status ===
                                            "PENDING" &&
                                            work?.status ===
                                                "OPEN" && (
                                                <button
                                                    className="select-worker-button"
                                                    onClick={() => handleSelectWorker(application.id)}
                                                >
                                                    Select Worker
                                                </button>
                                            )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        
    );
}

export default Applications;