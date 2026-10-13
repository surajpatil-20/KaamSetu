import DashboardLayout from "./layouts/DashboardLayout";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/public/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyPhone from "./pages/auth/VerifyPhone";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import PostWork from "./pages/customer/PostWork";
import CustomerMyWorks  from "./pages/customer/MyWorks";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import AvailableWorks from "./pages/worker/AvailableWorks";
import WorkerMyApplications  from "./pages/worker/WorkerMyApplications ";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import WorkDetails from "./pages/customer/WorkDetails";
import Applications from "./pages/customer/Applications";
import CustomerApplications from "./pages/customer/CustomerApplications";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import CustomerReviews from "./pages/customer/CustomerReviews";
import CustomerProfile from "./pages/customer/CustomerProfile";

import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerMyWorks  from "./pages/worker/MyWorks";
import WorkerNotifications from "./pages/worker/WorkerNotifications";
import WorkerReviews from "./pages/worker/WorkerReviews";

function App() {

    return (
        <Routes>

            {/* Public Routes */}

            <Route
                path="/"
                element={<Landing />}
            />

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

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />
                
            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />


            {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
                {/* Customer Routes */}
                <Route element={<RoleRoute allowedRole="CUSTOMER" />}>
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
                        element={<CustomerMyWorks  />}
                    />
                    <Route
                        path="/customer/works/:id"
                        element={<WorkDetails />}
                    />
                    <Route
                        path="/customer/works/:id/applications"
                        element={<Applications />}
                    />
                    <Route
                        path="/customer/applications"
                        element={<CustomerApplications />}
                    />
                    <Route
                        path="/customer/notifications"
                        element={<CustomerNotifications />}
                    />
                    <Route
                        path="/customer/reviews"
                        element={<CustomerReviews />}
                    />
                    <Route
                        path="/customer/profile"
                        element={<CustomerProfile />}
                    />
                </Route>
            
                {/* Worker Routes */}
                <Route element={<RoleRoute allowedRole="WORKER" />}>

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
                        element={<WorkerMyApplications  />}
                    />

                    <Route
                        path="/worker/profile"
                        element={<WorkerProfile />}
                    />

                    <Route
                        path="/worker/my-works"
                        element={<WorkerMyWorks  />}
                    />
                    <Route
                        path="/worker/notifications"
                        element={<WorkerNotifications/>}
                    />
                    <Route
                        path="/worker/reviews"
                        element={<WorkerReviews/>}
                    />

                </Route>
            </Route>
        </Route>

        </Routes>
    );
}

export default App;