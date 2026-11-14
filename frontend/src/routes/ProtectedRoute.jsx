import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import RefreshLoader from "../components/RefreshLoader";
function ProtectedRoute() {

    const {
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
        return <RefreshLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to=    "/login" replace />;
    }
    
    return <Outlet />;
}

export default ProtectedRoute;