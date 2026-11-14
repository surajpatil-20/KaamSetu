import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    IndianRupee,
    MapPin,
    Crosshair,
    LoaderCircle,
    Image as ImageIcon,
    UploadCloud,
    Trash2,
} from "lucide-react";

import { createWork, uploadWorkPhoto } from "../../api/works";
import "leaflet/dist/leaflet.css";
import "./PostWork.css";

// Fix Leaflet marker icons in Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_POSITION = [16.705, 74.2433]; // Kolhapur, Maharashtra

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(event) {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}


function MapRecenter({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 17, { animate: true });
        }
    }, [map, position]);

    return null;
}


function PostWork() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        budget: "",
        location: "",
        address: "",
        city: "",
        pincode: "",
        latitude: null,
        longitude: null,
        work_date: "",
    });

    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [lookingUp, setLookingUp] = useState(false);
    const [error, setError] = useState("");
    const [locationMessage, setLocationMessage] = useState("");

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoError, setPhotoError] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    const MAX_PHOTOS = 3;
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

    useEffect(() => {
        return () => {
            selectedPhotos.forEach((photo) => {
                if (photo.previewUrl) {
                    URL.revokeObjectURL(photo.previewUrl);
                }
            });
        };
    }, [selectedPhotos]);

    const handlePhotoSelect = (event) => {
        setPhotoError("");
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        event.target.value = "";

        const availableSlots = MAX_PHOTOS - selectedPhotos.length;
        if (availableSlots <= 0) {
            setPhotoError(`You have already selected the maximum of ${MAX_PHOTOS} photos.`);
            return;
        }

        if (files.length > availableSlots) {
            setPhotoError(
                `You can only add ${availableSlots} more photo${availableSlots === 1 ? "" : "s"}. Maximum ${MAX_PHOTOS} photos allowed.`
            );
            return;
        }

        const newPhotos = [];
        for (const file of files) {
            const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
            const isValidType = ALLOWED_MIME_TYPES.includes(file.type);
            const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

            if (!isValidType && !isValidExt) {
                setPhotoError(
                    `"${file.name}" is not a supported image format. Please select JPG, JPEG, PNG, or WebP images.`
                );
                return;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                setPhotoError(
                    `"${file.name}" exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
                );
                return;
            }

            newPhotos.push({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                previewUrl: URL.createObjectURL(file),
                name: file.name,
                sizeFormatted:
                    file.size > 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.round(file.size / 1024)} KB`,
            });
        }

        setSelectedPhotos((previous) => [...previous, ...newPhotos]);
    };

    const handleRemovePhoto = (idToRemove) => {
        setPhotoError("");
        setSelectedPhotos((previous) => {
            const item = previous.find((p) => p.id === idToRemove);
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return previous.filter((p) => p.id !== idToRemove);
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Convert selected coordinates into address details.
    const reverseGeocode = async (latitude, longitude) => {
        setLookingUp(true);
        setLocationMessage("Finding address...");

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            if (!response.ok) {
                throw new Error("Address lookup failed");
            }

            const result = await response.json();
            const a = result.address || {};

            const city =
                a.city ||
                a.town ||
                a.village ||
                a.municipality ||
                a.county ||
                "";

            const pincode = (a.postcode || "").replace(/\D/g, "").slice(0, 6);

            setFormData((previous) => ({
                ...previous,
                latitude,
                longitude,
                address: result.display_name || previous.address,
                city: city || previous.city,
                pincode: pincode || previous.pincode,
                location:
                    [city, a.state].filter(Boolean).join(", ") ||
                    result.display_name ||
                    previous.location,
            }));

            setLocationMessage(
                result.display_name
                    ? "Location selected. Review the address details below."
                    : "Coordinates selected. Please enter the address manually."
            );
        } catch {
            setFormData((previous) => ({
                ...previous,
                latitude,
                longitude,
            }));

            setLocationMessage(
                "Coordinates saved. Address lookup failed; please enter the address manually."
            );
        } finally {
            setLookingUp(false);
        }
    };

    const selectCoordinates = (latitude, longitude) => {
        const roundedLatitude = Number(latitude.toFixed(6));
        const roundedLongitude = Number(longitude.toFixed(6));

        setPosition([roundedLatitude, roundedLongitude]);

        setFormData((previous) => ({
            ...previous,
            latitude: roundedLatitude,
            longitude: roundedLongitude,
        }));

        reverseGeocode(roundedLatitude, roundedLongitude);
    };


    const useCurrentLocation = () => {
        setError("");
        setLocationMessage("");

        if (!navigator.geolocation) {
            setError("Your browser does not support location detection.");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Guard against missing or invalid position data.
                if (!position?.coords) {
                    setError("The browser returned an invalid location.");
                    setLocating(false);
                    return;
                }

                const { latitude, longitude, accuracy } = position.coords;

                setLocating(false);

                selectCoordinates(
                    Number(latitude.toFixed(6)),
                    Number(longitude.toFixed(6))
                );

                setLocationMessage(
                    `Location detected (accuracy approximately ${Math.round(
                        accuracy
                    )} metres). Please verify the marker on the map.`
                );
            },
            (geoError) => {
                setLocating(false);

                if (geoError.code === 1) {
                    setError(
                        "Location permission denied. Allow location access in your browser settings."
                    );
                } else if (geoError.code === 2) {
                    setError(
                        "Your device could not determine its location. Check location services and try again."
                    );
                } else if (geoError.code === 3) {
                    setError(
                        "Location request timed out. Please try again."
                    );
                } else {
                    setError("Unable to detect your current location.");
                }

                console.error("Geolocation error:", geoError);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
            }
        );
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.title.trim()) {
            setError("Please enter a work title.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please describe the work.");
            return;
        }

        if (!formData.category) {
            setError("Please select a category.");
            return;
        }

        if (!formData.budget || Number(formData.budget) <= 0) {
            setError("Please enter a valid budget.");
            return;
        }

        if (!formData.location.trim()) {
            setError("Please enter the work location.");
            return;
        }

        if (!formData.address.trim()) {
            setError("Please enter the full work address.");
            return;
        }

        if (!formData.city.trim()) {
            setError("Please enter the city.");
            return;
        }

        if (!/^\d{6}$/.test(formData.pincode.trim())) {
            setError("Please enter a valid 6-digit PIN code.");
            return;
        }

        if (!formData.work_date) {
            setError("Please select the work date.");
            return;
        }

        if (
            (formData.latitude == null) !==
            (formData.longitude == null)
        ) {
            setError("Please select a valid location on the map.");
            return;
        }

        try {
            setLoading(true);
            setUploadStatus("Creating work...");

            const work = await createWork({
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                budget: formData.budget,
                location: formData.location.trim(),
                address: formData.address.trim(),
                city: formData.city.trim(),
                pincode: formData.pincode.trim(),
                latitude: formData.latitude,
                longitude: formData.longitude,
                work_date: formData.work_date,
            });

            if (selectedPhotos.length > 0) {
                const totalPhotos = Math.min(selectedPhotos.length, MAX_PHOTOS);
                for (let i = 0; i < totalPhotos; i++) {
                    setUploadStatus(
                        `Uploading photo ${i + 1} of ${totalPhotos}...`
                    );
                    try {
                        await uploadWorkPhoto(work.id, selectedPhotos[i].file);
                    } catch (photoErr) {
                        console.error("Failed to upload photo:", photoErr);
                        const backendErr = photoErr.response?.data;
                        const msg =
                            backendErr?.error ||
                            backendErr?.detail ||
                            (backendErr?.image
                                ? Array.isArray(backendErr.image)
                                    ? backendErr.image[0]
                                    : backendErr.image
                                : null) ||
                            "Failed to upload photo.";

                        const formattedMsg =
                            typeof msg === "string" ? msg : "Upload failed.";
                        setError(
                            `Work created, but photo ${i + 1} could not be uploaded (${formattedMsg}). Please check your work details.`
                        );
                        setLoading(false);
                        setUploadStatus("");
                        return;
                    }
                }
            }

            navigate(`/customer/works/${work.id}`);
        } catch (err) {
            console.error("Failed to create work:", err);

            const backendError = err.response?.data;

            if (backendError?.error) {
                setError(
                    typeof backendError.error === "string"
                        ? backendError.error
                        : Array.isArray(backendError.error)
                            ? backendError.error[0]
                            : Object.values(backendError.error)[0] ||
                            "Failed to create work."
                );
            } else if (
                backendError &&
                typeof backendError === "object"
            ) {
                const firstError = Object.values(backendError)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to create work."
                );
            } else {
                setError("Failed to create work. Please try again.");
            }
        } finally {
            setLoading(false);
            setUploadStatus("");
        }
    };

    return (
        <div className="post-work-page">
            <div className="post-work-header">
                <Link to="/customer/dashboard" className="back-link">
                    <ArrowLeft size={17} />
                    Back to Dashboard
                </Link>

                <div>
                    <p className="page-eyebrow">CUSTOMER</p>
                    <h1>Post a New Work</h1>
                    <p>
                        Describe your work and choose its exact location.
                    </p>
                </div>
            </div>

            <form className="post-work-form" onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}

                <section className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <BriefcaseBusiness size={19} />
                        </div>
                        <div>
                            <h2>Work Details</h2>
                            <p>Describe the work you need.</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Work Title</label>
                        <input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Paint my 2BHK house"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the work in detail..."
                            rows={5}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="PAINTING">Painting</option>
                            <option value="PLUMBING">Plumbing</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="CARPENTRY">Carpentry</option>
                            <option value="REPAIR">Repair</option>
                            <option value="MOVING">Moving</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </section>

                <section className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <ImageIcon size={19} />
                        </div>
                        <div className="form-section-title-wrap">
                            <div>
                                <h2>Work Photos</h2>
                                <p>
                                    Upload up to 3 photos to help workers understand the work requirements.
                                </p>
                            </div>
                            <span className="photo-count-badge">
                                Photos ({selectedPhotos.length}/{MAX_PHOTOS})
                            </span>
                        </div>
                    </div>

                    {photoError && (
                        <div className="photo-error-message" role="alert">
                            {photoError}
                        </div>
                    )}

                    <div className="photo-upload-container">
                        {selectedPhotos.length < MAX_PHOTOS && (
                            <label className="photo-dropzone">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                    onChange={handlePhotoSelect}
                                    disabled={loading}
                                    className="photo-file-input"
                                />
                                <div className="photo-dropzone-content">
                                    <div className="photo-dropzone-icon">
                                        <UploadCloud size={24} />
                                    </div>
                                    <div>
                                        <p className="photo-dropzone-title">
                                            Click to browse or select photos
                                        </p>
                                        <p className="photo-dropzone-subtitle">
                                            JPG, JPEG, PNG, or WebP &bull; Max 5 MB each &bull; Up to {MAX_PHOTOS - selectedPhotos.length} more
                                        </p>
                                    </div>
                                </div>
                            </label>
                        )}

                        {selectedPhotos.length >= MAX_PHOTOS && (
                            <div className="photo-limit-reached">
                                <ImageIcon size={18} />
                                <span>Maximum 3 photos selected. Remove a photo to select a different one.</span>
                            </div>
                        )}

                        {selectedPhotos.length > 0 && (
                            <div className="photo-previews-grid">
                                {selectedPhotos.map((photo, index) => (
                                    <div key={photo.id} className="photo-preview-card">
                                        <div className="photo-preview-image-wrapper">
                                            <img
                                                src={photo.previewUrl}
                                                alt={`Selected preview ${index + 1}`}
                                                className="photo-preview-img"
                                            />
                                            <span className="photo-index-tag">
                                                Photo {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                className="photo-remove-btn"
                                                onClick={() => handleRemovePhoto(photo.id)}
                                                disabled={loading}
                                                title="Remove photo"
                                                aria-label={`Remove photo ${index + 1}`}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                        <div className="photo-preview-info">
                                            <span className="photo-preview-name" title={photo.name}>
                                                {photo.name}
                                            </span>
                                            <span className="photo-preview-size">
                                                {photo.sizeFormatted}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="form-section">
                    <div className="form-section-header">
                        <div className="form-section-icon">
                            <MapPin size={19} />
                        </div>
                        <div>
                            <h2>Budget & Location</h2>
                            <p>
                                Choose your work location and provide
                                the address for workers.
                            </p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="budget">Budget (₹)</label>
                            <div className="input-with-icon">
                                <IndianRupee size={16} />
                                <input
                                    id="budget"
                                    name="budget"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="15000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="work_date">Work Date</label>
                            <div className="input-with-icon">
                                <CalendarDays size={16} />
                                <input
                                    id="work_date"
                                    name="work_date"
                                    type="date"
                                    min={new Date().toLocaleDateString("en-CA")}
                                    value={formData.work_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="location-tools">
                        <button
                            type="button"
                            className="location-button"
                            onClick={useCurrentLocation}
                            disabled={locating || lookingUp}
                        >
                            {locating ? (
                                <LoaderCircle size={18} className="location-spinner" />
                            ) : (
                                <Crosshair size={18} />
                            )}
                            {locating
                                ? "Detecting location..."
                                : "Use My Current Location"}
                        </button>

                        <p className="map-instruction">
                            Or click anywhere on the map to choose the work
                            location.
                        </p>
                    </div>

                    <div className="work-location-map">
                        <MapContainer
                            center={position || DEFAULT_POSITION}
                            zoom={12}
                            scrollWheelZoom
                            className="leaflet-map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapClickHandler onSelect={selectCoordinates} />

                            {position && (
                                <>
                                    <Marker position={position} />
                                    <MapRecenter position={position} />
                                </>
                            )}
                        </MapContainer>
                    </div>

                    {locationMessage && (
                        <p className="location-message" role="status">
                            {lookingUp && (
                                <LoaderCircle
                                    size={15}
                                    className="location-spinner"
                                />
                            )}
                            {locationMessage}
                        </p>
                    )}

                    {formData.latitude != null &&
                        formData.longitude != null && (
                            <p className="coordinate-display">
                                <MapPin size={15} />
                                {formData.latitude.toFixed(6)},{" "}
                                {formData.longitude.toFixed(6)}
                            </p>
                        )}

                    <div className="form-group">
                        <label htmlFor="address">Full Address</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="House number, street, area..."
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g. Kolhapur"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pincode">PIN Code</label>
                            <input
                                id="pincode"
                                name="pincode"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={formData.pincode}
                                onChange={(event) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        pincode: event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6),
                                    }))
                                }
                                placeholder="e.g. 416012"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location Summary</label>
                        <input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Rankala, Kolhapur"
                            required
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <Link
                        to="/customer/dashboard"
                        className="cancel-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="submit-work-button"
                        disabled={loading || lookingUp}
                    >
                        {loading ? (uploadStatus || "Posting...") : "Post Work"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostWork;
