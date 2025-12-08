import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { IoIosEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { TbTrashOff } from "react-icons/tb"; // Restore icon
import { IoPencil } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";
import "../../../assets/css/admin/pages/mainLayout.css";
import CommonCard from "../common/CommonCard";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

const TrashClients = () => {
  const [admins, setAdmins] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const usersRes = await api.get("/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        setAdmins(users.filter((u) => u.status === "trash")); // Only trash

        const mappingsRes = await api.get("/user-roles");
        const mappings = Array.isArray(mappingsRes.data) ? mappingsRes.data : [];

        const map = {};
        mappings.forEach((row) => {
          if (!map[row.user_id]) map[row.user_id] = [];
          map[row.user_id].push(row.role_name);
        });

        Object.keys(map).forEach((id) => {
          map[id] = map[id].join(", ");
        });

        setRolesMap(map);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const restoreUser = async (id) => {
    try {
      await api.put(`/trash-user/${id}`, { status: "active" });
      setAdmins((prev) => prev.filter((u) => u.id !== id)); // Remove from trash list
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUserForever = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (admin) => navigate("/admin/edit-client", { state: { admin } });
  const handleView = (admin) => navigate("/admin/user-dashboard", { state: { admin } });

  /* filter + search */
  const filteredAdmins = admins.filter((admin) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      admin.name?.toLowerCase().includes(q) ||
      admin.email?.toLowerCase().includes(q) ||
      admin.number?.toString().includes(q);
    return matchSearch;
  });

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filteredAdmins.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (p) => p >= 1 && p <= totalPages && setCurrentPage(p);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        {/* SEARCH */}
        <div className="ma-search-bar">
          <div className="ma-search-wrapper">
            <span className="ma-search-icon" aria-hidden>
              <IoSearch />
            </span>

            <input
              type="search"
              placeholder="Search name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ma-search-input"
              aria-label="Search users"
            />

            {searchTerm.length > 0 && (
              <button
                type="button"
                className="ma-clear-btn"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-table-container">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="card-list">
                {paginated.length === 0 ? (
                  <div className="ma-empty">No admins in trash</div>
                ) : (
                  paginated.map((user) => {
                    const avatar = user.img ? `/uploads/${user.img}` : null;
                    const firstName = user.name?.split(" ")[0] || "-";
                    return (
                      <CommonCard
                        key={user.id}
                        avatar={avatar}
                        title={firstName}
                        meta={user.number || "-"}
                        onClick={() => handleEdit(user)}
                        compact
                      />
                    );
                  })
                )}
              </div>

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
                    <tr>
                      <td colSpan={7} className="ma-empty">
                        No admins in trash
                      </td>
                    </tr>
                  ) : (
                    paginated.map((user) => (
                      <tr key={user.id}>
                        <td className="product-info admin-profile">
                          <img src={`/uploads/${user.img}`} alt={`${user.name || "profile"}`} />
                          <span>{user.name}</span>
                        </td>

                        <td>{user.email}</td>
                        <td>{user.number}</td>
                        <td>{rolesMap[user.id] || "-"}</td>

                        <td>
                          <span className={`status ${user.status}`}>{user.status}</span>
                        </td>

                        <td>{formatDate(user.created_at)}</td>

                        <td className="actions">
                          <TbTrashOff onClick={() => restoreUser(user.id)} />
                          <MdDeleteForever onClick={() => deleteUserForever(user.id)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="table-footer-pagination">
                <span>
                  Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredAdmins.length)} of{" "}
                  {filteredAdmins.length}
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
      </main>
    </>
  );
};

export default TrashClients;