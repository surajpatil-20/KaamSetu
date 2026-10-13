
import { useCallback, useEffect, useMemo, useState } from "react";
import { getWorkerReviews } from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";
import "./WorkerReviews.css";

function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function Stars({ rating, size = "normal" }) {
    return (
        <span
            className={`worker-review-stars ${size}`}
            aria-label={`${rating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={star <= rating ? "filled" : "empty"}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

function WorkerReviews() {
    const { user } = useAuth();

    const [reviewData, setReviewData] = useState({
        average_rating: 0,
        total_reviews: 0,
        reviews: [],
    });

    const [sortOrder, setSortOrder] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReviews = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            setError("Unable to identify your worker account. Please sign in again.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getWorkerReviews(user.id);

            setReviewData({
                average_rating: Number(data?.average_rating) || 0,
                total_reviews: Number(data?.total_reviews) || 0,
                reviews: Array.isArray(data?.reviews) ? data.reviews : [],
            });
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Unable to load your reviews. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const ratingCounts = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        reviewData.reviews.forEach((review) => {
            const rating = Number(review.rating);

            if (rating >= 1 && rating <= 5) {
                counts[rating] += 1;
            }
        });

        return counts;
    }, [reviewData.reviews]);

    const sortedReviews = useMemo(() => {
        return [...reviewData.reviews].sort((a, b) => {
            const first = new Date(a.created_at || 0).getTime();
            const second = new Date(b.created_at || 0).getTime();

            return sortOrder === "newest"
                ? second - first
                : first - second;
        });
    }, [reviewData.reviews, sortOrder]);

    if (loading) {
        return (
            <div className="worker-reviews-page">
                <div className="worker-reviews-state">
                    <div className="worker-reviews-spinner" />
                    <p>Loading your reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="worker-reviews-page">
            <header className="worker-reviews-header">
                <div>
                    <span className="worker-reviews-eyebrow">
                        WORKER WORKSPACE
                    </span>
                    <h1>My Reviews</h1>
                    <p>
                        See what customers think about your work and service.
                    </p>
                </div>
            </header>

            {error && (
                <div className="worker-reviews-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={fetchReviews}
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            )}

            {!error && (
                <>
                    <section className="worker-reviews-overview">
                        <div className="worker-reviews-rating-card">
                            <span className="worker-reviews-card-label">
                                Overall Rating
                            </span>

                            <div className="worker-reviews-average">
                                {reviewData.average_rating.toFixed(1)}
                                <span>/ 5</span>
                            </div>

                            <Stars rating={Math.round(reviewData.average_rating)} />

                            <p>
                                Based on {reviewData.total_reviews} review
                                {reviewData.total_reviews === 1 ? "" : "s"}
                            </p>
                        </div>

                        <div className="worker-reviews-breakdown-card">
                            <h2>Rating Breakdown</h2>

                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = ratingCounts[rating];
                                const percentage =
                                    reviewData.total_reviews > 0
                                        ? (count / reviewData.total_reviews) * 100
                                        : 0;

                                return (
                                    <div
                                        className="worker-rating-row"
                                        key={rating}
                                    >
                                        <span className="worker-rating-number">
                                            {rating} ★
                                        </span>

                                        <div className="worker-rating-track">
                                            <div
                                                className="worker-rating-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="worker-rating-count">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="worker-reviews-list-section">
                        <div className="worker-reviews-list-header">
                            <div>
                                <h2>Customer Reviews</h2>
                                <p>
                                    Feedback received from your completed jobs.
                                </p>
                            </div>

                            {reviewData.reviews.length > 1 && (
                                <select
                                    aria-label="Sort reviews"
                                    value={sortOrder}
                                    onChange={(event) =>
                                        setSortOrder(event.target.value)
                                    }
                                >
                                    <option value="newest">
                                        Newest first
                                    </option>
                                    <option value="oldest">
                                        Oldest first
                                    </option>
                                </select>
                            )}
                        </div>

                        {sortedReviews.length === 0 ? (
                            <div className="worker-reviews-empty">
                                <div className="worker-reviews-empty-icon">
                                    ★
                                </div>
                                <h3>No reviews yet</h3>
                                <p>
                                    Once customers review your completed work,
                                    their ratings and comments will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="worker-review-list">
                                {sortedReviews.map((review) => (
                                    <article
                                        className="worker-review-card"
                                        key={review.id}
                                    >
                                        <div className="worker-review-card-top">
                                            <div className="worker-review-customer">
                                                <div className="worker-review-avatar">
                                                    {(review.customer_username ||
                                                        "C")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3>
                                                        {review.customer_username ||
                                                            "Customer"}
                                                    </h3>
                                                    <span>
                                                        Reviewed on{" "}
                                                        {formatDate(
                                                            review.created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="worker-review-rating">
                                                <Stars
                                                    rating={Number(review.rating) || 0}
                                                    size="small"
                                                />
                                                <strong>
                                                    {review.rating}/5
                                                </strong>
                                            </div>
                                        </div>

                                        {review.comment ? (
                                            <p className="worker-review-comment">
                                                {review.comment}
                                            </p>
                                        ) : (
                                            <p className="worker-review-no-comment">
                                                The customer left a rating
                                                without a written comment.
                                            </p>
                                        )}

                                        <div className="worker-review-work">
                                            Work ID: {review.work}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default WorkerReviews;
