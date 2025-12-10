// SalesCard.jsx
import React, { useState } from 'react';
import { ChevronDown, Calendar, X } from 'lucide-react';
import '../../../assets/css/admin/cards/SalesCard.css';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

const SalesCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHamburgerClick = () => {
    if (window.toggleAdminSidebar) window.toggleAdminSidebar();
  };

  return (
    <>
      <Sidebar />
      <div className="add-form-header">
        <Link to="/admin/user-dashboard" className="back-arrow-btn">
          <HiOutlineArrowLeft />
        </Link>
        <h5>John Doe</h5>
        <button className="form-hamburger-btn" onClick={handleHamburgerClick} aria-label="Toggle sidebar">
          <FiMenu />
        </button>
      </div>
      <div className="sales-page-container">
        <div className="sales-booking-card">
          {/* Header */}
          <div className="sales-card-header">
            <h2 className="sales-title">Sales</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`sales-toggle-btn ${isExpanded ? 'expanded' : ''}`}
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="sales-divider" />

          {/* Booking ID */}
          <div className="booking-id">#22</div>

          {/* Complex Name */}
          <div className="complex-name">Diamond Complex</div>

          {/* Date */}
          <div className="booking-date">
            <Calendar size={16} />
            <span>Aug 25, 2025</span>
          </div>

          {/* Amount and View Requests */}
          <div className="booking-amount-section">
            <div className="booking-amount">
              Amount: <span className="amount-value">10,000/-</span>
            </div>
            <button className="primary-btn view-requests-btn">
              View 2 Requests
            </button>
          </div>

          {/* Cancel Booking Button */}
          <button className="cancel-booking-btn">
            <X size={18} />
            Cancel Booking
          </button>
        </div>
      </div>
    </>
  );
};

export default SalesCard;