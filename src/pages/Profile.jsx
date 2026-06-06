import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, updateProfile, updatePassword } from "../services/profileApi";
import "./Profile.css";

const TABS = ["Profile", "Addresses", "Security"];

export default function Profile() {
  const [tab, setTab] = useState("Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "" });
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Profile updated successfully!");

  // Security Password State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Address Dialog / State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", line: "", default: false });

  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    setLoading(true);
    getProfile()
      .then(data => {
        setUser(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          dob: data.dob || "",
          gender: data.gender || "Male"
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
        setError("Please login to view your profile.");
        setLoading(false);
      });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(form);
      setUser(prev => ({ ...prev, ...updated }));
      setEditing(false);
      setSaveMessage("Profile updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Update local storage user details
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...localUser, ...updated }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("New passwords do not match!");
    }
    if (passwordForm.newPassword.length < 8) {
      return setPasswordError("New password must be at least 8 characters");
    }

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || "Failed to change password. Make sure current password is correct.");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.line.trim()) return;

    try {
      const currentAddresses = [...(user.addresses || [])];
      
      // If setting default, unset others
      if (newAddress.default) {
        currentAddresses.forEach(addr => addr.default = false);
      }

      const updatedAddresses = [
        ...currentAddresses,
        { label: newAddress.label, line: newAddress.line, default: newAddress.default }
      ];

      const res = await updateProfile({ addresses: updatedAddresses });
      setUser(prev => ({ ...prev, addresses: res.addresses }));
      setNewAddress({ label: "Home", line: "", default: false });
      setShowAddressForm(false);
      
      setSaveMessage("Address added successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to add address.");
    }
  };

  const handleRemoveAddress = async (addrId) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      const updatedAddresses = (user.addresses || []).filter(addr => (addr._id || addr.id) !== addrId);
      const res = await updateProfile({ addresses: updatedAddresses });
      setUser(prev => ({ ...prev, addresses: res.addresses }));
      
      setSaveMessage("Address removed successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to remove address.");
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const updatedAddresses = (user.addresses || []).map(addr => ({
        ...addr,
        default: (addr._id || addr.id) === addrId
      }));

      const res = await updateProfile({ addresses: updatedAddresses });
      setUser(prev => ({ ...prev, addresses: res.addresses }));
      
      setSaveMessage("Default address updated!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to set default address.");
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px" }}>
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px", color: "var(--red)" }}>
        <h2>Access Denied</h2>
        <p>{error || "Please authenticate first."}</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: "20px" }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="profile-hero">
        <div className="container profile-hero-inner">
          <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{user.name}</h1>
            <p>{user.email} · Member since {user.joinedDate || "Recent"}</p>
          </div>
        </div>
      </div>

      <div className="container profile-container">
        <div className="profile-stats">
          <div className="pstat"><strong>{user.totalOrders || 0}</strong><span>Orders</span></div>
          <div className="pstat-divider"></div>
          <div className="pstat"><strong>₹{user.totalSpent || 0}</strong><span>Total Spent</span></div>
          <div className="pstat-divider"></div>
          <div className="pstat"><strong>Active</strong><span>Status</span></div>
          <div className="pstat-divider"></div>
          <div className="pstat"><strong>Secure</strong><span>Verified</span></div>
        </div>

        <div className="profile-quick-links">
          <Link to="/orders" className="quick-link">📦 My Orders</Link>
          <Link to="/reminders" className="quick-link">⏰ Reminders</Link>
          <Link to="/prescription" className="quick-link">📋 Prescriptions</Link>
          <Link to="/cart" className="quick-link">🛒 Cart</Link>
        </div>

        <div className="profile-tabs">
          {TABS.map(t => (
            <button key={t} className={"ptab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {saved && <div className="save-toast">✅ {saveMessage}</div>}

        {tab === "Profile" && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Personal Information</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "✏️ Edit"}
              </button>
            </div>
            {editing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. +91 98765 43210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-input" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      {["Male","Female","Other","Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            ) : (
              <div className="profile-details">
                {[
                  { label: "Full Name", val: user.name, icon: "👤" },
                  { label: "Email", val: user.email, icon: "✉️" },
                  { label: "Phone", val: user.phone || "Not provided", icon: "📞" },
                  { label: "Date of Birth", val: user.dob || "Not provided", icon: "🎂" },
                  { label: "Gender", val: user.gender || "Not provided", icon: "⚧" },
                  { label: "Joined Date", val: user.joinedDate || "Recent", icon: "📅" },
                ].map(d => (
                  <div className="detail-row" key={d.label}>
                    <span className="detail-icon">{d.icon}</span>
                    <div>
                      <div className="detail-label">{d.label}</div>
                      <div className="detail-val">{d.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Addresses" && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Saved Addresses</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                {showAddressForm ? "Close Form" : "+ Add Address"}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="profile-form" style={{ marginBottom: "24px", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Label</label>
                    <select className="form-input" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})}>
                      <option value="Home">Home 🏠</option>
                      <option value="Work">Work 💼</option>
                      <option value="Other">Other 📍</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "24px" }}>
                    <label style={{ cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
                      <input type="checkbox" checked={newAddress.default} onChange={e => setNewAddress({...newAddress, default: e.target.checked})} style={{ marginRight: "8px" }} />
                      Set as default address
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address line *</label>
                  <input className="form-input" placeholder="e.g. House No, Street, Landmark, City, State, Pincode" value={newAddress.line} onChange={e => setNewAddress({...newAddress, line: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Add Address</button>
              </form>
            )}

            <div className="address-list">
              {(user.addresses || []).length === 0 ? (
                <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>No saved addresses found. Add one above.</p>
              ) : (
                user.addresses.map(addr => {
                  const addrId = addr._id || addr.id;
                  return (
                    <div key={addrId} className={"address-card" + (addr.default ? " default" : "")}>
                      <div className="address-icon">📍</div>
                      <div className="address-info">
                        <div className="address-label">{addr.label} {addr.default && <span className="default-badge">Default</span>}</div>
                        <p>{addr.line}</p>
                      </div>
                      <div className="address-actions">
                        {!addr.default && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleSetDefaultAddress(addrId)}>Set Default</button>
                        )}
                        <button className="btn btn-sm" onClick={() => handleRemoveAddress(addrId)} style={{color:"var(--red)",background:"#fee2e2",border:"none",marginLeft:"8px"}}>Remove</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === "Security" && (
          <div className="profile-card">
            <h3>Change Password</h3>
            {passwordError && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>❌ {passwordError}</div>}
            {passwordSuccess && <div style={{ background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>✅ {passwordSuccess}</div>}
            
            <form className="profile-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" minLength={8} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
