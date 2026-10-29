import { useEffect, useMemo, useState } from "react";

import {
    Search,
    MapPin,
    CalendarDays,
    IndianRupee,
    BriefcaseBusiness,
    SlidersHorizontal,
    X,
    Send,
    RefreshCw,
    Crosshair,
} from "lucide-react";

import { getAvailableWorks } from "../../api/works";
import { applyToWork } from "../../api/applications";
import "./AvailableWorks.css";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CATEGORIES = [
    { value: "ALL", label: "All Categories" },
    { value: "PAINTING", label: "Painting" },
    { value: "PLUMBING", label: "Plumbing" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "CARPENTRY", label: "Carpentry" },
    { value: "REPAIR", label: "Repair" },
    { value: "MOVING", label: "Moving" },
    { value: "OTHER", label: "Other" },
];

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.works)) return data.works;
    return [];
}

function formatDate(date) {
    if (!date) return "Not specified";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return (
        earthRadiusKm *
        2 *
        Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))))
    );
}

function JobsMapView({ works, workerLocation, onSelectJob }) {
    const map = useMap();

    useEffect(() => {
        const points = works
            .filter(
                (work) =>
                    work.latitude != null &&
                    work.longitude != null &&
                    Number.isFinite(Number(work.latitude)) &&
                    Number.isFinite(Number(work.longitude))
            )
            .map((work) => [
                Number(work.latitude),
                Number(work.longitude),
            ]);

        if (workerLocation) {
            points.push([
                workerLocation.latitude,
                workerLocation.longitude,
            ]);
        }

        if (points.length === 1) {
            map.setView(points[0], 14);
        } else if (points.length > 1) {
            map.fitBounds(points, { padding: [35, 35], maxZoom: 14 });
        }
    }, [map, works, workerLocation]);

    return null;
}

