import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isSaved = location.pathname === "/saved";

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav__dock">
        {/* Home Link - Icon Only */}
        <Link
          to="/"
          className={`nav-item ${isHome ? "nav-item--active" : ""}`}
          aria-current={isHome ? "page" : undefined}
          aria-label="Home"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-indicator" />
        </Link>

        {/* Saved Link - Icon Only */}
        <Link
          to="/saved"
          className={`nav-item ${isSaved ? "nav-item--active" : ""}`}
          aria-current={isSaved ? "page" : undefined}
          aria-label="Saved"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
          <span className="nav-indicator" />
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;