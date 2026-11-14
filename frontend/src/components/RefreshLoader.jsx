import "./RefreshLoader.css";

function RefreshLoader() {
    return (
        <div className="refresh-loader-overlay">
            <div className="refresh-loader-spinner" />
            <p>Loading KaamSetu...</p>
        </div>
    );
}

export default RefreshLoader;