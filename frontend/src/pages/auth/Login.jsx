import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

import api from "../../api/axios";

function Login() {

    const {
        login,
        loading,
        isAuthenticated,
        user,
    } = useAuth();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");

        try {

            const data = await login({
                username,
                password,
            });

            console.log(
                "LOGIN SUCCESS:",
                data
            );

            console.log(
                "LOGGED IN USER:",
                data.user
            );

            setMessage(
                "Login successful ✅"
            );

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error.response?.data || error
            );

            setMessage(
                "Invalid username or password."
            );
        }
    };

    const testWorksAPI = async () => {

        try {

            const response = await api.get(
                "/works/"
            );

            console.log(
                "WORKS RESPONSE:",
                response.data
            );

            setMessage(
                "Works API successful ✅"
            );

        } catch (error) {

            console.error(
                "WORKS ERROR:",
                error.response?.data || error
            );

            setMessage(
                "Works API failed ❌"
            );
        }
    };

    return (
        <div style={{ padding: "40px" }}>

            <h1>
                KaamSetu Login Test
            </h1>

            <form onSubmit={handleLogin}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <br />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br />
                <br />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

                <button
                    type="button"
                    onClick={testWorksAPI}
                    disabled={!isAuthenticated}
                    style={{ marginLeft: "10px" }}
                >
                    Test Works API
                </button>

            </form>

            <p>
                {message}
            </p>

            <p>
                Authenticated:{" "}
                {isAuthenticated
                    ? "Yes ✅"
                    : "No ❌"}
            </p>

            {user && (
                <div style={{ marginTop: "20px" }}>

                    <h3>
                        Current User
                    </h3>

                    <p>
                        Username: {user.username}
                    </p>

                    <p>
                        Email: {user.email}
                    </p>

                    <p>
                        Role: {user.role}
                    </p>

                    <p>
                        User ID: {user.id}
                    </p>

                </div>
            )}

        </div>
    );
}

export default Login;