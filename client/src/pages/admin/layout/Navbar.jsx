// src/components/admin/Navbar.jsx
import React from "react";
import { FiMenu } from "react-icons/fi";
import "../../../assets/css/admin/navbar.css";

const Navbar = () => {
  const handleHamburgerClick = () => {
    if (window.toggleAdminSidebar) {
      window.toggleAdminSidebar();
    }
  };

  return (
    <nav className="dashboard-navbar">
      {/* LEFT – TITLE */}
      <div className="dashboard-navbar-left">
        <h3 className="dashboard-navbar-title">Quba Property</h3>
      </div>

      {/* RIGHT – HAMBURGER (mobile / tablet via CSS) */}
      <button
        className="dashboard-navbar-hamburger"
        onClick={handleHamburgerClick}
        aria-label="Toggle sidebar"
      >
        <FiMenu />
      </button>
    </nav>
  );
};

export default Navbar;
