
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    IndianRupee,
    Clock3,
    Paintbrush,
    Wrench,
    Zap,
    Sparkles,
    Hammer,
    Truck,
    Star,
    Users,
    Search,
    ClipboardList,
    Handshake,
    BriefcaseBusiness
} from "lucide-react";

import "./Landing.css";

const services = [
    {
        title: "Plumbing",
        description: "Pipes, taps and leak repairs",
        icon: Wrench,
        color: "blue",
    },
    {
        title: "Electrical",
        description: "Wiring and electrical repairs",
        icon: Zap,
        color: "orange",
    },
    {
        title: "Painting",
        description: "Give your walls a fresh look",
        icon: Paintbrush,
        color: "purple",
    },
    {
        title: "Cleaning",
        description: "Keep your space spotless",
        icon: Sparkles,
        color: "green",
    },
    {
        title: "Carpentry",
        description: "Furniture and woodwork",
        icon: Hammer,
        color: "yellow",
    },
    {
        title: "Moving",
        description: "Help with shifting and moving",
        icon: Truck,
        color: "pink",
    },
];

const steps = [
    {
        number: "01",
        title: "Post your work",
        description:
            "Describe your task, set your budget, add your location and tell workers when you need the job done.",
        icon: ClipboardList,
    },
    {
        number: "02",
        title: "Choose your worker",
        description:
            "Receive applications, compare proposed prices and worker profiles, then select the right person.",
        icon: Users,
    },
    {
        number: "03",
        title: "Get it done",
        description:
            "Track the work, review the completed task and share your experience with the community.",
        icon: Handshake,
    },
];


