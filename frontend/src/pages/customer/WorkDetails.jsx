import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    IndianRupee,
    BriefcaseBusiness,
} from "lucide-react";

import { getWork } from "../../api/works";

import "./WorkDetails.css";

function WorkDetails() {

    const { id } = useParams();

    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadWork = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getWork(id);

                setWork(data);

            } catch (err) {

                console.error(
                    "Failed to load work:",
                    err
                );

                setError(
                    err.response?.data?.error ||
                    "Unable to load this work."
                );

            } finally {

                setLoading(false);

            }
        };

        loadWork();

    }, [id]);


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


    if (loading) {

        return (
            
                <div className="work-details-state">
                    Loading work...
                </div>
            
        );

    }


    if (error || !work) {

        return (

                <div className="work-details-state">

                    <h2>
                        Unable to load work
                    </h2>

                    <p>
                        {error || "Work not found."}
                    </p>

                    <Link
                        to="/customer/works"
                        className="back-button"
                    >
                        <ArrowLeft size={16} />
                        Back to My Works
                    </Link>

                </div>

        );

    }


    return (

            <div className="work-details-page">

                <Link
                    to="/customer/works"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to My Works
                </Link>


                <div className="work-details-header">

                    <div>

                        <p className="page-eyebrow">
                            WORK DETAILS
                        </p>

                        <h1>
                            {work.title}
                        </h1>

                        <p>
                            {work.description}
                        </p>

                    </div>

                    <span
                        className={`work-status status-${work.status.toLowerCase()}`}
                    >
                        {getStatusLabel(work.status)}
                    </span>

                </div>


                <div className="work-details-grid">

                    <div className="work-info-card">

                        <div className="info-item">

                            <div className="info-icon">
                                <BriefcaseBusiness size={18} />
                            </div>

                            <div>
                                <span>
                                    Category
                                </span>

                                <strong>
                                    {work.category}
                                </strong>
                            </div>

                        </div>

                        <div className="work-details-actions">

                            {work.status === "OPEN" && (
                                <Link
                                    to={`/customer/works/${work.id}/applications`}
                                    className="view-applications-button"
                                >
                                    View Applications
                                </Link>
                            )}
                        
                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                <IndianRupee size={18} />
                            </div>

                            <div>
                                <span>
                                    Budget
                                </span>

                                <strong>
                                    ₹{work.budget}
                                </strong>
                            </div>

                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                <MapPin size={18} />
                            </div>

                            <div>
                                <span>
                                    Location
                                </span>

                                <strong>
                                    {work.location}
                                </strong>
                            </div>

                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                <CalendarDays size={18} />
                            </div>

                            <div>
                                <span>
                                    Work Date
                                </span>

                                <strong>
                                    {work.work_date}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div className="work-description-card">

                        <h2>
                            Description
                        </h2>

                        <p>
                            {work.description}
                        </p>

                    </div>

                </div>

            </div>

    );
}

export default WorkDetails;