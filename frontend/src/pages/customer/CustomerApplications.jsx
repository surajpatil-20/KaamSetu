import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    ChevronRight,
    MapPin,
    Users,
} from "lucide-react";

import { getMyWorks } from "../../api/works";

import "./CustomerApplications.css";

function CustomerApplications() {
    const [works, setWorks] = useState([]);
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
                    "Failed to load customer applications:",
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

        loadWorks();
    }, []);

    if (loading) {
        return (
                <div className="customer-applications-state">
                    Loading applications...
                </div>
        );
    }

    if (error) {
        return (
                <div className="customer-applications-state">
                    <h2>Unable to load applications</h2>
                    <p>{error}</p>
                </div>
        );
    }

    return (
        
            <div className="customer-applications-page">

                <div className="customer-applications-header">
                    <div>
                        <p className="page-eyebrow">
                            APPLICATIONS
                        </p>

                        <h1>Applications Received</h1>

                        <p>
                            Review workers who have applied
                            to your posted works.
                        </p>
                    </div>

                    <div className="applications-summary">
                        <BriefcaseBusiness size={20} />

                        <div>
                            <strong>{works.length}</strong>
                            <span>Works</span>
                        </div>
                    </div>
                </div>

                {works.length === 0 ? (
                    <div className="customer-applications-empty">
                        <div className="empty-icon">
                            <Users size={28} />
                        </div>

                        <h2>No works found</h2>

                        <p>
                            Post a work to start receiving
                            applications from workers.
                        </p>

                        <Link
                            to="/customer/post-work"
                            className="post-work-button"
                        >
                            Post a Work
                        </Link>
                    </div>
                ) : (
                    <div className="customer-applications-list">
                        {works.map((work) => (
                            <div
                                className="customer-application-card"
                                key={work.id}
                            >
                                <div className="customer-application-main">

                                    <div className="customer-application-icon">
                                        <BriefcaseBusiness
                                            size={22}
                                        />
                                    </div>

                                    <div className="customer-application-info">
                                        <h2>{work.title}</h2>

                                        <div className="customer-application-meta">
                                            <span>
                                                {work.category}
                                            </span>

                                            <span>
                                                ₹{work.budget}
                                            </span>

                                            <span>
                                                <MapPin size={14} />
                                                {work.location}
                                            </span>
                                        </div>

                                        <span
                                            className={`work-status status-${work.status?.toLowerCase()}`}
                                        >
                                            {work.status?.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/customer/works/${work.id}/applications`}
                                    className="view-applications-button"
                                >
                                    View Applications
                                    <ChevronRight size={17} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

    );
}

export default CustomerApplications;