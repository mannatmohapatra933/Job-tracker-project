import React, { useState } from "react";
import axios from "axios";
import "./Settings.css";

const API_URL = process.env.REACT_APP_API_URL;

export default function Settings({ onLogout, displayName, userEmail }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState(localStorage.getItem("fullName") || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(null); setError(null); }, 3500);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/auth/update-profile`,
        { fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("fullName", fullName);
      showMsg("Profile updated successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update profile.", true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg("New passwords do not match.", true);
      return;
    }
    if (newPassword.length < 6) {
      showMsg("Password must be at least 6 characters.", true);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg("Password changed successfully!");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to change password.", true);
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (localStorage.getItem("fullName") || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="settings-wrap">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and security.</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          {[
            { id: "profile", icon: "person", label: "Profile" },
            { id: "security", icon: "lock", label: "Security" },
            { id: "danger", icon: "logout", label: "Account" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {message && <div className="settings-alert success"><span className="material-symbols-outlined">check_circle</span>{message}</div>}
          {error && <div className="settings-alert error"><span className="material-symbols-outlined">error</span>{error}</div>}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="settings-panel">
              <div className="settings-avatar-row">
                <div className="settings-avatar">{avatarLetter}</div>
                <div>
                  <div className="settings-avatar-name">{displayName}</div>
                  <div className="settings-avatar-email">{userEmail}</div>
                </div>
              </div>
              <form onSubmit={handleProfileSave} className="settings-form">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="settings-field">
                  <label>Email</label>
                  <input type="email" value={userEmail} disabled className="disabled" />
                  <span className="settings-field-hint">Email cannot be changed.</span>
                </div>
                <button className="settings-save-btn" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="settings-panel">
              <h2>Change Password</h2>
              <p className="settings-panel-sub">Make sure your new password is strong and unique.</p>
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="settings-field">
                  <label>Current Password</label>
                  <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <div className="settings-field">
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <button className="settings-save-btn" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="settings-panel">
              <h2>Account Actions</h2>
              <p className="settings-panel-sub">Manage your session and account.</p>
              <div className="settings-danger-card">
                <div>
                  <div className="danger-card-title">Sign Out</div>
                  <div className="danger-card-sub">You will be logged out of your account on this device.</div>
                </div>
                <button className="settings-logout-btn" onClick={onLogout}>
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
