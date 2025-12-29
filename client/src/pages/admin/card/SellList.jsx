import React, { useEffect, useState } from "react";
import ExpandableCard from "../../../components/cards/ExpandableCard";
import api from "../../../api/axiosInstance";
import { Calendar } from "lucide-react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";



const SellList = () => {
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSells();
  }, []);

  const fetchSells = async () => {
    try {
      const res = await api.get("/getsellproperties");
      setSells(res.data || []);
    } catch (err) {
      console.error("Failed to fetch sells", err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* DASHBOARD LAYOUT */}
      <Navbar />
      <Sidebar />

      <div className="admin-panel-header-div">
        {sells.map((item) => (
          <ExpandableCard
            key={item.id}
            defaultOpen={false}
            headerLeft={
              <>
                <div className="booking-id">
                  Property #{item.property_id}
                </div>
                <div className="complex-name">
                  Buyer ID: {item.buyer_id}
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

            {item.details && (
              <p style={{ marginTop: "10px", color: "#555" }}>
                {item.details}
              </p>
            )}
          </ExpandableCard>
        ))}
      </div>
    </>
  );
};

export default SellList;
