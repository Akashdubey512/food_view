import { TriangleAlert, ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/errorPage.css";

export default function ErrorPage({
    message = "Something went wrong. Please try again.",
    title = "Oops!",
    subtitle = "We couldn't complete your request.",
}) {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <div className="error-card">

                <div className="error-icon">
                    <TriangleAlert size={55} />
                </div>

                <span className="error-badge">
                    FOOD VIEW
                </span>

                <h1>{title}</h1>

                <h2>{subtitle}</h2>

                <p>{message}</p>

                <div className="error-actions">
                    <button
                        className="secondary-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <Link to="/" className="primary-btn">
                        <Home size={18} />
                        Home
                    </Link>
                </div>

            </div>
        </div>
    );
}