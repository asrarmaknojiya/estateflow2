import React, { useEffect, useState } from "react";
import "../../../assets/css/admin/pages/myProfile.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../layout/Sidebar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import ConfirmModal from "../../../components/modals/ConfirmModal";

function MyProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [matchedRoles, setMatchedRoles] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const user = state?.client || authUser;

  const ROLE_MAP = {
    1: "Admin",
    2: "Seller",
    3: "Buyer",
    4: "Broker",
    5: "Retailer",
  };

  useEffect(() => {
    (async () => {
      const res = await api.get(`/user-roles/${user.id}`);
      const roles = Array.isArray(res.data) ? res.data : [];
      setMatchedRoles(
        roles.map((r) => ROLE_MAP[r.role_id]).filter(Boolean)
      );
    })();
  }, []);

  const profileData = {
    name: user.name,
    email: user.email,
    phone: `+91 ${user.number}`,
    altPhone: user?.alt_number ? `+91 ${user.alt_number}` : "",
    address: user.address || "-",
    status: user.status,
    img: `/uploads/${user.img}`,
  };

  return (
    <>
      <Sidebar />

      <div className="admin-panel-header-div no-navbar">
        <div className="add-form-header">
          <Link to="/admin/user-dashboard" className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>

          <h5>{profileData.name}</h5>

          <button
            className="form-hamburger-btn"
            onClick={() =>
              window.toggleAdminSidebar && window.toggleAdminSidebar()
            }
          >
            <FiMenu />
          </button>
        </div>

        <div className="profile-container">
          <div className="profile-wrapper">

            {/* ===== HEADER LINE (DESKTOP ONLY ACTIONS) ===== */}
            <div className="profile-header-row">
              <h6 className="profile-title">Profile information</h6>

              <div className="profile-actions-desktop">
                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate("/admin/edit-client", { state: { user } })
                  }
                >
                  <FaEdit /> Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>

            {/* ===== PROFILE BASIC INFO ===== */}
            <div className="profile-basic-block">
              <div className="profile-avatar">
                <img src={profileData.img} alt="profile" />
              </div>

              <div className="profile-basic-text">
                <h4>{profileData.name}</h4>
                <p>{profileData.email}</p>

                <span className={`profile-status ${profileData.status}`}>
                  {profileData.status}
                </span>
              </div>
            </div>

            {/* ===== USER INFO ===== */}
            <div className="profile-section">
              <h6>User information</h6>

              <div className="info-row">
                  <span>Full Name</span>
                  <strong>{profileData.name}</strong>
                </div>

                <div className="info-row">
                  <span>Email</span>
                  <strong>{profileData.email}</strong>
                </div>

                <div className="info-row">
                  <span>Phone</span>
                  <strong>{profileData.phone}</strong>
                </div>

                {profileData.altPhone && (
                  <div className="info-row">
                    <span>Alt Phone</span>
                    <strong>{profileData.altPhone}</strong>
                  </div>
                )}
            </div>

            {/* ===== ADDRESS ===== */}
            <div className="profile-section">
              <h6>Address information</h6>
              <div className="info-row">
              <span>Address</span>
                <strong>{profileData.address}</strong>
              </div>
            </div>

            {/* ===== ROLES ===== */}
            <div className="profile-section">
              <h6>Role details</h6>

              <div className="profile-roles-container">
                {matchedRoles.map((r, i) => (
                  <span key={i} className="profile-role-badge">
                    {r}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===== MOBILE STICKY ACTIONS ===== */}
      <div className="mobile-sticky-actions-fixed">
        <button
          className="primary-btn"
          onClick={() =>
            navigate("/admin/edit-client", { state: { user } })
          }
        >
          <FaEdit /> Edit
        </button>

        <button
          className="delete-btn"
          onClick={() => setIsConfirmOpen(true)}
        >
          <FaTrash /> Delete
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() =>
          api.put(`/trash-user/${user.id}`, { status: "trash" })
        }
      />
    </>
  );
}

export default MyProfile;
