import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../../api/axiosInstance";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import "../../../assets/css/admin/pages/myProfile.css"; // Reusing the same CSS!
import Sidebar from "../layout/Sidebar";

const PropertyDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [property, setProperty] = useState(state?.item || null);
  const [loading, setLoading] = useState(!state?.item);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fallback: fetch by ID if accessed directly
  useEffect(() => {
    if (!property) {
      const id = window.location.pathname.split("/").pop();
      const fetchProperty = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/getproperty/${id}`);
          setProperty(res.data);
        } catch (err) {
          console.error("Failed to load property");
          navigate("/admin/properties");
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [property, navigate]);

  if (loading) {
    return (
      <div className="property-detail-loading">
        <div className="loader-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return <div className="ma-empty">Property not found</div>;
  }

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const handleDelete = async () => {
    try {
      await api.delete(`/deleteproperty/${property.id}`);
      navigate("/admin/properties");
    } catch (err) {
      console.error("Delete failed");
    }
  };

  return (
    <>
      {/* Sidebar is imported in parent layout or here if needed */}
      {/* <Sidebar /> */} {/* Assuming it's rendered at higher level */}
      <Sidebar />

      <div className="admin-panel-header-div no-navbar">
        {/* Top Fixed Header */}
        <div className="add-form-header">
          <Link to="/admin/properties" className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>

          <h5>{property.title}</h5>

          <button
            className="form-hamburger-btn"
            onClick={() => window.toggleAdminSidebar && window.toggleAdminSidebar()}
          >
            <FiMenu />
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-container">
          <div className="profile-wrapper">
            {/* Header Actions (Desktop) */}
            <div className="profile-header-row">
              <h6 className="profile-title">Property Details</h6>

              <div className="profile-actions-desktop">
                <button
                  className="primary-btn"
                  onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
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

            {/* Hero Image + Basic Info */}
            <div className="profile-basic-block">
              <div className="profile-avatar">
                <img
                  src={`/uploads/${property.image || "defaultpropertyimage.png"}`}
                  alt={property.title}
                />
              </div>

              <div className="profile-basic-text">
                <h4>{property.title}</h4>
                <p>{property.address}</p>

                <span className={`profile-status ${property.status}`}>
                  {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Price Highlight */}
            <div className="profile-section">
              <h6>Price</h6>
              <div className="info-row">
                <span>Listed Price</span>
                <strong className="property-price-highlight">
                  {formatPrice(property.price)}
                </strong>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="profile-section">
                <h6>Description</h6>
                <div className="info-row description-row">
                  <p>{property.description}</p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="profile-section">
              <h6>Additional Information</h6>
              <div className="info-row">
                <span>Status</span>
                <strong>
                  <span className={`profile-status ${property.status}`}>
                    {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                  </span>
                </strong>
              </div>

              <div className="info-row">
                <span>Added On</span>
                <strong>{formatDate(property.createdAt)}</strong>
              </div>
            </div>

            {/* You can add more sections like Area, Bedrooms, etc. here */}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Actions */}
      <div className="mobile-sticky-actions-fixed">
        <button
          className="primary-btn"
          onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property?"
        message={`Are you sure you want to permanently delete "${property.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
      />
    </>
  );
};

export default PropertyDetail;