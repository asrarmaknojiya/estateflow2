import React, { useEffect, useState, useRef } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever, MdPeopleAlt } from "react-icons/md";
import { IoPencil,IoSearch } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";
import CommonCard from "../common/CommonCard";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;
const ALLOWED_ROLES = ["buyer", "seller", "broker", "retailer"];

const ManageAdmin = () => {
  const [clients, setClients] = useState([]);
  const [userRolesMap, setUserRolesMap] = useState({});
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersRes, mappingsRes] = await Promise.all([
          api.get("/users"),
          api.get("/user-roles"),
        ]);

        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setClients(users.filter((u) => u.status !== "trash"));

        const map = {};
        (mappingsRes.data || []).forEach((m) => {
          if (!map[m.user_id]) map[m.user_id] = [];
          map[m.user_id].push((m.role_name || "").toString().toLowerCase());
        });
        setUserRolesMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const moveToTrash = async (id) => {
    if (!window.confirm("Move to trash?")) return;
    try {
      await api.put(`/trash-user/${id}`, { status: "trash" });
      setClients((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (client) => navigate("/admin/edit-client", { state: { admin: client } });
  const handleView = (client) => navigate("/admin/user-dashboard", { state: { admin: client } });

  const filteredClients = clients.filter((client) => {
    const hasRole = selectedRole === "all" || (userRolesMap[client.id] || []).includes(selectedRole);
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      client.name?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      String(client.number || "").includes(q);
    return hasRole && matchesSearch;
  });

  useEffect(() => setCurrentPage(1), [selectedRole, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filteredClients.slice(startIndex, startIndex + PAGE_SIZE);
  const showPagination = filteredClients.length > PAGE_SIZE;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <div className="ma-search-bar">
          <div className="ma-search-wrapper">
            <span className="ma-search-icon"><IoSearch/></span>
            <input
              type="search"
              placeholder="Search name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ma-search-input"
            />
            {searchTerm && <button className="ma-clear-btn" onClick={() => setSearchTerm("")}>×</button>}
          </div>
        </div>

        <div className="ma-tabs-row">
          <div className="custom-filter-dropdown" ref={dropdownRef}>
            <button className="dropdown-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <FaFilter className="filter-icon" />
              <span>{selectedRole === "all" ? "All" : cap(selectedRole)}</span>
              <IoChevronDown className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className={`dropdown-item ${selectedRole === "all" ? "active" : ""}`} onClick={() => { setSelectedRole("all"); setIsDropdownOpen(false); }}>All</div>
                {ALLOWED_ROLES.map((role) => (
                  <div key={role} className={`dropdown-item ${selectedRole === role ? "active" : ""}`} onClick={() => { setSelectedRole(role); setIsDropdownOpen(false); }}>
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

        <div className="dashboard-table-container">
          {loading ? (
            <div className="loading-state">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <MdPeopleAlt size={64} color="#ccc" />
              <h3>No clients found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            <>
              <div className="card-list">
                {paginated.map((user) => (
                  <CommonCard
                    key={user.id}
                    avatar={user.img ? `/uploads/${user.img}` : null}
                    title={user.name?.split(" ")[0] || "User"}
                    meta={user.number || "No phone"}
                    onClick={() => handleView(user)}
                    compact
                  />
                ))}
              </div>

              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Roles</th><th>Status</th><th>Added</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {paginated.map((user) => (
                    <tr key={user.id}>
                      <td className="product-info admin-profile">
                        <img src={`/uploads/${user.img || "default.jpg"}`} alt="profile" />
                        <span>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.number}</td>
                      <td>{(userRolesMap[user.id] || []).map(cap).join(", ") || "-"}</td>
                      <td><span className={`status ${user.status}`}>{cap(user.status)}</span></td>
                      <td>{formatDate(user.created_at)}</td>
                      <td className="actions">
                        <IoPencil onClick={() => handleEdit(user)} />
                        <IoIosEye onClick={() => handleView(user)} />
                        <MdDeleteForever onClick={() => moveToTrash(user.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showPagination && (
                <div className="table-footer-pagination">
                  <span>Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredClients.length)} of {filteredClients.length}</span>
                  <ul className="pagination">
                    <li onClick={() => changePage(currentPage - 1)}><HiOutlineArrowLeft /></li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => changePage(i + 1)}>
                        {String(i + 1).padStart(2, "0")}
                      </li>
                    ))}
                    <li onClick={() => changePage(currentPage + 1)}><HiOutlineArrowRight /></li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default ManageAdmin;