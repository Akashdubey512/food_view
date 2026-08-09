import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  PartnerLayout,
  Modal,
  Toast,
} from "../../components/Partner/PartnerComponents";
import "../../styles/partner-design-system.css";
import api from "../../utils/api";

/* TODO: Backend foodpartner.model.js includes: fullName, bussinessName, email, phoneNumber, address, customerServed. Opening hours, cuisine, gstNumber, and bankDetails can be persisted on backend model. */

export default function PartnerProfile() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Editable profile state
  const [profileData, setProfileData] = useState({
    bussinessName: account?.bussinessName || "Royal Palace Restaurant",
    fullName: account?.fullName || "Partner Owner",
    email: account?.email || "partner@foodpartner.com",
    phoneNumber: account?.phoneNumber || "+91 98765 43210",
    address: account?.address || "123 Commercial Street, Food Quarter",
    openingHours: "10:00 AM - 11:00 PM",
    cuisine: "North Indian, Fast Food, Chinese",
    gstNumber: "29AAAAA0000A1Z5",
    bankDetails: "HDFC Bank • Account ending 4821",
  });

  const [editForm, setEditForm] = useState({ ...profileData });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
        const res = await api.patch(
            "/api/v1/food-partner/edit-profile",
            {
                fullName: editForm.fullName,
                bussinessName: editForm.bussinessName,
                phoneNumber: editForm.phoneNumber,
                address: editForm.address,
            }
        );

        setProfileData({ ...editForm });

        setEditModalOpen(false);

        setToast({
            message: res.data.message || "Profile updated successfully!",
            type: "success",
        });

    } catch (err) {
        console.error(err);

        setToast({
            message:
                err.response?.data?.message || "Failed to update profile",
            type: "error",
        });
    }
};

const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setToast({ message: "New passwords do not match!", type: "error" });
        return;
    }
    try {
        await api.patch(
            "/api/v1/food-partner/change-password",
            {
              currentPassword: passwordForm.oldPassword,
              newPassword: passwordForm.newPassword,
            }
        );

        setPasswordModalOpen(false);
        setPasswordForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setToast({
            message: "Password updated successfully!",
            type: "success",
        });
    } catch (err) {
        setToast({
            message:
                err.response?.data?.message || "Failed to update password",
            type: "error",
        });
    }
};

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/foodpartner/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/foodpartner/login");
    }
  };

  return (
    <PartnerLayout title="Restaurant Profile" subtitle="Manage your merchant details & account">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Profile Banner & Cover */}
      <div className="partner-card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: 120, background: "linear-gradient(135deg, #1A3223 0%, #07120B 100%)", position: "relative" }}>
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
            alt="Cover"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
          />
        </div>

        <div style={{ padding: 20, position: "relative", marginTop: -40 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, border: "4px solid #182218", overflow: "hidden", background: "#1F3426", flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80"
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--partner-text)" }}>
                {profileData.bussinessName}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--partner-primary)", fontWeight: 700 }}>
                {profileData.cuisine}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-partner-primary" style={{ flex: 1 }} onClick={() => { setEditForm({ ...profileData }); setEditModalOpen(true); }}>
              ✏️ Edit Profile
            </button>
            <button className="btn-partner-secondary" style={{ flex: 1 }} onClick={() => setPasswordModalOpen(true)}>
              🔒 Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>Contact & Address Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Owner Name</span>
              <span style={{ fontWeight: 700 }}>{profileData.fullName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Phone Number</span>
              <span style={{ fontWeight: 700 }}>{profileData.phoneNumber}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Email Address</span>
              <span style={{ fontWeight: 700 }}>{profileData.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Store Address</span>
              <span style={{ fontWeight: 700, textAlign: "right", maxWidth: 220 }}>{profileData.address}</span>
            </div>
          </div>
        </div>

        <div className="partner-card">
          <h3 className="partner-section-title" style={{ marginBottom: 14 }}>Business & Regulatory Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Opening Hours</span>
              <span style={{ fontWeight: 700, color: "var(--partner-primary)" }}>{profileData.openingHours}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>GST Number</span>
              <span style={{ fontWeight: 700 }}>{profileData.gstNumber}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--partner-text-soft)" }}>Payout Account</span>
              <span style={{ fontWeight: 700 }}>{profileData.bankDetails}</span>
            </div>
          </div>
        </div>

        <button className="btn-partner-danger" style={{ width: "100%", marginTop: 8 }} onClick={handleLogout}>
          🚪 Log Out of Partner Dashboard
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Restaurant Profile">
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="partner-input-group">
            <label className="partner-input-label">Restaurant Business Name</label>
            <input type="text" className="partner-input" value={editForm.bussinessName} onChange={(e) => setEditForm({ ...editForm, bussinessName: e.target.value })} required />
          </div>
          <div className="partner-input-group">
            <label className="partner-input-label">Owner Full Name</label>
            <input type="text" className="partner-input" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} required />
          </div>
          <div className="partner-input-group">
            <label className="partner-input-label">Phone Number</label>
            <input type="text" className="partner-input" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} required />
          </div>
          <div className="partner-input-group">
            <label className="partner-input-label">Store Address</label>
            <textarea className="partner-textarea" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} required />
          </div>
          <button type="submit" className="btn-partner-primary" style={{ marginTop: 10 }}>Save Changes</button>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="partner-input-group">
            <label className="partner-input-label">Current Password</label>
            <input type="password" className="partner-input" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required />
          </div>
          <div className="partner-input-group">
            <label className="partner-input-label">New Password</label>
            <input type="password" className="partner-input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
          </div>
          <div className="partner-input-group">
            <label className="partner-input-label">Confirm New Password</label>
            <input type="password" className="partner-input" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn-partner-primary" style={{ marginTop: 10 }}>Update Password</button>
        </form>
      </Modal>
    </PartnerLayout>
  );
}
