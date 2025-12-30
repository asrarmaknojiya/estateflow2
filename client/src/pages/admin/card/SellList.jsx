import React, { useEffect, useState } from "react";
import ExpandableCard from "../../../components/cards/ExpandableCard";
import api from "../../../api/axiosInstance";
import { Calendar, Plus, X } from "lucide-react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";


const SellList = () => {
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {
    fetchSells();
  }, []);

  const fetchSells = async () => {
    try {
      const res = await api.get("/getsellproperties");
      setSells(res.data || []);
      console.log(res.data)
    } catch (err) {
      console.error("Failed to fetch sells", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Sidebar />

      <div className="admin-panel-header-div no-navbar">
        <div className="add-form-header">
          <Link to="/admin/user-dashboard" className="back-arrow-btn">
            <HiOutlineArrowLeft />
          </Link>

          <h5>John Doe</h5>

          <button
            className="form-hamburger-btn"
            onClick={() =>
              window.toggleAdminSidebar && window.toggleAdminSidebar()
            }
          >
            <FiMenu />
          </button>
        </div>
        <div className="sales-page-container">
          {/* SALES TITLE BAR */}
          <div className="sales-card-header sales-header">
            <h2 className="sales-title">Sales</h2>
            <button
              className="primary-btn add-sell-button"
              onClick={() => navigate("/admin/salescard/addsell")}
            >
              <Plus size={16} />
              Add Sell
            </button>
          </div>

          <div className="sales-divider" />
          {sells.map((item, index) => (
            <ExpandableCard
              key={item.id}
              headerLeft={

                <>
                  <div className="booking-id">
                    #{index + 1}
                  </div>
                  <div className="complex-name">
                    {item.title}
                  </div>

                </>
              }
            >
              <div className="booking-date">
                <Calendar size={16} />
                <span>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="booking-amount-section">
                <div className="booking-amount">
                  Amount:
                  <span className="amount-value">
                    ₹{item.amount}
                  </span>
                </div>
              </div>

              {/* {item.details && (
                <div className="sales-extra-content">
                  {item.details}
                </div>
              )} */}

              <button className="cancel-booking-btn">
                <X size={18} />
                Cancel Sales
              </button>
            </ExpandableCard>
          ))}
        </div>
      </div>
    </>
  );
};

export default SellList;


