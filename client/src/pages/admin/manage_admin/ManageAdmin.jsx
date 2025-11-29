import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";

import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import AdminProfile from "../../../assets/image/dash-profile.png";

// axios instance
import api from "../../../api/axiosInstance";

const PAGE_SIZE = 10;

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ yaha pe userId -> "seller, buyer" jaisa map rakhenge
  const [rolesMap, setRolesMap] = useState({});

  const navigate = useNavigate();

  /* ===================== FETCH ALL USERS + ROLES ===================== */
  useEffect(() => {
    const fetchAdminsAndRoles = async () => {
      try {
        setLoading(true);

        // 1) users
        const usersRes = await api.get("/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setAdmins(users);

        // 2) user_roles + roles join se saare mapping
        //    controller: getUserRoles => /user-roles
        const rolesRes = await api.get("/user-roles");
        const mappings = Array.isArray(rolesRes.data) ? rolesRes.data : [];

        // 3) user_id ke hisaab se role_name list banaenge
        const map = {};
        mappings.forEach((row) => {
          const uid = row.user_id;
          const rname = row.role_name;

          if (!uid || !rname) return;

          if (!map[uid]) map[uid] = [];
          if (!map[uid].includes(rname)) {
            map[uid].push(rname);
          }
        });

        // convert arrays -> "role1, role2"
        Object.keys(map).forEach((uid) => {
          map[uid] = map[uid].join(", ");
        });

        setRolesMap(map);
      } catch (err) {
        console.error("Failed to fetch admins / roles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminsAndRoles();
  }, []);

  /* ===================== DELETE USER ===================== */
  const handleDelete = async (id) => {
    const allow = window.confirm("Are you sure you want to delete this admin?");
    if (!allow) return;

    try {
      await api.delete(`/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));

      // rolesMap se bhi clean kar dete hain
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
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "active") return "status published";
    if (status === "block" || status === "blocked") return "status out-of-stock";
    return "status";
  };

  const getStatusLabel = (status) => {
    if (!status) return "-";
    if (status === "block") return "Blocked";
    return status.charAt(0).toUpperCase() + status.slice(1);
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
                    <th style={{ width: "22%" }}>Name</th>
                    <th style={{ width: "18%" }}>Email</th>
                    <th style={{ width: "14%" }}>Phone</th>
                    <th style={{ width: "16%" }}>Roles</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "10%" }}>Added</th>
                    <th style={{ width: "10%" }}>Action</th>
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

                        {/* ✅ roles from /user-roles map */}
                        <td>{rolesMap[user.id] || "-"}</td>

                        <td>
                          <span className={getStatusClass(user.status)}>
                            {getStatusLabel(user.status)}
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
                  <li
                    className="arrow"
                    onClick={() => changePage(currentPage - 1)}
                  >
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

                  <li
                    className="arrow"
                    onClick={() => changePage(currentPage + 1)}
                  >
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
