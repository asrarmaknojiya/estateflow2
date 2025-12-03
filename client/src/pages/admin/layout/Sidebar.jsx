// src/components/admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { RiAdminLine, RiCoupon2Line, RiProductHuntLine } from "react-icons/ri";
import { FiLogOut, FiX } from "react-icons/fi";
import { IoGiftOutline } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import "../../../assets/css/admin/sidebar.css";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size (mobile / tablet / desktop)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);

      // Desktop: sidebar always visible
      // Mobile / tablet: sidebar closed by default
      if (width > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Expose toggle so Navbar hamburger can control this sidebar
  useEffect(() => {
    window.toggleAdminSidebar = toggleSidebar;
    return () => {
      delete window.toggleAdminSidebar;
    };
  }, []);

  // Close sidebar on nav click for mobile/tablet
  const handleNavClick = () => {
    if (!(isMobile || isTablet)) return;
    setTimeout(() => {
      setIsSidebarOpen(false);
    }, 120);
  };

  // Scroll lock when sidebar is open on small screens
  useEffect(() => {
    if ((isMobile || isTablet) && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, isMobile, isTablet]);

  // ESC key closes sidebar on small screens
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && (isMobile || isTablet) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isSidebarOpen, isMobile, isTablet]);

  const getSidebarClasses = () => {
    let classes = "admin-dashboard-sidebar";
    if (isMobile) classes += " mobile-sidebar";
    if (isTablet) classes += " tablet-sidebar";
    if ((isMobile || isTablet) && isSidebarOpen) classes += " sidebar-open";
    return classes;
  };

  return (
    <>
      {/* OVERLAY */}
      {(isMobile || isTablet) && isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onKeyDown={(e) => e.key === "Enter" && toggleSidebar()}
        />
      )}

      <aside className={getSidebarClasses()} aria-label="Admin navigation">
        {/* MOBILE / TABLET HEADER WITH LOGO LEFT + CLOSE RIGHT */}
        {(isMobile || isTablet) && (
          <div className="sidebar-mobile-header">
            <div className="admin-sidebar-logo">
              <h4>XCART</h4>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* DESKTOP LOGO */}
        {!isMobile && !isTablet && (
          <div className="admin-sidebar-logo desktop-logo">
            <h4>XCART</h4>
          </div>
        )}

        {/* MENU */}
        <div className="menu-content">
          <h6>MENU</h6>
          <ul>
            <li>
              <NavLink to="/admin/dashboard" onClick={handleNavClick}>
                <RxDashboard />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/properties" onClick={handleNavClick}>
                <RiProductHuntLine />
                <span>Properties</span>
              </NavLink>
            </li>
            <li></li>
            <li>
              <NavLink to="/admin/product" onClick={handleNavClick}>
                <RiProductHuntLine />
                <span>Products</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/category" onClick={handleNavClick}>
                <MdOutlineCategory />
                <span>Category</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" onClick={handleNavClick}>
                <IoGiftOutline />
                <span>Orders</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/coupon" onClick={handleNavClick}>
                <RiCoupon2Line />
                <span>Coupon</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="menu-content">
          <h6>USER MANAGEMENT</h6>
          <ul>
            <li>
              <NavLink to="/admin/manage-clients" onClick={handleNavClick}>
                <RiAdminLine />
                <span>Clients</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* LOGOUT STUCK TO BOTTOM LIKE SCREENSHOT */}
        <div className="menu-content sidebar-logout-section">
          <ul>
            <li>
              <NavLink
                to="/logout"
                onClick={handleNavClick}
                className="sidebar-logout-link"
              >
                <FiLogOut />
                <span>Logout</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
