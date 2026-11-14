import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    IndianRupee,
    BriefcaseBusiness,
    Phone, 
    UserRound,
    Image as ImageIcon,
    X,
} from "lucide-react";

import { getWork } from "../../api/works";

import "./WorkDetails.css";

function WorkDetails() {

    const { id } = useParams();

    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSelectedPhoto(null);
            }
        };

        if (selectedPhoto) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedPhoto]);

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

                    {/* Selected Worker Contact Details */}
                    {work.contact_details?.phone && (
                        <div className="work-contact-card">
                            <div className="work-contact-heading">
                                <div className="work-contact-icon">
                                    <UserRound size={22} />
                                </div>
                    
                                <div>
                                    <span>SELECTED WORKER</span>
                                    <h2>{work.contact_details.name}</h2>
                                </div>
                            </div>
                    
                            <p>
                                Your selected worker's contact details are available
                                for coordinating the job.
                            </p>
                    
                            <a
                                href={`tel:${work.contact_details.phone}`}
                                className="work-contact-phone"
                            >
                                <Phone size={18} />
                                {work.contact_details.phone}
                            </a>
                        </div>
                    )}

                    <div className="work-description-card">

                        <h2>
                            Description
                        </h2>

                        <p>
                            {work.description}
                        </p>

                    </div>

                    {/* Work Photos Gallery */}
                    {Array.isArray(work.photos) && work.photos.length > 0 && (
                        <div className="work-photos-card">
                            <div className="work-photos-header">
                                <div className="work-photos-icon">
                                    <ImageIcon size={19} />
                                </div>
                                <div>
                                    <h2>
                                        Work Photos ({work.photos.slice(0, 3).length})
                                    </h2>
                                    <p>
                                        Photos of the work requirements
                                    </p>
                                </div>
                            </div>

                            <div className="work-photos-gallery">
                                {work.photos.slice(0, 3).map((photo, index) => (
                                    <div
                                        key={photo.id || index}
                                        className="work-photo-item"
                                        onClick={() => setSelectedPhoto(photo.image)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                setSelectedPhoto(photo.image);
                                            }
                                        }}
                                        title="Click to view full photo"
                                        aria-label={`View photo ${index + 1} full size`}
                                    >
                                        <img
                                            src={photo.image}
                                            alt={`Work photo ${index + 1}`}
                                            loading="lazy"
                                        />
                                        <span className="work-photo-tag">
                                            Photo {index + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {selectedPhoto && (
                    <div
                        className="photo-lightbox-overlay"
                        onClick={() => setSelectedPhoto(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Work photo preview"
                    >
                        <div
                            className="photo-lightbox-content"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="photo-lightbox-close"
                                onClick={() => setSelectedPhoto(null)}
                                aria-label="Close photo preview"
                            >
                                <X size={20} />
                            </button>
                            <img
                                src={selectedPhoto}
                                alt="Work photo enlarged"
                                className="photo-lightbox-img"
                            />
                        </div>
                    </div>
                )}

            </div>

    );
}

export default WorkDetails;