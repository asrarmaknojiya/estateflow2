import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";

import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import AdminProfile from "../../../assets/image/dash-profile.png";

import axios from "axios";

const API_BASE_URL = "http://localhost:4500";
const PAGE_SIZE = 10;

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  /* ===================== FETCH ALL USERS ===================== */
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/users`);
        setAdmins(res.data || []);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  /* ===================== DELETE USER ===================== */
  const handleDelete = async (id) => {
    const allow = window.confirm("Are you sure you want to delete this admin?");
    if (!allow) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete admin:", err);
    }
  };

  const handleEdit = (admin) => {
    navigate("/admin/edit-admin", { state: { admin } });
  };

  /* ===================== FILTER BY TABS ===================== */
  const filteredAdmins = admins.filter((admin) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return admin.status === "active";
    if (activeTab === "Blocked")
      return admin.status === "block" || admin.status === "blocked";
    return true;
  });

  /* ===================== PAGINATION ===================== */
  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const changePage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Admin"
          breadcrumbText="Admin List"
          button={{ link: "/admin/add-new_admin", text: "Add New Admin" }}
        />

        {/* TABS */}
        <div className="admin-panel-header-tabs">
          {["All", "Active", "Blocked"].map((tab) => (
            <button
              key={tab}
              className={`admin-panel-header-tab ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="dashboard-table-container">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((user) => (
                      <tr key={user.id}>
                        <td className="product-info admin-profile">
                          <img src={AdminProfile} alt="profile" />
                          <span>{user.name || "-"}</span>
                        </td>
                        <td>{user.email || "-"}</td>
                        <td>{user.number || "-"}</td>
                        <td>
                          <span
                            className={
                              user.status === "active"
                                ? "status published"
                                : "status out-of-stock"
                            }
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>

                        <td className="actions">
                          <IoPencil onClick={() => handleEdit(user)} />
                          <IoIosEye />
                          <MdDeleteForever onClick={() => handleDelete(user.id)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="table-footer-pagination">
                <span>
                  Showing {filteredAdmins.length === 0 ? 0 : startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, filteredAdmins.length)} from{" "}
                  {filteredAdmins.length}
                </span>

                <ul className="pagination">
                  <li className="arrow" onClick={() => changePage(currentPage - 1)}>
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

                  <li className="arrow" onClick={() => changePage(currentPage + 1)}>
                    <HiOutlineArrowRight />
                  </li>
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