function AvailableWorks() {
    const [works, setWorks] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [applyingId, setApplyingId] = useState(null);
    const [applicationForms, setApplicationForms] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [workerLocation, setWorkerLocation] = useState(null);
    const [radius, setRadius] = useState("10");
    const [locationLoading, setLocationLoading] = useState(false);
    const [showJobsMap, setShowJobsMap] = useState(true);
    const [selectedMapJob, setSelectedMapJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [worksPerPage] = useState(6);


    const loadWorks = async (location = workerLocation, selectedRadius = radius) => {
        setLoading(true);
        setError("");

        try {
            const filters = location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: selectedRadius,
                }
                : {};

            const data = await getAvailableWorks(filters);
            setWorks(getList(data));
        } catch (err) {
            console.error("Failed to load available works:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.location?.[0] ||
                "Unable to load available jobs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleUseCurrentLocation = () => {
        setError("");
        setNotice("");

        if (!navigator.geolocation) {
            setError("Your browser does not support location detection.");
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const location = {
                    latitude: Number(position.coords.latitude.toFixed(6)),
                    longitude: Number(position.coords.longitude.toFixed(6)),
                };

                setWorkerLocation(location);

                try {
                    await loadWorks(location, radius);
                } finally {
                    setLocationLoading(false);
                }
            },
            (geoError) => {
                setLocationLoading(false);

                if (geoError.code === 1) {
                    setError("Please allow location access in your browser settings.");
                } else if (geoError.code === 3) {
                    setError("Location request timed out. Please try again.");
                } else {
                    setError("Could not detect your location. Please try again.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
            }
        );
    };



    useEffect(() => {
        loadWorks();
    }, []);

    const filteredWorks = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = works.filter((work) => {
            const matchesCategory =
                category === "ALL" || work.category === category;

            const searchableText = [
                work.title,
                work.description,
                work.location,
                work.category,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesCategory && searchableText.includes(query);
        });

        return filtered.sort((a, b) => {
            if (sort === "budget-high") {
                return Number(b.budget || 0) - Number(a.budget || 0);
            }

            if (sort === "budget-low") {
                return Number(a.budget || 0) - Number(b.budget || 0);
            }

            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );
        });
    }, [works, search, category, sort]);

    const totalPages = Math.ceil(filteredWorks.length / worksPerPage);

    const startIndex = (currentPage - 1) * worksPerPage;

    const paginatedWorks = filteredWorks.slice(
        startIndex,
        startIndex + worksPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, category, sort, radius, workerLocation]);

    const updateApplicationForm = (workId, field, value) => {
        setApplicationForms((previous) => ({
            ...previous,
            [workId]: {
                proposed_price:
                    previous[workId]?.proposed_price ?? "",
                message: previous[workId]?.message ?? "",
                [field]: value,
            },
        }));
    };

    const handleApply = async (event, workId) => {
        event.preventDefault();

        const form = applicationForms[workId] || {
            proposed_price: "",
            message: "",
        };

        const price = Number(form.proposed_price);

        if (
            form.proposed_price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setNotice("");
            setError("Enter a valid proposed price before applying.");
            return;
        }

        setApplyingId(workId);
        setError("");
        setNotice("");

        try {
            await applyToWork(workId, {
                proposed_price: price,
                message: form.message.trim(),
            });

            setNotice("Application submitted successfully!");
            setExpandedId(null);
            setApplicationForms((previous) => {
                const next = { ...previous };
                delete next[workId];
                return next;
            });

            // Remove the job from available results after applying.
            setWorks((previous) =>
                previous.filter((work) => work.id !== workId)
            );
        } catch (err) {
            const data = err.response?.data;

            const message =
                data?.detail ||
                data?.error ||
                (data && typeof data === "object"
                    ? Object.values(data).flat().find(
                        (value) => typeof value === "string"
                    )
                    : null) ||
                "Could not submit your application. Please try again.";

            setError(message);
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className="available-works-page">
            <header className="available-works-header">
                <div>
                    <span className="available-works-eyebrow">
                        FIND YOUR NEXT OPPORTUNITY
                    </span>
                    <h1>Available Works</h1>
                    <p>
                        Discover jobs that match your skills and apply
                        with your proposed price.
                    </p>
                </div>

                <button
                    type="button"
                    className="available-refresh-button"
                    onClick={loadWorks}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </header>

            <section className="available-works-toolbar">
                <div className="available-search-box">
                    <Search size={19} />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by job, skill, or location..."
                        aria-label="Search available jobs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <X size={17} />
                        </button>
                    )}
                </div>


                <div className="nearby-work-controls">
                    <button
                        type="button"
                        className="nearby-location-button"
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading || loading}
                    >
                        <Crosshair size={17} />
                        {locationLoading ? "Finding nearby jobs..." : "Use My Location"}
                    </button>

                    <select
                        className="nearby-radius-select"
                        value={radius}
                        onChange={async (event) => {
                            const newRadius = event.target.value;
                            setRadius(newRadius);

                            if (workerLocation) {
                                await loadWorks(workerLocation, newRadius);
                            }
                        }}
                        aria-label="Nearby jobs radius"
                    >
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km</option>
                        <option value="25">Within 25 km</option>
                        <option value="50">Within 50 km</option>
                    </select>

                    {workerLocation && (
                        <button
                            type="button"
                            className="nearby-clear-button"
                            onClick={() => {
                                setWorkerLocation(null);
                                loadWorks(null, radius);
                            }}
                        >
                            Show all jobs
                        </button>
                    )}
                </div>


                <div className="available-filter-control">
                    <SlidersHorizontal size={17} />
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="Filter by category"
                    >
                        {CATEGORIES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <select
                    className="available-sort-select"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label="Sort jobs"
                >
                    <option value="newest">Newest first</option>
                    <option value="budget-high">Highest budget</option>
                    <option value="budget-low">Lowest budget</option>
                </select>
            </section>

            {/* Interactive jobs map */}
            <section className="jobs-map-section">
                <div className="jobs-map-header">
                    <div>
                        <h2>Explore Jobs on Map</h2>
                        <p>
                            Select a marker to see job details and location.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="jobs-map-toggle"
                        onClick={() => setShowJobsMap((previous) => !previous)}
                    >
                        {showJobsMap ? "Hide Map" : "Show Map"}
                    </button>
                </div>

                {showJobsMap && (
                    <div className="jobs-map-container">
                        <MapContainer
                            center={
                                workerLocation
                                    ? [
                                        workerLocation.latitude,
                                        workerLocation.longitude,
                                    ]
                                    : [16.705, 74.2433]
                            }
                            zoom={12}
                            scrollWheelZoom
                            className="jobs-leaflet-map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <JobsMapView
                                works={filteredWorks}
                                workerLocation={workerLocation}
                            />

                            {/* Worker's current location */}
                            {workerLocation && (
                                <Marker
                                    position={[
                                        workerLocation.latitude,
                                        workerLocation.longitude,
                                    ]}
                                >
                                    <Popup>
                                        <strong>Your current location</strong>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Available work markers */}
                            {filteredWorks
                                .filter(
                                    (work) =>
                                        work.latitude != null &&
                                        work.longitude != null &&
                                        Number.isFinite(Number(work.latitude)) &&
                                        Number.isFinite(Number(work.longitude)) &&
                                        Number(work.latitude) >= -90 &&
                                        Number(work.latitude) <= 90 &&
                                        Number(work.longitude) >= -180 &&
                                        Number(work.longitude) <= 180
                                )
                                .map((work) => (
                                    <Marker
                                        key={work.id}
                                        position={[
                                            Number(work.latitude),
                                            Number(work.longitude),
                                        ]}
                                        eventHandlers={{
                                            click: () => setSelectedMapJob(work.id),
                                        }}
                                    >
                                        <Popup>
                                            <div className="jobs-map-popup">
                                                <strong>{work.title}</strong>

                                                <p>
                                                    {String(work.category || "Other")
                                                        .replaceAll("_", " ")}
                                                </p>

                                                <p>
                                                    <strong>Budget:</strong>{" "}
                                                    ₹{Number(work.budget || 0).toLocaleString("en-IN")}
                                                </p>

                                                <p>
                                                    <strong>Location:</strong>{" "}
                                                    {work.location || work.city || "Not specified"}
                                                </p>

                                                {work.work_date && (
                                                    <p>
                                                        <strong>Date:</strong>{" "}
                                                        {work.work_date}
                                                    </p>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMapJob(work.id);
                                                        setExpandedId(work.id);

                                                        document
                                                            .getElementById(
                                                                `available-work-${work.id}`
                                                            )
                                                            ?.scrollIntoView({
                                                                behavior: "smooth",
                                                                block: "center",
                                                            });
                                                    }}
                                                >
                                                    View Job Details
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                        </MapContainer>

                        <p className="jobs-map-note">
                            {filteredWorks.filter(
                                (work) =>
                                    work.latitude != null &&
                                    work.longitude != null
                            ).length}{" "}
                            jobs with mapped locations. Jobs without coordinates
                            won't appear as markers.
                        </p>
                    </div>
                )}
            </section>

            <div className="available-results-heading">
                <div>
                    <h2>Jobs for you</h2>
                    <p>
                        {loading
                            ? "Finding available jobs..."
                            : `${filteredWorks.length} job${filteredWorks.length === 1 ? "" : "s"
                            } found`}
                    </p>
                </div>
            </div>

            {error && (
                <div className="available-message error">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            loadWorks();
                        }}
                    >
                        Try again
                    </button>
                </div>
            )}

            {notice && (
                <div className="available-message success">
                    {notice}
                </div>
            )}

            {loading ? (
                <div className="available-empty-state">
                    <RefreshCw size={28} className="available-spinner" />
                    <p>Loading available jobs...</p>
                </div>
            ) : filteredWorks.length === 0 ? (
                <div className="available-empty-state">
                    <div className="available-empty-icon">
                        <BriefcaseBusiness size={32} />
                    </div>
                    <h3>
                        {works.length === 0
                            ? "No available jobs right now"
                            : "No matching jobs found"}
                    </h3>
                    <p>
                        {works.length === 0
                            ? "New opportunities will appear here when customers post work."
                            : "Try another search term or category."}
                    </p>

                    {(search || category !== "ALL") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setCategory("ALL");
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="available-jobs-grid">
                    {paginatedWorks.map((work) => {
                        const form = applicationForms[work.id] || {
                            proposed_price: "",
                            message: "",
                        };

                        const isExpanded = expandedId === work.id;
                        const isApplying = applyingId === work.id;

                        return (
                            <article
                                className="available-job-card"
                                key={work.id}
                            >
                                <div id={`available-work-${work.id}`}
                                    className={`available-job-card-top ${selectedMapJob === work.id ? "map-job-selected" : ""
                                        }`}
                                >
                                    <span className="available-category-badge">
                                        {CATEGORIES.find(
                                            (item) => item.value === work.category
                                        )?.label || work.category || "Other"}
                                    </span>
                                    <span className="available-open-badge">
                                        Open
                                    </span>
                                </div>

                                <h3>{work.title}</h3>

                                <p className="available-job-description">
                                    {work.description || "No description provided."}
                                </p>

                                <div className="available-job-meta">
                                    <span>
                                        <MapPin size={16} />
                                        {work.location || "Location not specified"}
                                    </span>
                                    <span>
                                        <CalendarDays size={16} />
                                        {formatDate(work.work_date)}
                                    </span>
                                </div>


                                {workerLocation &&
                                    work.latitude != null &&
                                    work.longitude != null && (
                                        <div className="available-job-distance">
                                            <MapPin size={15} />
                                            {calculateDistanceKm(
                                                workerLocation.latitude,
                                                workerLocation.longitude,
                                                Number(work.latitude),
                                                Number(work.longitude)
                                            ).toFixed(1)}{" "}
                                            km away
                                        </div>
                                    )}


                                <div className="available-job-budget">
                                    <span>Customer's budget</span>
                                    <strong>
                                        <IndianRupee size={18} />
                                        {Number(work.budget || 0).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                </div>

                                {!isExpanded ? (
                                    <button
                                        type="button"
                                        className="available-apply-button"
                                        onClick={() => {
                                            setExpandedId(work.id);
                                            setError("");
                                            setNotice("");
                                        }}
                                    >
                                        <Send size={17} />
                                        Apply for this job
                                    </button>
                                ) : (
                                    <form
                                        className="available-application-form"
                                        onSubmit={(event) =>
                                            handleApply(event, work.id)
                                        }
                                    >
                                        <div className="available-form-heading">
                                            <h4>Your application</h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedId(null)
                                                }
                                                aria-label="Close application form"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <label htmlFor={`price-${work.id}`}>
                                            Your proposed price (₹)
                                        </label>
                                        <input
                                            id={`price-${work.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={form.proposed_price}
                                            onChange={(event) =>
                                                updateApplicationForm(
                                                    work.id,
                                                    "proposed_price",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter your price"
                                        />

                                        <label htmlFor={`message-${work.id}`}>
                                            Message to customer
                                        </label>
                                        <textarea
                                            id={`message-${work.id}`}
                                            rows={3}
                                            value={form.message}
                                            onChange={(event) =>
                                                updateApplicationForm(
                                                    work.id,
                                                    "message",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Explain why you're suitable for this job..."
                                        />

                                        <button
                                            type="submit"
                                            className="available-apply-button"
                                            disabled={isApplying}
                                        >
                                            <Send size={16} />
                                            {isApplying
                                                ? "Submitting..."
                                                : "Submit Application"}
                                        </button>
                                    </form>
                                )}
                            </article>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
            {totalPages > 1 && (
                <nav
                    className="works-pagination"
                    aria-label="Available works pages"
                >
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((page) => page - 1)
                        }
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    ).map((page) => (
                        <button
                            key={page}
                            type="button"
                            className={
                                currentPage === page ? "active" : ""
                            }
                            aria-current={
                                currentPage === page ? "page" : undefined
                            }
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((page) => page + 1)
                        }
                    >
                        Next
                    </button>
                </nav>
                    )}
                </>
            )}
        </div>
    );
}

export default AvailableWorks;