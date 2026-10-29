import { useEffect, useState } from "react";
import "./RefreshLoader.css";

function RefreshLoader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="refresh-loader-overlay">
            <div className="refresh-loader-spinner" />
            <p>Loading KaamSetu...</p>
        </div>
    );
}

export default RefreshLoader;