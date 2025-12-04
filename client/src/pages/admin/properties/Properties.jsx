// src/pages/admin/properties/Properties.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosEye } from "react-icons/io";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil, IoSearch } from "react-icons/io5";
import "../../../assets/css/admin/pages/mainLayout.css";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommonCard from "../common/CommonCard";

const PAGE_SIZE = 6;

const Properties = () => {
  const [activeTab, setActiveTab] = useState("All Properties");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/getproperties");
      setProperties(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // responsive detection
  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // delete
  const handleDeleteClick = async (e, p) => {
    e.stopPropagation();
    const ok = window.confirm("Are you sure?");
    if (!ok) return;

    try {
      await api.delete(`/deleteproperty/${p.id}`);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openDetails = (p) => navigate(`/admin/property/${p.id}`, { state: { item: p } });

  const onEdit = (e, p) => {
    e.stopPropagation();
    navigate(`/admin/properties/edit/${p.id}`);
  };

  // filter + search
  const filtered = properties.filter((p) => {
    const statusMatch =
      activeTab === "All Properties"
        ? true
        : activeTab === "Available"
        ? p.status === "available"
        : activeTab === "Reserved"
        ? p.status === "reserved"
        : activeTab === "Sold"
        ? p.status === "sold"
        : true;

    const q = searchTerm.trim().toLowerCase();
    const searchMatch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.price.toString().includes(q);

    return statusMatch && searchMatch;
  });

  useEffect(() => setCurrentPage(1), [activeTab, searchTerm]);

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        {/* SEARCH with icon */}
        <div className="ma-search-bar">
          <div className="ma-search-wrapper">
            <span className="ma-search-icon" aria-hidden>
              <IoSearch />
            </span>

            <input
              type="search"
              placeholder="Search by title, address or price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ma-search-input"
              aria-label="Search properties"
            />

            {searchTerm.length > 0 && (
              <button type="button" className="ma-clear-btn" onClick={() => setSearchTerm("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
        </div>

        {/* TABS + ADD */}
        <div className="ma-tabs-row">
          <div className="admin-panel-header-tabs ma-small-tabs">
            {["All", "Available", "Reserved", "Sold"].map((tab) => (
              <button key={tab} className={`admin-panel-header-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <button className="ma-add-btn" onClick={() => navigate("/admin/addproperty")}>
            Add
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="dashboard-table-container">
          {/* Desktop table */}
          {!isMobile && !isTablet && (
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Address</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="ma-empty">
                      Loading…
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((p) => (
                    <tr key={p.id} onClick={() => openDetails(p)}>
                      <td className="product-info">
                        <img src={`/uploads/${p.image || "defaultpropertyimage.png"}`} alt={p.title} />
                        <span>{p.title}</span>
                      </td>

                      <td>{p.address}</td>
                      <td className="ma-price">₹{p.price}</td>

                      <td>
                        <span className={`status ${p.status === "available" ? "published" : p.status === "reserved" ? "low-stock" : "out-of-stock"}`}>
                          {p.status}
                        </span>
                      </td>

                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>

                      <td className="actions">
                        <IoPencil onClick={(e) => onEdit(e, p)} />
                        <IoIosEye onClick={(e) => { e.stopPropagation(); openDetails(p); }} />
                        <MdDeleteForever onClick={(e) => handleDeleteClick(e, p)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="ma-empty">
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Mobile / tablet: card list */}
          {(isMobile || isTablet) && (
            <div className="card-list">
              {paginated.length > 0 ? (
                paginated.map((p) => (
                  <CommonCard key={p.id} avatar={p.image ? `/uploads/${p.image}` : null} title={p.title} subtitle={p.address} meta={`₹${p.price}`} onClick={() => openDetails(p)} compact />
                ))
              ) : (
                <div className="ma-empty">No properties found</div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="table-footer-pagination">
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>

            <ul className="pagination">
              <li onClick={() => changePage(currentPage - 1)}>
                <HiOutlineArrowLeft />
              </li>

              {Array.from({ length: totalPages }).map((_, i) => (
                <li key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => changePage(i + 1)}>
                  {String(i + 1).padStart(2, "0")}
                </li>
              ))}

              <li onClick={() => changePage(currentPage + 1)}>
                <HiOutlineArrowRight />
              </li>
            </ul>
          </div>
        </div>

        <ToastContainer theme="colored" autoClose={3000} hideProgressBar />
      </main>
    </>
  );
};

export default Properties;
