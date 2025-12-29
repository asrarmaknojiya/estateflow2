// components/common/ExpandableCard/ExpandableCard.jsx
import React, { useState } from "react";
import { ChevronDown, Calendar, X } from "lucide-react";
import "../../assets/css/components/cards/ExpandableCard.css";

const ExpandableCard = ({
  id,
  complex,
  date,
  amount,
  requests,
  primaryBtnText = "View Requests",
  dangerBtnText = "Cancel Booking",
  onPrimaryClick,
  onDangerClick,

  headerLeft,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sales-booking-card" style={{ padding: "20px" }}>
      {/* HEADER */}
      <div
        className="sales-card-header"
        style={{ marginBottom: open ? "20px" : "0" }}
      >
        <div>
          {headerLeft ? (
            headerLeft
          ) : (
            <>
              <div className="booking-id">#{id}</div>
              <div className="complex-name">{complex}</div>
            </>
          )}
        </div>

        <button
          className={`sales-toggle-btn ${open ? "expanded" : ""}`}
          onClick={() => setOpen(!open)}
          type="button"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* BODY */}
      {open && (
        <>
          {/* OLD CONTENT */}
          {date && (
            <div className="booking-date">
              <Calendar size={16} />
              <span>{date}</span>
            </div>
          )}

          {amount && (
            <div className="booking-amount-section">
              <div className="booking-amount">
                Amount:
                <span className="amount-value">{amount}</span>
              </div>

              <button
                className="primary-btn view-requests-btn"
                onClick={onPrimaryClick}
              >
                {primaryBtnText.replace("{n}", requests)}
              </button>
            </div>
          )}

          <button
            className="cancel-booking-btn"
            onClick={onDangerClick}
          >
            <X size={18} />
            {dangerBtnText}
          </button>

          {/* NEW EXTRA CONTENT (SellList details) */}
          {children}
        </>
      )}
    </div>
  );
};

export default ExpandableCard;
