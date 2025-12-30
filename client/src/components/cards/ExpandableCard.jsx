// components/common/ExpandableCard/ExpandableCard.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../../assets/css/components/cards/ExpandableCard.css";

const ExpandableCard = ({
  headerLeft,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sales-booking-card">
      {/* HEADER */}
      <div
        className="sales-card-header"
        style={{ marginBottom: open ? "20px" : "0" }}
      >
        <div>{headerLeft}</div>

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
        <div className="sales-card-body">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;
