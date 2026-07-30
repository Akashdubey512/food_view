import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PartnerLayout, Toast } from "../../components/Partner/PartnerComponents";
import "../../styles/partner-design-system.css";

export default function PartnerSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleSave = () => {
    setToast({ message: "Settings saved successfully!", type: "success" });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/foodpartner/login");
    } catch (err) {
      navigate("/foodpartner/login");
    }
  };

  return (
    <PartnerLayout title="Settings & Preferences" subtitle="Configure merchant app preferences">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680, margin: "0 auto" }}>
        {/* Order Notifications */}
        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>Order Notifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>New Order Push Notifications</div>
                <div style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>Receive instant alerts when orders arrive</div>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => { setNotifications(e.target.checked); handleSave(); }}
                style={{ width: 20, height: 20, accentColor: "var(--partner-primary)", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Sound Alerts</div>
                <div style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>Play chime sound on pending orders</div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => { setSoundAlerts(e.target.checked); handleSave(); }}
                style={{ width: 20, height: 20, accentColor: "var(--partner-primary)", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* Business Operation Settings */}
        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>Kitchen Automation</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Auto Accept Orders</div>
              <div style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>Automatically transition pending orders to accepted</div>
            </div>
            <input
              type="checkbox"
              checked={autoAccept}
              onChange={(e) => { setAutoAccept(e.target.checked); handleSave(); }}
              style={{ width: 20, height: 20, accentColor: "var(--partner-primary)", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* App Appearance & Language */}
        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>App Language & Theme</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Dashboard Theme</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--partner-primary)", background: "rgba(109,220,116,0.14)", padding: "4px 10px", borderRadius: 8 }}>
                🌙 Dark Green (Default)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Language</span>
              <select
                className="partner-select"
                style={{ width: 140, minHeight: 36, fontSize: 12 }}
                value={language}
                onChange={(e) => { setLanguage(e.target.value); handleSave(); }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>Merchant Help & Legal</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            <a href="#help" onClick={(e) => { e.preventDefault(); setToast({ message: "Connecting to Merchant Support...", type: "success" }); }} style={{ color: "var(--partner-primary)", textDecoration: "none", fontWeight: 600 }}>
              🎧 Partner Support & Hotline →
            </a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); setToast({ message: "Opening Merchant Policy...", type: "success" }); }} style={{ color: "var(--partner-text-muted)", textDecoration: "none" }}>
              📄 Merchant Agreement & Terms
            </a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setToast({ message: "Opening Privacy Policy...", type: "success" }); }} style={{ color: "var(--partner-text-muted)", textDecoration: "none" }}>
              🔒 Privacy Policy
            </a>
          </div>
        </div>

        <button className="btn-partner-danger" style={{ width: "100%", marginTop: 8 }} onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </PartnerLayout>
  );
}
