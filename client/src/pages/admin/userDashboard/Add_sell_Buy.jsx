import React, { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../assets/css/admin/common/form.css";
import useMe from "../../../hooks/useMe";
import { useActiveUser } from "../../../context/ActiveUserContext";

const AddSellBuy = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSell = location.pathname.includes("addsell");
  const pageTitle = isSell ? "Add Sale" : "Add Purchase";

  const { userId } = useActiveUser();
  const { me } = useMe();

  const [client, setClient] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];


  const [form, setForm] = useState({
    property_id: "",
    buyer_id: "",
    seller_id: "",
    assigned_by: "",
    assigned_at: today,
    amount: "",
    details: "",
  });

  // 🔹 fetch active client
  useEffect(() => {
    if (!userId) return;
    api.get(`/users/${userId}`).then((res) => {
      setClient(res.data);
    });
  }, [userId]);

  // 🔹 auto set buyer / seller
  useEffect(() => {
    if (!client) return;

    if (isSell) {
      setForm((p) => ({ ...p, buyer_id: client.id }));
    } else {
      setForm((p) => ({ ...p, seller_id: client.id }));
    }
  }, [client, isSell]);

  // 🔹 auto set assigned_by
  useEffect(() => {
    if (me) {
      setForm((p) => ({ ...p, assigned_by: me.id }));
    }
  }, [me]);

  // 🔹 fetch properties
  useEffect(() => {
    api.get("/getproperties")
      .then((res) => setProperties(res.data || []))
      .catch(() => toast.error("Failed to load properties"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid = () => {
    if (!form.property_id || !form.amount) return false;
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
        assigned_at: `${form.assigned_at} ${new Date().toTimeString().slice(0, 8)}`,
        amount: form.amount,
        details: form.details,


      };

      if (isSell) payload.buyer_id = form.buyer_id;
      else payload.seller_id = form.seller_id;

      const apiPath = isSell ? "/addsellproperty" : "/addbuyproperty";
      await api.post(apiPath, payload);

      toast.success(`${pageTitle} added successfully`);
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
          <button
            className="form-hamburger-btn"
            onClick={() => window.toggleAdminSidebar?.()}
          >
            <FiMenu />
          </button>
        </div>

        {/* FORM */}
        <div className="form-content-after-header">
          <form className="form-layout" onSubmit={handleSubmit}>
            {/* LEFT */}
            <div>
              <div className="form-card">
                <h6>Transaction Information</h6>

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
                        {p.title || p.property_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{isSell ? "Buyer" : "Seller"}</label>
                  <input
                    type="text"
                    value={client ? `${client.id} - ${client.name}` : ""}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Assigned By</label>
                  <input
                    type="text"
                    value={me ? `${me.id} - ${me.name}` : ""}
                    readOnly
                  />
                </div>

                {/* 🌱 NEW DATE FIELD */}
                <div className="form-group">
                  <label>Assigned Date</label>
                  <input
                    type="date"
                    name="assigned_at"
                    value={form.assigned_at}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-card">
                <h6>Additional Details</h6>
                <div className="form-group">
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    placeholder="Optional notes"
                  />
                </div>
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
