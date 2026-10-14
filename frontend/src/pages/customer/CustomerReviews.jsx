
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Star,
    MessageSquare,
    Clock,
    BriefcaseBusiness,
    CheckCircle2,
} from "lucide-react";

import { getMyWorks } from "../../api/works";
import {
    createReview,
    getMyReviews,
} from "../../api/reviews";

import "./CustomerReviews.css";

function CustomerReviews() {
    const [works, setWorks] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submittingId, setSubmittingId] = useState(null);

    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [worksData, reviewsData] = await Promise.all([
                getMyWorks(),
                getMyReviews(),
            ]);
            setWorks(
                Array.isArray(worksData)
                    ? worksData
                    : worksData.results || []
            );

            setReviews(
                Array.isArray(reviewsData)
                    ? reviewsData
                    : reviewsData.results || []
            );
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setError(
                err.response?.data?.error ||
                "Unable to load your reviews."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const reviewedWorkIds = new Set(
        reviews.map((review) => review.work)
    );

    const pendingWorks = works.filter(
        (work) =>
            work.status === "COMPLETED" &&
            !reviewedWorkIds.has(work.id)
    );

    const handleSubmitReview = async (workId) => {
        const rating = Number(ratings[workId] || 0);
        const comment = comments[workId] || "";

        if (rating < 1 || rating > 5) {
            setError("Please select a rating from 1 to 5 stars.");
            return;
        }

        try {
            setSubmittingId(workId);
            setError("");
            setSuccess("");

            await createReview(workId, {
                rating,
                comment: comment.trim(),
            });

            setSuccess("Your review was submitted successfully.");

            setRatings((previous) => ({
                ...previous,
                [workId]: 0,
            }));

            setComments((previous) => ({
                ...previous,
                [workId]: "",
            }));

            await loadData();
        } catch (err) {
            console.error("Failed to submit review:", err);

            const data = err.response?.data;
            const message =
                typeof data === "string"
                    ? data
                    : data?.error ||
                      data?.detail ||
                      data?.non_field_errors?.[0] ||
                      "Unable to submit your review.";

            setError(message);
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return (
                <div className="customer-reviews-state">
                    Loading reviews...
                </div>
        );
    }

    return (
            <div className="customer-reviews-page">
                <div className="customer-reviews-header">
                    <div>
                        <p className="page-eyebrow">FEEDBACK</p>
                        <h1>My Reviews</h1>
                        <p>
                            Share your experience and recognize good work.
                        </p>
                    </div>

                    <div className="reviews-summary">
                        <Star size={21} />
                        <div>
                            <strong>{reviews.length}</strong>
                            <span>Reviews given</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="reviews-alert reviews-alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="reviews-alert reviews-alert-success">
                        {success}
                    </div>
                )}

                <section className="reviews-section">
                    <div className="reviews-section-heading">
                        <h2>Awaiting Your Review</h2>
                        <span>{pendingWorks.length}</span>
                    </div>

                    {pendingWorks.length === 0 ? (
                        <div className="reviews-empty">
                            <CheckCircle2 size={30} />
                            <h3>You're all caught up!</h3>
                            <p>
                                Completed works awaiting a review will
                                appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="pending-reviews-list">
                            {pendingWorks.map((work) => (
                                <div
                                    className="pending-review-card"
                                    key={work.id}
                                >
                                    <div className="pending-review-title">
                                        <div className="review-work-icon">
                                            <BriefcaseBusiness size={21} />
                                        </div>

                                        <div>
                                            <h3>{work.title}</h3>
                                            <p>
                                                {work.category} · Completed
                                            </p>
                                        </div>

                                        <Link
                                            to={`/customer/works/${work.id}`}
                                            className="review-view-work"
                                        >
                                            View work
                                        </Link>
                                    </div>

                                    <div className="rating-selector">
                                        <span>Your rating</span>

                                        <div
                                            className="rating-stars"
                                            role="group"
                                            aria-label={`Rating for ${work.title}`}
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className={
                                                        star <= (ratings[work.id] || 0)
                                                            ? "rating-star selected"
                                                            : "rating-star"
                                                    }
                                                    onClick={() =>
                                                        setRatings((previous) => ({
                                                            ...previous,
                                                            [work.id]: star,
                                                        }))
                                                    }
                                                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                                    aria-pressed={
                                                        (ratings[work.id] || 0) === star
                                                    }
                                                >
                                                    <Star
                                                        size={27}
                                                        fill={
                                                            star <= (ratings[work.id] || 0)
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <label
                                        className="review-comment-label"
                                        htmlFor={`review-comment-${work.id}`}
                                    >
                                        Comment (optional)
                                    </label>

                                    <textarea
                                        id={`review-comment-${work.id}`}
                                        className="review-comment-input"
                                        rows={3}
                                        maxLength={1000}
                                        placeholder="How was your experience with this worker?"
                                        value={comments[work.id] || ""}
                                        onChange={(event) =>
                                            setComments((previous) => ({
                                                ...previous,
                                                [work.id]: event.target.value,
                                            }))
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="submit-review-button"
                                        onClick={() => handleSubmitReview(work.id)}
                                        disabled={submittingId === work.id}
                                    >
                                        {submittingId === work.id
                                            ? "Submitting..."
                                            : "Submit Review"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="reviews-section">
                    <div className="reviews-section-heading">
                        <h2>Review History</h2>
                        <span>{reviews.length}</span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="reviews-empty">
                            <MessageSquare size={30} />
                            <h3>No reviews yet</h3>
                            <p>
                                Your submitted reviews will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="review-history-list">
                            {reviews.map((review) => (
                                <article
                                    className="review-history-card"
                                    key={review.id}
                                >
                                    <div className="review-history-top">
                                        <div>
                                            <h3>
                                                {review.work_title ||
                                                    `Work #${review.work}`}
                                            </h3>
                                            <p>
                                                Worker: {review.worker_username}
                                            </p>
                                        </div>

                                        <div className="review-rating-badge">
                                            <Star
                                                size={15}
                                                fill="currentColor"
                                            />
                                            {review.rating}/5
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p className="review-history-comment">
                                            {review.comment}
                                        </p>
                                    )}

                                    <span className="review-history-date">
                                        <Clock size={13} />
                                        {new Date(
                                            review.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
    );
}

export default CustomerReviews;
