import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../assets/css/admin/common/form.css";

const EditAdmin = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const admin = state?.admin;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");
  const [password, setPassword] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(""); // For live preview

  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [existingUserRoles, setExistingUserRoles] = useState([]);
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

    // Revoke previous preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // Generate new preview
  };

  const handleButtonClick = () => {
    document.getElementById("editImageInputFile").click();
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleHamburgerClick = () => {
    if (window.toggleAdminSidebar) window.toggleAdminSidebar();
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!admin) {
      navigate("/admin/manage-clients");
      return;
    }

    setName(admin.name || "");
    setEmail(admin.email || "");
    setPhoneNumber(admin.number || "");
    setStatus(admin.status || "active");

    const fetchRolesAndUserRoles = async () => {
      try {
        const rolesRes = await api.get("/roles");
        const allRoles = Array.isArray(rolesRes.data) ? rolesRes.data : [];
        const visibleRoles = allRoles.filter((r) => r.name?.toLowerCase() !== "admin");
        setRoles(visibleRoles);

        let selectedIds = [];
        let userRoles = [];

        try {
          const userRolesRes = await api.get(`/user-roles/${admin.id}`);
          userRoles = Array.isArray(userRolesRes.data) ? userRolesRes.data : [];
        } catch (err) {
          console.error("Failed to fetch user roles:", err);
        }

        setExistingUserRoles(userRoles);
        selectedIds = userRoles.map((ur) => ur.role_id);
        setSelectedRoleIds(selectedIds);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };

    fetchRolesAndUserRoles();
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!admin || submitting) return;

    if (!name || !email || !phoneNumber || selectedRoleIds.length === 0) {
      toast.warn("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("number", phoneNumber);
      formData.append("address", address);
      formData.append("status", status);
      if (password.trim()) formData.append("password", password);
      if (profileFile) formData.append("img", profileFile);

      await api.put(`/users/${admin.id}`, formData);

      if (existingUserRoles.length > 0) {
        await Promise.all(existingUserRoles.map((ur) => api.delete(`/user-roles/${ur.id}`)));
      }

      await Promise.all(
        selectedRoleIds.map((roleId) =>
          api.post("/user-roles", { user_id: admin.id, role_id: roleId })
        )
      );

      toast.success("Client updated successfully");
      navigate("/admin/manage-clients");
    } catch (err) {
      toast.error("Failed to update client");
    } finally {
      setSubmitting(false);
    }
  };

  if (!admin) return null;

  return (
    <>
      <Sidebar />

      <main className="admin-panel-header-div no-navbar">
        <div className="add-form-header">
          <Link to="/admin/manage-clients" className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>
          <h5>Edit Client</h5>
          <button className="form-hamburger-btn" onClick={handleHamburgerClick} aria-label="Toggle sidebar">
            <FiMenu />
          </button>
        </div>

        <div className="form-content-after-header">
          <form onSubmit={handleSubmit} className="form-layout">
            <div>
              <div className="form-card">
                <h6>General Information</h6>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label>New Password (optional)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
                </div>
              </div>

              <div className="form-card">
                <h6>Profile Photo</h6>
                <div className="upload-box" onClick={handleButtonClick}>
                  {previewUrl ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={previewUrl}
                        alt="New profile preview"
                        style={{
                          width: "100%",
                          maxWidth: 240,
                          height: 240,
                          objectFit: "cover",
                          borderRadius: 16,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        }}
                      />
                      <p style={{ marginTop: 14, fontSize: 13, color: "#555" }}>
                        New image – Click to change
                      </p>
                    </div>
                  ) : admin.img ? (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={`/uploads/${admin.img}`}
                        alt="Current profile"
                        style={{
                          width: "100%",
                          maxWidth: 240,
                          height: 240,
                          objectFit: "cover",
                          borderRadius: 16,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        }}
                      />
                      <p style={{ marginTop: 14, fontSize: 13, color: "#555" }}>
                        Current photo – Click to replace
                      </p>
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
                    id="editImageInputFile"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

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

              <div className="desktop-save-wrapper">
                <button className="desktop-save-btn" onClick={handleSubmit} disabled={submitting}>
                  <MdSave />
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="sticky-bottom-save">
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </>
  );
};

export default EditAdmin;