import React, { useEffect, useState, useRef } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil, IoSearch } from "react-icons/io5";
import { IoFilterOutline, IoChevronDown } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../assets/css/admin/pages/mainLayout.css";
import CommonCard from "../common/CommonCard";
import { useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa";




const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "All", label: "All " },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" }
];

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchProperties();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = async (e, p) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await api.delete(`/deleteproperty/${p.id}`);
      toast.success("Property deleted");
      setProperties(prev => prev.filter(item => item.id !== p.id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openDetails = (p) => navigate(`/admin/property/${p.id}`, { state: { item: p } });
  const onEdit = (e, p) => {
    e.stopPropagation();
    navigate(`/admin/properties/edit/${p.id}`);
  };

  // Filter logic
  const filtered = properties.filter((p) => {
    const statusMatch = selectedStatus === "All" || p.status === selectedStatus;
    const q = searchTerm.trim().toLowerCase();
    const searchMatch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.price?.toString().includes(q);
    return statusMatch && searchMatch;
  });

  useEffect(() => setCurrentPage(1), [selectedStatus, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (p) => p >= 1 && p <= totalPages && setCurrentPage(p);

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        {/* SEARCH */}
        <div className="ma-search-bar">
          <div className="ma-search-wrapper">
            <span className="ma-search-icon">
              <IoSearch />
            </span>
            <input
              type="search"
              placeholder="Search by title, address or price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ma-search-input"
            />
            {searchTerm && (
              <button className="ma-clear-btn" onClick={() => setSearchTerm("")}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* FILTER DROPDOWN + ADD BUTTON – Same as ManageAdmin */}
        <div className="ma-tabs-row">
          <div className="custom-filter-dropdown" ref={dropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaFilter className="filter-icon" />
              <span>{selectedStatus === "All" ? "All " : STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}</span>
              <IoChevronDown className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`dropdown-item ${selectedStatus === option.value ? "active" : ""}`}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="ma-add-btn" onClick={() => navigate("/admin/addproperty")}>
            Add Property
          </button>
        </div>

        {/* TABLE & CARDS */}
        <div className="dashboard-table-container">
          {loading ? (
            <p style={{ textAlign: "center", padding: "60px" }}>Loading properties...</p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="card-list">
                {paginated.length === 0 ? (
                  <div className="ma-empty">No properties found</div>
                ) : (
                  paginated.map((p) => (
                    <CommonCard
                      key={p.id}
                      avatar={p.image ? `/uploads/${p.image}` : null}
                      title={p.title}
                      meta={p.address}
                      onClick={() => openDetails(p)}
                      compact
                    />
                  ))
                )}
              </div>

              {/* Desktop Table */}
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="ma-empty">No properties found</td>
                    </tr>
                  ) : (
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
                  )}
                </tbody>
              </table>

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
                    <li
                      key={i}
                      className={currentPage === i + 1 ? "active" : ""}
                      onClick={() => changePage(i + 1)}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </li>
                  ))}
                  <li onClick={() => changePage(currentPage + 1)}>
                    <HiOutlineArrowRight />
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <ToastContainer theme="colored" autoClose={3000} hideProgressBar />
      </main>
    </>
  );
};

export default Properties;