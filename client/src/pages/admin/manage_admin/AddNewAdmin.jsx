import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";

// ⬇️ use axios instance instead of axios + baseURL
import api from "../../../api/axiosInstance";

const AddNewAdmin = () => {
  const navigate = useNavigate();

  // exactly same as DB / backend
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [altNumber, setAltNumber] = useState("");
  const [status, setStatus] = useState("active");
  const [password, setPassword] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // fetch roles (simple, now via api instance)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        const allRoles = Array.isArray(res.data) ? res.data : [];

        // "admin" role UI se hide rakhenge
        const visibleRoles = allRoles.filter(
          (r) => r.name?.toLowerCase() !== "admin"
        );

        setRoles(visibleRoles);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };

    fetchRoles();
  }, []);

  const handleButtonClick = () => {
    document.getElementById("imageInputFile").click();
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
    if (submitting) return;

    if (!name) {
      alert("Please enter name");
      return;
    }
    if (!email) {
      alert("Please enter email");
      return;
    }
    if (!number) {
      alert("Please enter phone number");
      return;
    }
    if (!password) {
      alert("Please enter password");
      return;
    }
    if (selectedRoleIds.length === 0) {
      alert("Please select at least one role");
      return;
    }

    try {
      setSubmitting(true);

      // 1) create user – exactly same fields as backend
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("number", number);
      if (altNumber) formData.append("alt_number", altNumber);
      formData.append("password", password);
      formData.append("status", status);
      if (profileFile) formData.append("img", profileFile);

      const userRes = await api.post("/users", formData);
      const userId = userRes.data?.insertId;

      // 2) assign roles
      if (userId) {
        await Promise.all(
          selectedRoleIds.map((roleId) =>
            api.post("/user-roles", {
              user_id: userId,
              role_id: roleId,
            })
          )
        );
      }

      navigate("/admin/manage-admins");
    } catch (err) {
      console.error("Failed to save admin:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
            <h5>Add Admin</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/manage-admins" className="breadcrumb-link active">
                Admin List
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Add Admin</span>
            </div>
          </div>
          <div className="admin-panel-header-add-buttons">
            <NavLink
              to="/admin/manage-admins"
              className="cancel-btn dashboard-add-product-btn"
            >
              <HiXMark /> Cancel
            </NavLink>
            <button
              className="primary-btn dashboard-add-product-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <MdSave /> {submitting ? "Saving..." : "Save Admin"}
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
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Type full name here..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      id="email"
                      placeholder="Type your email here..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label htmlFor="phone-number">Phone Number</label>
                    <input
                      type="text"
                      id="phone-number"
                      placeholder="Type your phone number here..."
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="alt-phone-number">Alt Phone Number</label>
                    <input
                      type="text"
                      id="alt-phone-number"
                      placeholder="Type your alternate phone number here..."
                      value={altNumber}
                      onChange={(e) => setAltNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="coupon-code-input-profile">
                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Type password here..."
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
            {/* Profile */}
            <div className="dashboard-add-content-card">
              <h6>Profile</h6>
              <div className="add-product-form-container">
                <label htmlFor="photo">Photo</label>
                <div className="add-product-upload-container">
                  <div className="add-product-upload-icon">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png"
                      alt="Upload Icon"
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
                    id="imageInputFile"
                    name="img"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProfileFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="dashboard-add-content-card">
              <h6>Status</h6>
              <div className="add-product-form-container">
                <label htmlFor="admin-status">Admin Status</label>
                <select
                  id="admin-status"
                  name="status"
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
                        style={{ display: "block", marginBottom: "6px" }}
                      >
                        <input
                          type="checkbox"
                          value={role.id}
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

export default AddNewAdmin;
