import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/partner-design-system.css";

/* =========================================================
   NAV ICONS (Shared SVG icon family)
   ======================================================== */
export const PartnerNavIcon = ({ type, active }) => {
  const stroke = active ? "#6DDC74" : "#7C9880";

  switch (type) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" strokeWidth="2">
          <path d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-5H4v5zm10-16v5h6V4h-6z" stroke={stroke} />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={stroke} />
          <path d="M7 8h10M7 12h6" stroke={stroke} />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" stroke={stroke} />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" stroke={stroke} />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" fill="none" strokeWidth="2">
          <circle cx="12" cy="8" r="4" stroke={stroke} />
          <path d="M5 20a7 7 0 0 1 14 0" stroke={stroke} />
        </svg>
      );
    default:
      return null;
  }
};

/* =========================================================
   BOTTOM NAVIGATION
   ======================================================== */
export const PartnerBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", key: "dashboard", path: "/foodpartner/dashboard" },
    { label: "Orders", key: "orders", path: "/foodpartner/orders" },
    { label: "Menu", key: "menu", path: "/foodpartner/menu" },
    { label: "Analytics", key: "analytics", path: "/foodpartner/analytics" },
    { label: "Profile", key: "profile", path: "/foodpartner/profile" },
  ];

  return (
    <nav className="partner-nav" role="navigation" aria-label="Partner Navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.key === "orders" && location.pathname === "/foodpartner/orders");

        return (
          <Link
            key={item.key}
            to={item.path}
            className={`nav-item ${isActive ? "active" : ""}`}
            title={item.label}
          >
            <PartnerNavIcon type={item.key} active={isActive} />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

/* =========================================================
   TOP HEADER
   ======================================================== */
export const PartnerHeader = ({ title, subtitle, showNotification = true }) => {
  const { account } = useAuth();
  const navigate = useNavigate();

  const restaurantName = account?.bussinessName || account?.fullName || "Partner Dashboard";
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="partner-top-header">
      <div className="partner-header-inner">
        <div className="partner-header-left">
          <div>
            <h1 className="partner-header-title">{title || restaurantName}</h1>
            <p className="partner-header-subtitle">
              {subtitle || `${currentDate} • Welcome back`}
            </p>
          </div>
        </div>

        <div className="partner-header-actions">
          <div className="live-badge" title="Live store status">
            <span className="live-dot"></span>
            LIVE
          </div>

        </div>
      </div>
    </header>
  );
};

/* =========================================================
   LAYOUT WRAPPER
   ======================================================== */
export const PartnerLayout = ({ children, title, subtitle, showHeader = true }) => {
  return (
    <div className="partner-app-container">
      {showHeader && <PartnerHeader title={title} subtitle={subtitle} />}
      <main className="partner-main-content">{children}</main>
      <PartnerBottomNav />
    </div>
  );
};

/* =========================================================
   STAT CARD
   ======================================================== */
export const StatCard = ({ title, value, icon, subtitle, trend, onClick, active }) => {
  return (
    <div
      className={`partner-card ${onClick ? "partner-card-hover" : ""} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--partner-text-soft)", textTransform: "uppercase" }}>
          {title}
        </span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--partner-text)", marginBottom: 4 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: trend === "up" ? "var(--partner-primary)" : "var(--partner-text-muted)" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   FOOD CARD
   ======================================================== */
export const FoodCard = ({ food, onEdit, onDelete, onDuplicate, onToggleAvailability }) => {
  const isVeg = food.isVeg !== undefined ? food.isVeg : true;
  const isAvailable = food.isAvailable !== false;

  return (
    <div className="partner-card partner-card-hover" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 14,
            overflow: "hidden",
            background: "#1F3426",
            border: "1px solid var(--partner-border)",
            flexShrink: 0,
          }}
        >
          {food.thumbnail || food.video ? (
            food.thumbnail ? (
              <img src={food.thumbnail} alt={food.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <video src={food.video} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              🍲
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span className={isVeg ? "badge-veg" : "badge-nonveg"}>
              {isVeg ? "🟢 VEG" : "🔴 NON-VEG"}
            </span>
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--partner-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {food.name}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "var(--partner-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {food.description}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--partner-border)" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--partner-primary)" }}>
            ₹{food.price || 0}
          </span>
          {food.prepTime && (
            <span style={{ fontSize: 11, color: "var(--partner-text-soft)", marginLeft: 8 }}>
              ⏱ {food.prepTime} mins
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: isAvailable ? "var(--partner-primary)" : "var(--partner-danger)" }}>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={() => onToggleAvailability && onToggleAvailability(food._id)}
              style={{ accentColor: "var(--partner-primary)" }}
            />
            {isAvailable ? "Available" : "Unavailable"}
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
        {onEdit && (
          <button className="btn-partner-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={() => onEdit(food)}>
            ✏️ Edit
          </button>
        )}
        {onDuplicate && (
          <button className="btn-partner-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={() => onDuplicate(food)}>
            📋 Duplicate
          </button>
        )}
        {onDelete && (
          <button className="btn-partner-danger" style={{ minHeight: 36, padding: "0 12px", fontSize: 12 }} onClick={() => onDelete(food._id)}>
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY STATE & SKELETONS
   ======================================================== */
export const EmptyState = ({ title, message, icon = "✨", actionLabel, onAction }) => (
  <div className="empty-state">
    <div className="empty-illustration">{icon}</div>
    <h2>{title}</h2>
    <p>{message}</p>
    {actionLabel && onAction && (
      <button className="btn-partner-primary" style={{ marginTop: 16 }} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export const SkeletonCard = () => (
  <div className="partner-card skeleton-card">
    <div className="skeleton-line skeleton-line-lg" />
    <div className="skeleton-line skeleton-line-md" />
    <div className="skeleton-line skeleton-line-sm" />
  </div>
);

/* =========================================================
   MODAL & CONFIRMATION DIALOG
   ======================================================== */
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div className="partner-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--partner-text-soft)", fontSize: 20, cursor: "pointer" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: "var(--partner-text-muted)", fontSize: 14, marginBottom: 24 }}>{message}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="btn-partner-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className={isDanger ? "btn-partner-danger" : "btn-partner-primary"} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

/* =========================================================
   TOAST NOTIFICATION
   ======================================================== */
export const Toast = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  return (
    <div className={`partner-toast ${type === "error" ? "partner-toast-error" : "partner-toast-success"}`}>
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 8 }}>
          ✕
        </button>
      )}
    </div>
  );
};
