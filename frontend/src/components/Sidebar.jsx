import {
    LayoutDashboard,
    Briefcase,
    ClipboardList,
    Bell,
    Star,
    User,
    PlusCircle,
    Search
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar({ role = "CUSTOMER" }) {

    const customerLinks = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/customer/dashboard",
        },
        {
            label: "Post Work",
            icon: PlusCircle,
            path: "/customer/post-work",
        },
        {
            label: "My Works",
            icon: Briefcase,
            path: "/customer/works",
        },
        {
            label: "Applications",
            icon: ClipboardList,
            path: "/customer/applications",
        },
        {
            label: "Notifications",
            icon: Bell,
            path: "/customer/notifications",
        },
        {
            label: "Reviews",
            icon: Star,
            path: "/customer/reviews",
        },
        {
            label: "Profile",
            icon: User,
            path: "/customer/profile",
        },
    ];

    const workerLinks = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/worker/dashboard",
        },
        {
            label: "Available Works",
            icon: Search,
            path: "/worker/works",
        },
        {
            label: "My Applications",
            icon: ClipboardList,
            path: "/worker/applications",
        },
        {
            label: "My Works",
            icon: Briefcase,
            path: "/worker/my-works",
        },
        {
            label: "Notifications",
            icon: Bell,
            path: "/worker/notifications",
        },
        {
            label: "Reviews",
            icon: Star,
            path: "/worker/reviews",
        },
        {
            label: "Profile",
            icon: User,
            path: "/worker/profile",
        },
    ];

    const links =
        role === "WORKER"
            ? workerLinks
            : customerLinks;

    return (
        <aside className="sidebar">

            {/* Sidebar Logo */}

            <div className="sidebar-logo">
                <span className="logo-kaam">Kaam</span>
                <span className="logo-setu">Setu</span>
            </div>

            {/* Navigation */}

            <nav className="sidebar-navigation">

                {links.map((link) => {

                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive
                                        ? "sidebar-link-active"
                                        : ""
                                }`
                            }
                        >
                            <Icon size={19} />

                            <span>
                                {link.label}
                            </span>
                        </NavLink>
                    );
                })}

            </nav>

        </aside>
    );
}

export default Sidebar;