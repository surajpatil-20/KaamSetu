import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout({
    children,
    role = "CUSTOMER",
}) {
    return (
        <div className="dashboard-layout">

            <Navbar />

            <Sidebar role={role} />

            <main className="dashboard-content">
                {children}
            </main>

        </div>
    );
}

export default DashboardLayout;