import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      const redirectTo = location.pathname.includes("/foodpartner/")
        ? "/foodpartner/login"
        : "/user/login";
      navigate(redirectTo);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAuthPage =
    location.pathname.includes("/user/") ||
    location.pathname.includes("/foodpartner/");

  if (isAuthPage) return null;

  return (
    <header className="header">
      {/* Brand - Text only, rendered once */}
      <span className="header__brand">Food View</span>

      {/* Logout Button */}
      <button
        className="header__logout"
        onClick={handleLogout}
        aria-label="Logout"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </header>
  );
};

export default Header;