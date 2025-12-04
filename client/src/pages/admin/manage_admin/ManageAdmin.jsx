// src/pages/admin/manage/ManageAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";
import { TbTrashOff } from "react-icons/tb";

import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import api from "../../../api/axiosInstance";

// styles + CommonCard
import "../../../assets/css/admin/pages/manageAdmin.css";
import CommonCard from "../common/CommonCard";

const PAGE_SIZE = 5;

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(false);

  // tabs: "All" | "Trash"
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // fetch users
        const usersRes = await api.get("/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setAdmins(users);

        // fetch user_roles
        const rolesRes = await api.get("/user-roles");
        const mappings = Array.isArray(rolesRes.data) ? rolesRes.data : [];

        const map = {};
        mappings.forEach((row) => {
          const uid = row.user_id;
          const rname = row.role_name;
          if (!uid || !rname) return;
          if (!map[uid]) map[uid] = [];
          if (!map[uid].includes(rname)) map[uid].push(rname);
        });

        Object.keys(map).forEach((uid) => {
          map[uid] = map[uid].join(", ");
        });
        setRolesMap(map);
      } catch (err) {
        console.error("Error loading admins:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= Trash / restore / delete flows ================= */
  const moveToTrash = async (id) => {
    try {
      await api.put(`/trash-user/${id}`, { status: "trash" });
      // optimistic update
      setAdmins((prev) => prev.map((u) => (u.id === id ? { ...u, status: "trash" } : u)));
      alert("User moved to trash");
    } catch (err) {
      console.error("moveToTrash error:", err);
      alert("Failed to move to trash");
    }
  };

  const restoreUser = async (id) => {
    try {
      await api.put(`/trash-user/${id}`, { status: "active" });
      setAdmins((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
      alert("User restored");
    } catch (err) {
      console.error("restoreUser error:", err);
      alert("Failed to restore user");
    }
  };

  const deleteUserForever = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));
      alert("User deleted permanently");
    } catch (err) {
      console.error("deleteUserForever error:", err);
      alert("Failed to delete user");
    }
  };

  /* ===================== Desktop delete (original) ===================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));
      setRolesMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error("Failed to delete admin:", err);
    }
  };

  const handleEdit = (admin) => {
    navigate("/admin/edit-client", { state: { admin } });
  };

  const handleView = (admin) => {
    navigate("/admin/view-client", { state: { admin } });
  };

  /* ===================== Filtering + Pagination ===================== */
  const filteredAdmins = admins.filter((admin) => {
    if (activeTab === "All") return admin.status !== "trash";
    if (activeTab === "Trash") return admin.status === "trash";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "active") return "status published";
    if (status === "trash") return "status out-of-stock";
    if (status === "block" || status === "blocked") return "status out-of-stock";
    return "status";
  };

  const getStatusLabel = (status) => {
    if (!status) return "-";
    if (status === "block") return "Blocked";
    if (status === "trash") return "Trash";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Clients"
          breadcrumbText="Clients List"
          button={{ link: "/admin/add-new_client", text: "Add New Client" }}
        />

        {/* TABS */}
        <div className="admin-panel-header-tabs" style={{ marginTop: 12 }}>
          {["All", "Trash"].map((tab) => (
            <button
              key={tab}
              className={`admin-panel-header-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE / CARD container */}
        <div className="dashboard-table-container" style={{ marginTop: 18 }}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* CARD-LIST (visible on tablet/mobile via CSS) */}
              <div className="card-list" aria-hidden={false}>
                {paginatedAdmins.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 16 }}>No admins found</div>
                ) : (
                  paginatedAdmins.map((user) => {
                    const avatar = user.img ? `/uploads/${user.img}` : null;
                    const firstName = (user.name && user.name.split(" ").filter(Boolean)[0]) || "-";
                    return (
                      <CommonCard
                        key={user.id}
                        avatar={avatar}
                        title={firstName}
                        meta={user.number || "-"}
                        onClick={() => handleEdit(user)}
                        compact={true}
                      />
                    );
                  })
                )}
              </div>

              {/* TABLE (visible on desktop via CSS) */}
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "17%" }}>Name</th>
                    <th style={{ width: "23%" }}>Email</th>
                    <th style={{ width: "10%" }}>Phone</th>
                    <th style={{ width: "10%" }}>Roles</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "14%" }}>Added</th>
                    <th style={{ width: "16%" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((user) => (
                      <tr key={user.id}>
                        <td className="product-info admin-profile">
                          <img src={`/uploads/${user.img}`} alt="profile" />
                          <span>{user.name || "-"}</span>
                        </td>

                        <td>{user.email || "-"}</td>
                        <td>{user.number || "-"}</td>
                        <td>{rolesMap[user.id] || "-"}</td>

                        <td>
                          <span className={getStatusClass(user.status)}>
                            {getStatusLabel(user.status)}
                          </span>
                        </td>

                        <td>{formatDate(user.created_at)}</td>

                        {/* DESKTOP ACTIONS - vary by tab */}
                        <td className="actions">
                          {activeTab === "All" && (
                            <>
                              <IoPencil
                                title="Edit"
                                style={{ cursor: "pointer", marginRight: 10 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(user);
                                }}
                              />
                              <IoIosEye
                                title="View"
                                style={{ cursor: "pointer", marginRight: 10 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(user);
                                }}
                              />
                              {/* move to trash */}
                              <MdDeleteForever
                                title="Trash"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveToTrash(user.id);
                                }}
                              />
                            </>
                          )}

                          {activeTab === "Trash" && (
                            <>
                              {/* restore */}
                              <TbTrashOff
                                title="Restore"
                                style={{ cursor: "pointer", marginRight: 10 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  restoreUser(user.id);
                                }}
                              />
                              {/* delete permanently */}
                              <MdDeleteForever
                                title="Delete forever"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteUserForever(user.id);
                                }}
                              />
                            </>
                          )}
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
                  {Math.min(startIndex + PAGE_SIZE, filteredAdmins.length)} of{" "}
                  {filteredAdmins.length}
                </span>

                <ul className="pagination">
                  <li onClick={() => changePage(currentPage - 1)} role="button" tabIndex={0}>
                    <HiOutlineArrowLeft />
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li
                      key={i}
                      className={currentPage === i + 1 ? "active" : ""}
                      onClick={() => changePage(i + 1)}
                      role="button"
                      tabIndex={0}
                      aria-label={`page-${i + 1}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </li>
                  ))}

                  <li onClick={() => changePage(currentPage + 1)} role="button" tabIndex={0}>
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
