import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../assets/css/admin/common/form.css";
import useMe from "../../../hooks/useMe";
import { useActiveUser } from "../../../context/ActiveUserContext";

const AddSellBuy = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState([])

  const { userId } = useActiveUser();

  useEffect(() => {
    if (!userId) return;
    api.get(`/users/${userId}`).then(res => setClient(res.data));
  }, [userId]);

  const { me } = useMe();

  // detect mode
  const isSell = location.pathname.includes("addsell");
  const pageTitle = isSell ? "Add Sale" : "Add Purchase";

  const [form, setForm] = useState({
    property_id: "",
    buyer_id: "",
    seller_id: "",
    assigned_by: "",
    amount: "",
    details: "",
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- AUTO SET BUYER / SELLER + ASSIGNED BY ----------------
  useEffect(() => {
    if (client) {
      if (isSell) {
        setForm((p) => ({ ...p, buyer_id: client.id }));
      } else {
        setForm((p) => ({ ...p, seller_id: client.id }));
      }
    }
  }, [client, isSell]);

  useEffect(() => {
    if (me) {
      setForm((p) => ({ ...p, assigned_by: me.id }));
    }
  }, [me]);

  // ---------------- FETCH PROPERTIES ----------------
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/getproperties");
      setProperties(res.data || []);
    } catch {
      toast.error("Failed to load properties");
    }
  };

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid = () => {
    if (!form.property_id || !form.amount || !form.assigned_by) return false;
    if (isSell && !form.buyer_id) return false;
    if (!isSell && !form.seller_id) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return toast.warn("Please fill required fields");

    setLoading(true);
    try {
      const payload = {
        property_id: form.property_id,
        assigned_by: form.assigned_by,
        amount: form.amount,
        details: form.details,
      };

      if (isSell) payload.buyer_id = form.buyer_id;
      else payload.seller_id = form.seller_id;

      const apiPath = isSell
        ? "/addsellproperty"
        : "/addbuyproperty";

      await api.post(apiPath, payload);

      toast.success(`${pageTitle} added successfully`);
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleHamburgerClick = () => {
    if (window.toggleAdminSidebar) window.toggleAdminSidebar();
  };

  // ---------------- JSX ----------------
  return (
    <>
      <Sidebar />

      <main className="admin-panel-header-div no-navbar">
        {/* HEADER */}
        <div className="add-form-header">
          <Link to={-1} className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>
          <h5>{pageTitle}</h5>
          <button className="form-hamburger-btn" onClick={handleHamburgerClick}>
            <FiMenu />
          </button>
        </div>

        {/* FORM */}
        <div className="form-content-after-header">
          <form onSubmit={handleSubmit} className="form-layout">
            {/* LEFT */}
            <div>
              <div className="form-card">
                <h6>Transaction Information</h6>

                {/* PROPERTY */}
                <div className="form-group">
                  <label>Property *</label>
                  <select
                    name="property_id"
                    value={form.property_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Property</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} — {p.title || p.property_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BUYER / SELLER (READONLY) */}
                {isSell ? (
                  <div className="form-group">
                    <label>Buyer</label>
                    <input
                      type="text"
                      value={`${client?.id || ""} - ${client?.name || ""}`}
                      readOnly
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Seller</label>
                    <input
                      type="text"
                      value={`${client?.id || ""} - ${client?.name || ""}`}
                      readOnly
                    />
                  </div>
                )}

                {/* ASSIGNED BY (READONLY) */}
                <div className="form-group">
                  <label>Assigned By</label>
                  <input
                    type="text"
                    value={me ? `${me.id} - ${me.name}` : ""}
                    readOnly
                  />
                </div>

                <div className="form-card">
                  <h6>Additional Details</h6>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div className="form-card">
                  <h6>Payment</h6>
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="desktop-save-wrapper">
                  <button
                    className="desktop-save-btn"
                    disabled={!isValid() || loading}
                  >
                    <MdSave />
                    {loading ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* MOBILE SAVE */}
        <div className="sticky-bottom-save">
          <button onClick={handleSubmit} disabled={!isValid() || loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </>
  );
};

export default AddSellBuy;
