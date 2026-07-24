import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useAuth } from "../../context/AuthContext";
import "../../styles/unified-design-system.css";
import "./page.css";
import "./UserProfile.css";

const UserProfile = () => {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/user/login");
  };

  const initials = account?.fullName
    ? account.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{initials}</div>
        </div>

        {/* Name & role */}
        <h1 className="profile-name">{account?.fullName || "Guest"}</h1>
        <span className="profile-role">
          {account?.role === "foodPartner" ? "🍽️ Food Partner" : "🧑 User"}
        </span>

        {/* Info cards */}
        <div className="profile-info-cards">
          <div className="profile-info-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <div className="profile-info-card__text">
              <span className="profile-info-card__label">Email</span>
              <span className="profile-info-card__value">{account?.email || "—"}</span>
            </div>
          </div>

          <div className="profile-info-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div className="profile-info-card__text">
              <span className="profile-info-card__label">Account Type</span>
              <span className="profile-info-card__value">
                {account?.role === "foodPartner" ? "Food Partner" : "Regular User"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="profile-actions">
          <button className="profile-action-btn" onClick={() => navigate("/orders")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            My Orders
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="profile-action-chevron">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className="profile-action-btn" onClick={() => navigate("/saved")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Saved Reels
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="profile-action-chevron">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className="profile-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default UserProfile;
