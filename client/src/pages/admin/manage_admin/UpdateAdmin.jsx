import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";

// ⬇️ axios instance import
import api from "../../../api/axiosInstance";
import { IoMdArrowDropright } from "react-icons/io";

const EditAdmin = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const admin = state?.admin;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("active");
  const [profileFile, setProfileFile] = useState(null);

  const [password, setPassword] = useState(""); // new password (optional)

  const [roles, setRoles] = useState([]); // all roles except admin
  const [selectedRoleIds, setSelectedRoleIds] = useState([]); // role ids checked
  const [existingUserRoles, setExistingUserRoles] = useState([]); // mappings from DB

  const [submitting, setSubmitting] = useState(false);

  // 🔒 allowed file types (frontend check)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    setProfileFile(file);
  };

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
        // 1) all roles
        const rolesRes = await api.get("/roles");
        const allRoles = Array.isArray(rolesRes.data) ? rolesRes.data : [];

        const visibleRoles = allRoles.filter(
          (r) => r.name?.toLowerCase() !== "admin"
        );
        setRoles(visibleRoles);

        // 2) current roles from users_roles
        let selectedIds = [];
        let userRoles = [];

        try {
          const userRolesRes = await api.get(`/user-roles/${admin.id}`);
          userRoles = Array.isArray(userRolesRes.data)
            ? userRolesRes.data
            : [];
        } catch (err) {
          console.error("Failed to fetch user roles:", err);
        }

        setExistingUserRoles(userRoles);

        if (userRoles.length > 0) {
          selectedIds = userRoles.map((ur) => ur.role_id);
        } else if (admin.roles) {
          const roleNames = admin.roles
            .split(",")
            .map((r) => r.trim().toLowerCase())
            .filter(Boolean);

          selectedIds = visibleRoles
            .filter((r) => roleNames.includes(r.name.toLowerCase()))
            .map((r) => r.id);
        }

        setSelectedRoleIds(selectedIds);
      } catch (err) {
        console.error("Failed to fetch roles / user roles:", err);
      }
    };

    fetchRolesAndUserRoles();
  }, [admin, navigate]);

  const handleButtonClick = () => {
    document.getElementById("editImageInputFile").click();
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!admin || submitting) return;

    if (!name) {
      alert("Please enter name");
      return;
    }
    if (!email) {
      alert("Please enter email");
      return;
    }
    if (!phoneNumber) {
      alert("Please enter phone number");
      return;
    }
    if (selectedRoleIds.length === 0) {
      alert("Please select at least one role");
      return;
    }

    try {
      setSubmitting(true);

      // 1) update user data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("number", phoneNumber);
      formData.append("status", status);

      if (password && password.trim() !== "") {
        formData.append("password", password);
      }

      if (profileFile) {
        formData.append("img", profileFile);
      }

      await api.put(`/users/${admin.id}`, formData);

      // 2) delete old role mappings
      if (existingUserRoles.length > 0) {
        await Promise.all(
          existingUserRoles.map((ur) =>
            api.delete(`/user-roles/${ur.id}`)
          )
        );
      }

      // 3) assign new roles
      await Promise.all(
        selectedRoleIds.map((roleId) =>
          api.post("/user-roles", {
            user_id: admin.id,
            role_id: roleId,
          })
        )
      );

      navigate("/admin/manage-clients");
    } catch (err) {
      console.error("Failed to update admin:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!admin) return null;

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <div
          className="admin-dashboard-main-header"
          style={{ marginBottom: "24px" }}
        >
          <div>
            <h5>Edit Client</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard 
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/manage-clients" className="breadcrumb-link active">
                 Clients List
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Edit Client</span>
            </div>
          </div>
          <div className="admin-panel-header-add-buttons">
            <NavLink
              to="/admin/manage-clients"
              className="cancel-btn dashboard-add-product-btn"
            >
              <HiXMark /> Cancel
            </NavLink>
            <button
              className="primary-btn dashboard-add-product-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <MdSave /> {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="dashboard-add-content-card-div">
          {/* LEFT SIDE */}
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>General Information</h6>
              <div className="add-product-form-container">
                <div className="coupon-code-input-profile">
                  <div>
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Type full name here..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email">Email</label>
                    <input
                      type="text"
                      id="edit-email"
                      placeholder="Type your email here..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-phone-number">Phone Number</label>
                    <input
                      type="text"
                      id="edit-phone-number"
                      placeholder="Type your phone number here..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="coupon-code-input-profile">
                  <div>
                    <label htmlFor="edit-password">New Password (optional)</label>
                    <input
                      type="password"
                      id="edit-password"
                      placeholder="Enter new password to change"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="dashboard-add-content-right-side">
            <div className="dashboard-add-content-card">
              <h6>Profile</h6>
              <div className="add-product-form-container">
                <label htmlFor="edit-photo">Photo</label>
                <div className="add-product-upload-container">
                  <div className="add-product-upload-icon">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png"
                      alt="Upload"
                    />
                  </div>
                  <p className="add-product-upload-text">
                    Drag and drop image here, or click add image
                  </p>
                  <button
                    type="button"
                    className="add-product-upload-btn secondary-btn"
                    onClick={handleButtonClick}
                  >
                    Add Image
                  </button>
                  <input
                    type="file"
                    id="editImageInputFile"
                    style={{ display: "none" }}
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="dashboard-add-content-card">
              <h6>Status</h6>
              <div className="add-product-form-container">
                <label htmlFor="edit-admin-status">Client Status</label>
                <select
                  id="edit-admin-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="block">Blocked</option>
                </select>
              </div>
            </div>

            {/* Roles */}
            <div className="dashboard-add-content-card">
              <h6>Roles</h6>
              <div className="add-product-form-container">
                {roles.length === 0 ? (
                  <p style={{ fontSize: "14px" }}>No roles available</p>
                ) : (
                  <div className="roles-checkbox-group">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="role-checkbox-item"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />{" "}
                        {role.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EditAdmin;
