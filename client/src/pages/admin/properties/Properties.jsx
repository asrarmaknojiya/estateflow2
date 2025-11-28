import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosEye } from "react-icons/io";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";
import "../../../assets/css/admin/product.css";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Properties = () => {
  const [activeTab, setActiveTab] = useState("All Properties");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const navigate = useNavigate();

  // fetch
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/getproperties");
      setProperties(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("fetchProperties error:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // responsive
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

  const handleDeleteClick = async (e, property) => {
    e.stopPropagation();
    const ok = window.confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      await api.delete(`/deleteproperty/${property.id}`);
      toast.success("Property deleted successfully");
      await fetchProperties();
    } catch (err) {
      console.error("Delete error:", err);
      const msg = err?.response?.data?.error || "Failed to delete property";
      toast.error(msg);
    }
  };

  const openDetails = (property) => {
    navigate(`/admin/property/${property.id}`, { state: { item: property } });
  };

  const onEdit = (e, property) => {
    e.stopPropagation();
    navigate(`/admin/properties/edit/${property.id}`);
  };

  const filtered = properties.filter((p) =>
    activeTab === "All Properties"
      ? true
      : activeTab === "Available"
        ? p.status === "available"
        : activeTab === "Reserved"
          ? p.status === "reserved"
          : activeTab === "Sold"
            ? p.status === "sold"
            : true
  );

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Properties"
          breadcrumbText="Property List"
          button={{ link: "/admin/addproperty", text: "Add Property" }}
        />

        <div className="admin-panel-header-tabs">
          <button
            className={`admin-panel-header-tab ${activeTab === "All Properties" ? "active" : ""}`}
            onClick={() => setActiveTab("All Properties")}
          >
            All
          </button>
          <button
            className={`admin-panel-header-tab ${activeTab === "Available" ? "active" : ""}`}
            onClick={() => setActiveTab("Available")}
          >
            Available
          </button>
          <button
            className={`admin-panel-header-tab ${activeTab === "Reserved" ? "active" : ""}`}
            onClick={() => setActiveTab("Reserved")}
          >
            Reserved
          </button>
          <button
            className={`admin-panel-header-tab ${activeTab === "Sold" ? "active" : ""}`}
            onClick={() => setActiveTab("Sold")}
          >
            Sold
          </button>
        </div>

        <div className="dashboard-table-container">
          {/* Desktop / Large */}
          {!isMobile && !isTablet && (
            <table>
              <thead>
                <tr>
                  <th style={{ width: "24%" }}>Property</th>
                  <th style={{ width: "10%" }}>ID</th>
                  <th style={{ width: "12%" }}>Address</th>
                  <th style={{ width: "8%" }}>Price</th>
                  <th style={{ width: "8%" }}>Status</th>
                  <th style={{ width: "14%" }}>Added</th>
                  <th style={{ width: "12%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((p) => (
                    <tr key={p.id} className="clickable-row" onClick={() => openDetails(p)}>
                      <td className="product-info">
                        <img
                          src={`/uploads/${p.image || "defaultpropertyimage.png"}`}
                          alt={p.title}
                          style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 6, marginRight: 12 }}
                        />
                        <span>{p.title}</span>
                      </td>
                      <td className="product-stock-keeping-unit">{p.id}</td>
                      <td>{p.address}</td>
                      <td style={{ fontWeight: 600, color: "var(--primary-btn-bg)" }}>₹{p.price}</td>
                      <td>
                        <span
                          className={`status ${p.status === "available" ? "published" : p.status === "reserved" ? "low-stock" : "out-of-stock"
                            }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="actions">
                        <IoPencil onClick={(e) => onEdit(e, p)} style={{ cursor: "pointer" }} title="Edit" />
                        <IoIosEye onClick={() => openDetails(p)} style={{ cursor: "pointer", marginLeft: 8 }} title="View" />
                        <MdDeleteForever
                          onClick={(e) => handleDeleteClick(e, p)}
                          style={{ cursor: "pointer", marginLeft: 8, color: "var(--red-color)" }}
                          title="Delete"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Mobile / Tablet cards */}
          {(isMobile || isTablet) && (
            <div className="cardlist" style={{ padding: 12 }}>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <article key={p.id} className="card-row" onClick={() => openDetails(p)}>
                    <div className="card-left">
                      <img src={`/uploads/${p.image || "defaultpropertyimage.png"}`} alt={p.title} />
                    </div>
                    <div className="card-middle">
                      <div className="card-title">{p.title}</div>
                      <div className="card-sub">{p.address}</div>
                    </div>
                    <div className="card-right">
                      <div
                        className={`count-pill ${p.status === "available" ? "published" : p.status === "reserved" ? "low-stock" : "out-of-stock"
                          }`}
                      >
                        ₹{p.price}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">No properties found</div>
              )}
            </div>
          )}

          {/* footer pagination (UI only) */}
          <div className="table-footer-pagination">
            <span>
              Showing {filtered.length === 0 ? 0 : 1} - {filtered.length} from {properties.length}
            </span>
            <ul className="pagination">
              <li className="arrow">
                <HiOutlineArrowLeft />
              </li>
              <li className="">01</li>
              <li>02</li>
              <li>03</li>
              <li>04</li>
              <li>05</li>
              <li className="arrow">
                <HiOutlineArrowRight />
              </li>
            </ul>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      </main>
    </>
  );
};

export default Properties;
