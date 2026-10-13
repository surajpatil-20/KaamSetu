import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };
    const { user } = useAuth();

    return (
        <div className="dashboard-layout">
            <Navbar
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="dashboard-body">
                <Sidebar
                    role={user?.role}
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                />

                {sidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={closeSidebar}
                    />
                )}

                <main className="dashboard-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;