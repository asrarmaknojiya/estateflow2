import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../layout/Sidebar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../assets/css/admin/common/form.css";

const AddNewAdmin = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [altNumber, setAltNumber] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");
  const [password, setPassword] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(""); // Live preview

  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    // Revoke old preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleButtonClick = () => {
    fileRef.current?.click();
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleHamburgerClick = () => {
    if (window.toggleAdminSidebar) window.toggleAdminSidebar();
  };

  // Cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        const allRoles = Array.isArray(res.data) ? res.data : [];
        const visibleRoles = allRoles.filter((r) => r.name?.toLowerCase() !== "admin");
        setRoles(visibleRoles);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    if (!name || !email || !number || !password || selectedRoleIds.length === 0) {
      toast.warn("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("number", number);
      if (altNumber) formData.append("alt_number", altNumber);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("status", status);
      if (profileFile) formData.append("img", profileFile);

      const userRes = await api.post("/users", formData);
      const userId = userRes.data?.insertId;

      if (userId && selectedRoleIds.length > 0) {
        await Promise.all(
          selectedRoleIds.map((roleId) =>
            api.post("/user-roles", { user_id: userId, role_id: roleId })
          )
        );
      }

      toast.success("Client added successfully");
      navigate("/admin/manage-clients");
    } catch (err) {
      toast.error("Failed to add client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar />

      <main className="admin-panel-header-div no-navbar">
        <div className="add-form-header">
          <Link to="/admin/manage-clients" className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>
          <h5>Add Client</h5>
          <button className="form-hamburger-btn" onClick={handleHamburgerClick} aria-label="Toggle sidebar">
            <FiMenu />
          </button>
        </div>

        <div className="form-content-after-header">
          <form onSubmit={handleSubmit} className="form-layout">
            {/* Left Column */}
            <div>
              <div className="form-card">
                <h6>General Information</h6>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="form-group">
                  <label>Alternate Number</label>
                  <input type="text" value={altNumber} onChange={(e) => setAltNumber(e.target.value)} placeholder="Enter alternate number" />
                </div>
                 <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                </div>
              </div>

              {/* Profile Photo with Preview */}
              <div className="form-card">
                <h6>Profile Photo</h6>
                <div className="upload-box" onClick={handleButtonClick}>
                  {previewUrl ? (
                    <div className="image-preview-container">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        style={{
                          width: "100%",
                          maxWidth: 240,
                          height: 240,
                          objectFit: "cover",
                          borderRadius: 16,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        }}
                        className="image-preview-img profile-preview-img"
                      />
                      <p style={{ marginTop: 14, fontSize: 13, color: "#555" }} className="image-preview-text">Image selected – Click to change</p>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png"
                          alt="upload"
                        />
                      </div>
                      <p className="upload-text">Click to upload photo</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    id="imageInputFile"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="form-card">
                <h6>Status</h6>
                <div className="form-group">
                  <label>Client Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="block">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-card">
                <h6>Roles</h6>
                <div className="form-group">
                  {roles.length === 0 ? (
                    <p style={{ color: "#888", fontSize: "14px" }}>No roles available</p>
                  ) : (
                    <div className="roles-selection">
                      {roles.map((role) => (
                        <label key={role.id} className="role-chip">
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                          />
                          <div className="checkmark"></div>
                          <span>{role.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Save Button */}
              <div className="desktop-save-wrapper">
                <button className="desktop-save-btn" onClick={handleSubmit} disabled={submitting}>
                  <MdSave />
                  {submitting ? "Saving..." : "Save Client"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Mobile Sticky Button */}
        <div className="sticky-bottom-save">
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Client"}
          </button>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </>
  );
};

export default AddNewAdmin;