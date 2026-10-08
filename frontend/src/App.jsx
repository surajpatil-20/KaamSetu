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

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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

                {/* Customer Routes */}

                <Route element={
                    <RoleRoute allowedRole="CUSTOMER" />
                }>

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

                </Route>


                {/* Worker Routes */}

                <Route element={
                    <RoleRoute allowedRole="WORKER" />
                }>

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

                </Route>

            </Route>

        </Routes>
    );
}

export default App;