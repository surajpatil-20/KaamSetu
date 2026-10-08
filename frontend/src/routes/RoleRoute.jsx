import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRole }) {

    const {
        user,
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user) {
        return <p>Loading user...</p>;
    }

    if (user.role !== allowedRole) {
        if (user.role === "CUSTOMER") {
            return (
                <Navigate
                    to="/customer/dashboard"
                    replace
                />
            );
        }

        if (user.role === "WORKER") {
            return (
                <Navigate
                    to="/worker/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RoleRoute;