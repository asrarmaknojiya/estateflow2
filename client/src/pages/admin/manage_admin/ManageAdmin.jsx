import React, { useEffect, useState, useRef } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil, IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";
import "../../../assets/css/admin/pages/mainLayout.css";
import CommonCard from "../common/CommonCard";
import { useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa";


const PAGE_SIZE = 5;

// keep allowed roles in lowercase for consistent comparisons
const ALLOWED_ROLES = ["buyer", "seller", "broker", "retailer"];

const ManageAdmin = () => {
  const [clients, setClients] = useState([]);
  const [userRolesMap, setUserRolesMap] = useState({}); // user_id → [role_names (lowercase)]
  const [selectedRole, setSelectedRole] = useState("all"); // use 'all' lowercase internally
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // helper: capitalize for display
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // Fetch all clients + their roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Fetch all users
        const usersRes = await api.get("/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setClients(users.filter(u => u.status !== "trash"));

        // 2. Fetch user-role mappings
        const mappingsRes = await api.get("/user-roles");
        const mappings = Array.isArray(mappingsRes.data) ? mappingsRes.data : [];

        // Build map: user_id → array of role names (normalized to lowercase)
        const map = {};
        mappings.forEach(m => {
          if (!map[m.user_id]) map[m.user_id] = [];
          // m.role_name may be "seller" or "Seller" — normalize to lowercase
          map[m.user_id].push(String(m.role_name || "").toLowerCase());
        });
        setUserRolesMap(map);
      } catch (err) {
        console.error("Failed to load data:", err);
        // toast.error("Failed to load clients"); // keep if you have toast
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const moveToTrash = async (id) => {
    try {
      await api.put(`/trash-user/${id}`, { status: "trash" });
      setClients(prev => prev.filter(u => u.id !== id));
      // toast.success("Moved to trash");
    } catch (err) {
      console.error(err);
      // toast.error("Failed to move to trash");
    }
  };

  const handleEdit = (client) => navigate("/admin/edit-client", { state: { admin: client } });
  const handleView = (client) => navigate("/admin/user-dashboard", { state: { admin: client } });

  // Filter by role + search
  const filteredClients = clients.filter((client) => {
    // role check: selectedRole 'all' means pass
    const hasRole =
      selectedRole === "all" ||
      (userRolesMap[client.id] &&
        userRolesMap[client.id].some((r) => r === selectedRole)); // both sides lowercase

    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      client.name?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      String(client.number || "").includes(q);

    return hasRole && matchesSearch;
  });

  useEffect(() => setCurrentPage(1), [selectedRole, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filteredClients.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (p) => p >= 1 && p <= totalPages && setCurrentPage(p);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

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
              placeholder="Search name, email or phone..."
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

        {/* FILTER + ADD BUTTON */}
        <div className="ma-tabs-row">
          <div className="custom-filter-dropdown" ref={dropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaFilter className="filter-icon" />
              <span>{selectedRole === "all" ? "All" : cap(selectedRole)}</span>
              <IoChevronDown className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${selectedRole === "all" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRole("all");
                    setIsDropdownOpen(false);
                  }}
                >
                  All
                </div>
                {ALLOWED_ROLES.map((role) => (
                  <div
                    key={role}
                    className={`dropdown-item ${selectedRole === role ? "active" : ""}`}
                    onClick={() => {
                      setSelectedRole(role); // role is lowercase
                      setIsDropdownOpen(false);
                    }}
                  >
                    {cap(role)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="ma-add-btn" onClick={() => navigate("/admin/add-new_client")}>
            Add Client
          </button>
        </div>

        {/* TABLE & CARDS */}
        <div className="dashboard-table-container">
          {loading ? (
            <p style={{ textAlign: "center", padding: "60px" }}>Loading clients...</p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="card-list">
                {paginated.length === 0 ? (
                  <div className="ma-empty">No clients found</div>
                ) : (
                  paginated.map((user) => {
                    const avatar = user.img ? `/uploads/${user.img}` : null;
                    const firstName = user.name?.split(" ")[0] || "User";
                    return (
                      <CommonCard
                        key={user.id}
                        avatar={avatar}
                        title={firstName}
                        meta={user.number || "No phone"}
                        onClick={() => handleEdit(user)}
                        compact
                      />
                    );
                  })
                )}
              </div>

              {/* Desktop Table */}
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="ma-empty">No clients found</td></tr>
                  ) : (
                    paginated.map((user) => (
                      <tr key={user.id}>
                        <td className="product-info admin-profile">
                          <img src={`/uploads/${user.img || "default.jpg"}`} alt="profile" />
                          <span>{user.name}</span>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.number}</td>
                        <td>{(userRolesMap[user.id] || []).map(r => cap(r)).join(", ") || "-"}</td>
                        <td><span className={`status ${user.status}`}>{user.status}</span></td>
                        <td>{formatDate(user.created_at)}</td>
                        <td className="actions">
                          <IoPencil onClick={() => handleEdit(user)} />
                          <IoIosEye onClick={() => handleView(user)} />
                          <MdDeleteForever onClick={() => moveToTrash(user.id)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="table-footer-pagination">
                <span>
                  Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredClients.length)} of {filteredClients.length}
                </span>
                <ul className="pagination">
                  <li onClick={() => changePage(currentPage - 1)}><HiOutlineArrowLeft /></li>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li
                      key={i}
                      className={currentPage === i + 1 ? "active" : ""}
                      onClick={() => changePage(i + 1)}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </li>
                  ))}
                  <li onClick={() => changePage(currentPage + 1)}><HiOutlineArrowRight /></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default ManageAdmin;
