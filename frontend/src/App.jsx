import { Routes, Route } from "react-router-dom";

import Landing from "./pages/public/Landing";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyPhone from "./pages/auth/VerifyPhone";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import PostWork from "./pages/customer/PostWork";
import MyWorks from "./pages/customer/MyWorks";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import AvailableWorks from "./pages/worker/AvailableWorks";
import MyApplications from "./pages/worker/MyApplications";

function App() {
    return (
        <Routes>

            {/* Public */}

            <Route
                path="/"
                element={<Landing />}
            />

            {/* Authentication */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/verify-phone"
                element={<VerifyPhone />}
            />

            {/* Customer */}

            <Route
                path="/customer/dashboard"
                element={<CustomerDashboard />}
            />

            <Route
                path="/customer/post-work"
                element={<PostWork />}
            />

            <Route
                path="/customer/works"
                element={<MyWorks />}
            />

            {/* Worker */}

            <Route
                path="/worker/dashboard"
                element={<WorkerDashboard />}
            />

            <Route
                path="/worker/works"
                element={<AvailableWorks />}
            />

            <Route
                path="/worker/applications"
                element={<MyApplications />}
            />

        </Routes>
    );
}

export default App;