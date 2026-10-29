
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    loginUser,
    logoutUser,
    getProfile,
    getSessionStatus
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (credentials) => {
        setLoading(true);

        try {
            // Django validates credentials and sets HttpOnly cookies.
            const data = await loginUser(credentials);

            // No JWT is read or stored by React.
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

    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    };


    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            try {
                const session = await getSessionStatus();

                if (!session.has_session) {
                    if (!cancelled) setUser(null);
                    return;
                }

                const profile = await getProfile();

                if (!cancelled) {
                    setUser(profile);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, []);


    const value = {
        user,
        setUser,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
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