function Landing() {
    const { isAuthenticated, user } = useAuth();

    const role = user?.role?.toUpperCase();
    const dashboardPath =
        role === "CUSTOMER"
            ? "/customer/dashboard"
            : role === "WORKER"
            ? "/worker/dashboard"
            : "/login";

    const ctaTo = (guestPath) =>
        isAuthenticated ? dashboardPath : guestPath;

    const ctaLabel = (guestLabel) =>
        isAuthenticated ? "Go to Dashboard" : guestLabel;

    return (
        <>
        <Navbar />
        <main className="landing-page">

            {/* Hero */}
            <section id="home" className="landing-hero">
                <div className="landing-container landing-hero-grid">

                    <div className="landing-hero-content">
                        <div className="landing-eyebrow">
                            <Sparkles size={16} />
                            <span>Your local service marketplace</span>
                        </div>

                        <h1>
                            Great work starts
                            <br />
                            with the <span>right help.</span>
                        </h1>

                        <p className="landing-hero-description">
                            From everyday repairs to home improvements,
                            KaamSetu connects you with skilled workers
                            to get your work done with confidence.
                        </p>

                        <div className="landing-hero-actions">
                            {isAuthenticated ? (
                                <Link
                                    to={dashboardPath}
                                    className="landing-btn landing-btn-primary"
                                >
                                    Go to Dashboard
                                    <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register?role=CUSTOMER"
                                        className="landing-btn landing-btn-primary"
                                    >
                                        Hire a worker
                                        <ArrowRight size={18} />
                                    </Link>
                            
                                    <Link
                                        to="/register?role=WORKER"
                                        className="landing-btn landing-btn-secondary"
                                    >
                                        Find work
                                        <ArrowRight size={18} />
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="landing-trust-points">
                            <span>
                                <CheckCircle2 size={17} />
                                Simple applications
                            </span>

                            <span>
                                <CheckCircle2 size={17} />
                                Clear proposed prices
                            </span>
                        </div>
                    </div>

                    <div className="landing-hero-visual">
                        <div className="landing-visual-glow" />

                        <div className="landing-visual-card">
                            <div className="landing-visual-top">
                                <div>
                                    <span className="landing-small-label">
                                        YOUR NEXT PROJECT
                                    </span>
                                    <h3>Home repairs, made easier.</h3>
                                </div>

                                <div className="landing-visual-icon">
                                    <Wrench size={25} />
                                </div>
                            </div>

                            <div className="landing-visual-task">
                                <div className="landing-task-icon plumbing">
                                    <Wrench size={21} />
                                </div>

                                <div className="landing-task-copy">
                                    <strong>Plumbing repair</strong>
                                    <span>Find workers for your task</span>
                                </div>

                                <CheckCircle2
                                    className="landing-task-check"
                                    size={21}
                                />
                            </div>

                            <div className="landing-visual-task">
                                <div className="landing-task-icon electrical">
                                    <Zap size={21} />
                                </div>

                                <div className="landing-task-copy">
                                    <strong>Electrical work</strong>
                                    <span>Compare applications</span>
                                </div>

                                <CheckCircle2
                                    className="landing-task-check"
                                    size={21}
                                />
                            </div>

                            <div className="landing-visual-task">
                                <div className="landing-task-icon painting">
                                    <Paintbrush size={21} />
                                </div>

                                <div className="landing-task-copy">
                                    <strong>Home painting</strong>
                                    <span>Choose the right worker</span>
                                </div>

                                <CheckCircle2
                                    className="landing-task-check"
                                    size={21}
                                />
                            </div>

                            <div className="landing-visual-bottom">
                                <ShieldCheck size={20} />
                                <span>Your work. Your choice.</span>
                            </div>
                        </div>

                        <div className="landing-floating-card landing-floating-top">
                            <div className="landing-floating-icon">
                                <IndianRupee size={20} />
                            </div>
                            <div>
                                <strong>Compare prices</strong>
                                <span>Choose your budget</span>
                            </div>
                        </div>

                        <div className="landing-floating-card landing-floating-bottom">
                            <div className="landing-floating-icon landing-floating-orange">
                                <Clock3 size={20} />
                            </div>
                            <div>
                                <strong>Easy to get started</strong>
                                <span>Post work in a few steps</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="landing-hero-decoration landing-decoration-one" />
                <div className="landing-hero-decoration landing-decoration-two" />
            </section>

            {/* Benefits strip */}
            <section className="landing-benefits">
                <div className="landing-container landing-benefits-grid">
                    <div className="landing-benefit">
                        <ShieldCheck size={25} />
                        <div>
                            <strong>Worker profiles</strong>
                            <span>Explore skills and experience</span>
                        </div>
                    </div>

                    <div className="landing-benefit">
                        <IndianRupee size={25} />
                        <div>
                            <strong>Budget control</strong>
                            <span>Review proposed prices</span>
                        </div>
                    </div>

                    <div className="landing-benefit">
                        <Star size={25} />
                        <div>
                            <strong>Customer reviews</strong>
                            <span>Share feedback after work</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="landing-section" id="services">
                <div className="landing-container">
                    <div className="landing-section-heading">
                        <span className="landing-section-tag">
                            WHAT DO YOU NEED?
                        </span>

                        <h2>
                            One place for your
                            <span> everyday work.</span>
                        </h2>

                        <p>
                            Find help for the jobs that keep your home
                            and daily life running smoothly.
                        </p>
                    </div>

                    <div className="landing-services-grid">
                        {services.map((service) => {
                            const Icon = service.icon;

                            const serviceContent = (
                                <>
                                    <div
                                        className={`landing-service-icon ${service.color}`}
                                    >
                                        <Icon size={25} />
                                    </div>

                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </>
                            );

                            // Logged-in users see informational service cards without a CTA.
                            if (isAuthenticated) {
                                return (
                                    <article
                                        className="landing-service-card"
                                        key={service.title}
                                    >
                                        {serviceContent}
                                    </article>
                                );
                            }

                            return (
                                <Link
                                    to="/register"
                                    className="landing-service-card"
                                    key={service.title}
                                >
                                    {serviceContent}
                                    <span className="landing-service-link">
                                        Get started
                                        <ArrowRight size={16} />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="landing-services-cta">
                        <p>
                            Have a different task in mind? You can post
                            other types of work too.
                        </p>

                        <Link to={ctaTo("/register")}>
                            {ctaLabel("Post your work")}
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="landing-how-section" id="how-it-works">
                <div className="landing-container">
                    <div className="landing-section-heading">
                        <span className="landing-section-tag">
                            HOW KAAMSETU WORKS
                        </span>

                        <h2>
                            One platform.
                            <span> Two simple journeys.</span>
                        </h2>

                        <p>
                            Whether you need a job done or want to find work,
                            KaamSetu makes the process simple.
                        </p>
                    </div>

                    <div className="landing-journeys-grid">
                        {/* Customer Journey */}
                        <article className="landing-journey-card customer-journey">
                            <div className="landing-journey-heading">
                                <div className="landing-journey-icon">
                                    <Users size={26} />
                                </div>

                                <div>
                                    <span className="landing-journey-label">
                                        FOR CUSTOMERS
                                    </span>
                                    <h3>Get your work done</h3>
                                    <p>Find the right professional for your task.</p>
                                </div>
                            </div>

                            <div className="landing-journey-steps">
                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">01</span>
                                    <div>
                                        <h4>Post your work</h4>
                                        <p>
                                            Describe your task, set your budget and
                                            location, and upload photos if needed.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">02</span>
                                    <div>
                                        <h4>Compare applications</h4>
                                        <p>
                                            Review worker proposals, prices, and
                                            profiles to find the right match.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">03</span>
                                    <div>
                                        <h4>Select your worker</h4>
                                        <p>
                                            Choose a suitable worker and start
                                            the work.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">04</span>
                                    <div>
                                        <h4>Approve and review</h4>
                                        <p>
                                            Review the submitted work, approve
                                            completion, and share your feedback.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={ctaTo("/register?role=CUSTOMER")}
                                className="landing-journey-cta"
                            >
                                {ctaLabel("Hire a worker")} <ArrowRight size={18} />
                            </Link>
                        </article>

                        {/* Worker Journey */}
                        <article className="landing-journey-card worker-journey">
                            <div className="landing-journey-heading">
                                <div className="landing-journey-icon">
                                    <BriefcaseBusiness size={26} />
                                </div>

                                <div>
                                    <span className="landing-journey-label">
                                        FOR WORKERS
                                    </span>
                                    <h3>Turn your skills into income</h3>
                                    <p>Discover tasks and grow your work opportunities.</p>
                                </div>
                            </div>

                            <div className="landing-journey-steps">
                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">01</span>
                                    <div>
                                        <h4>Create your profile</h4>
                                        <p>
                                            Showcase your skills, experience,
                                            and professional information.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">02</span>
                                    <div>
                                        <h4>Discover available work</h4>
                                        <p>
                                            Browse customer tasks that match
                                            your skills and interests.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">03</span>
                                    <div>
                                        <h4>Apply for a task</h4>
                                        <p>
                                            Submit your proposed price and a
                                            message explaining your offer.
                                        </p>
                                    </div>
                                </div>

                                <div className="landing-journey-step">
                                    <span className="landing-journey-number">04</span>
                                    <div>
                                        <h4>Complete the work</h4>
                                        <p>
                                            Once selected, complete the task,
                                            submit it for approval, and build
                                            your reputation through reviews.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={ctaTo("/register?role=WORKER")}
                                className="landing-journey-cta"
                            >
                                {ctaLabel("Find work")} <ArrowRight size={18} />
                            </Link>
                        </article>
                    </div>
                </div>
            </section>


            {/* Separate audiences */}
            <section className="landing-audience-section">
                <div className="landing-container landing-audience-grid">
                    <article className="landing-audience-card customer-audience">
                        <div className="landing-audience-icon">
                            <Search size={27} />
                        </div>

                        <span className="landing-section-tag">
                            FOR CUSTOMERS
                        </span>

                        <h2>Got work to do?</h2>

                        <p>
                            Post your task, receive applications,
                            compare workers and choose who is right
                            for your job.
                        </p>

                        <Link to={ctaTo("/register")}>
                            {ctaLabel("Hire a worker")}
                            <ArrowRight size={18} />
                        </Link>
                    </article>

                    <article className="landing-audience-card worker-audience">
                        <div className="landing-audience-icon">
                            <Hammer size={27} />
                        </div>

                        <span className="landing-section-tag">
                            FOR WORKERS
                        </span>

                        <h2>Ready to put your skills to work?</h2>

                        <p>
                            Create your profile, explore available
                            jobs and apply for work that matches
                            your skills and experience.
                        </p>

                        <Link to={ctaTo("/register")}>
                            {ctaLabel("Find work")}
                            <ArrowRight size={18} />
                        </Link>
                    </article>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-final-cta">
                <div className="landing-container landing-final-cta-inner">
                    <div>
                        <span>YOUR NEXT STEP STARTS HERE</span>
                        <h2>Let's get your work moving.</h2>
                        <p>
                            Join KaamSetu and make finding help
                            or finding work simpler.
                        </p>
                    </div>

                    <Link
                        to={ctaTo("/register")}
                        className="landing-btn landing-btn-light"
                    >
                        {ctaLabel("Create your account")}
                        <ArrowRight size={19} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer" id="about">
                <div className="landing-container landing-footer-inner">
                    <Link to="/" className="landing-footer-brand">
                        <span>K</span>
                        <strong>
                            Kaam<span>Setu</span>
                        </strong>
                    </Link>

                    <p>
                        Connecting people with work and workers
                        with opportunities.
                    </p>

                    <span className="landing-footer-copy">
                        © {new Date().getFullYear()} KaamSetu
                    </span>
                </div>
            </footer>
        </main>
        </>
    );
}

export default Landing;
