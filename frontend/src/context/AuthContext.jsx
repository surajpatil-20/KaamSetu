import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    getProfile,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(false);

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );

    const login = async (credentials) => {
        setLoading(true);

        try {
            // Login
            const data = await loginUser(credentials);

            // Save tokens
            localStorage.setItem(
                "accessToken",
                data.access
            );

            localStorage.setItem(
                "refreshToken",
                data.refresh
            );

            setAccessToken(data.access);

            // Get logged-in user profile
            const profile = await getProfile();

            setUser(profile);

            return {
                ...data,
                user: profile,
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setAccessToken(null);
        setUser(null);
    };

    // Restore user when page is refreshed
    useEffect(() => {
        const loadProfile = async () => {
            if (!accessToken) {
                return;
            }

            try {
                const profile = await getProfile();
                setUser(profile);
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );

                logout();
            }
        };

        loadProfile();
    }, [accessToken]);

    const value = {
        user,
        setUser,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!accessToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}