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
            {/* BODY */}
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