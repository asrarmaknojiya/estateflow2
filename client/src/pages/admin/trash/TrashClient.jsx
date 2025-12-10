import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { MdDeleteForever, MdPeopleAlt } from "react-icons/md";
import { TbTrashOff } from "react-icons/tb";
import { IoSearch } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import api from "../../../api/axiosInstance";

const PAGE_SIZE = 5;

const TrashClients = () => {
  const [admins, setAdmins] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersRes, mappingsRes] = await Promise.all([
          api.get("/users"),
          api.get("/user-roles"),
        ]);

        const trashUsers = (usersRes.data || []).filter((u) => u.status === "trash");
        setAdmins(trashUsers);

        const map = {};
        (mappingsRes.data || []).forEach((r) => {
          if (!map[r.user_id]) map[r.user_id] = [];
          map[r.user_id].push(r.role_name || "—");
        });
        Object.keys(map).forEach((id) => (map[id] = map[id].join(", ")));
        setRolesMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const restoreUser = async (id) => {
    if (!window.confirm("Restore this user?")) return;
    try {
      await api.put(`/trash-user/${id}`, { status: "active" });
      setAdmins((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteForever = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      setAdmins((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = admins.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.number || "").includes(q)
    );
  });

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showPagination = filtered.length > PAGE_SIZE;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <div className="ma-search-bar">
          <div className="ma-search-wrapper">
            <span className="ma-search-icon"><IoSearch /></span>
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

        <div className="dashboard-table-container">
          {loading ? (
            <div className="loading-state">Loading trash...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <MdPeopleAlt size={70} color="#ccc" />
              <h3>Trash is empty</h3>
              <p>No deleted clients found</p>
            </div>
          ) : (
            <>
              <div className="card-list">
                {paginated.map((user) => (
                  <div key={user.id} className="common-card common-card--compact" style={{ marginBottom: 12 }}>
                    <div className="common-card__left">
                      <div className="common-card__avatar">
                        <img src={`/uploads/${user.img || "default.jpg"}`} alt={user.name} />
                      </div>
                    </div>
                    <div className="common-card__body">
                      <div className="common-card__title">{user.name?.split(" ")[0] || "User"}</div>
                      <div className="common-card__meta">{user.number || "—"}</div>
                    </div>
                    <div className="common-card__right">
                      <button onClick={(e) => { e.stopPropagation(); restoreUser(user.id); }} title="Restore">
                        <TbTrashOff style={{ fontSize: 20, color: "green" }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteForever(user.id); }} title="Delete forever" style={{ marginLeft: 12 }}>
                        <MdDeleteForever style={{ fontSize: 20, color: "#d32f2f" }} />
                      </button>
                    </div>
                  </div>
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
                      <td>{rolesMap[user.id] || "-"}</td>
                      <td><span className="status trash">Trash</span></td>
                      <td>{formatDate(user.created_at)}</td>
                      <td className="actions">
                        <TbTrashOff onClick={() => restoreUser(user.id)} />
                        <MdDeleteForever onClick={() => deleteForever(user.id)}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showPagination && (
                <div className="table-footer-pagination">
                  <span>Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length}</span>
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

export default TrashClients;