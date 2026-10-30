
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
    BriefcaseBusiness,
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

                        <div className="landing-footer-social">
                            <span>Created by <strong>Suraj Balkrishna Patil</strong></span>

                            <div className="landing-social-links">
                                <a
                                    href="https://www.instagram.com/suraj.patil_20/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20"
                                        fill="none" stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="5" />
                                        <circle cx="12" cy="12" r="4" />
                                        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                                    </svg>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/suraj-patil-082301354/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20"
                                        fill="currentColor">
                                        <path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.5 9h3.4v11.5H3.5V9Zm5.5 0h3.3v1.6h.1A3.7 3.7 0 0 1 15.8 8c3.5 0 4.2 2.3 4.2 5.2v7.3h-3.4V14c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3v6.6H9V9Z" />
                                    </svg>
                                </a>

                                <a
                                    href="https://github.com/surajpatil-20"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20"
                                        fill="currentColor">
                                        <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.14-1.44 3.07-1.14 3.07-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.52.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <span className="landing-footer-copy">
                            © {new Date().getFullYear()} KaamSetu. All rights reserved.
                        </span>

                    </div>
                </footer>
            </main>
        </>
    );
}

export default Landing;
