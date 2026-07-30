import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ordersAPI } from "./services/orders.api";
import {
  PartnerLayout,
  SkeletonCard,
  Toast,
} from "../../components/Partner/PartnerComponents";
import {
  formatCurrency,
  formatTimeAgo,
  getNextStatus,
  canUpdateOrder,
  ORDER_STATUS,
} from "./utils/constants";
import "../../styles/partner-design-system.css";

export default function PartnerOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getOrderById(orderId);
      if (data?.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setToast({ message: "Failed to load order details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    const nextStatus = getNextStatus(order.orderStatus);
    if (!nextStatus || !canUpdateOrder(order.orderStatus)) return;

    try {
      setActionLoading(true);
      await ordersAPI.updateOrderStatus(order._id, nextStatus);
      setOrder((prev) => ({ ...prev, orderStatus: nextStatus }));
      setToast({ message: `Order status updated to ${nextStatus}`, type: "success" });
    } catch (err) {
      console.error("Error updating order status:", err);
      setToast({ message: err.response?.data?.message || "Status update failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const statusSteps = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ];

  const currentStepIdx = order ? statusSteps.indexOf(order.orderStatus) : 0;

  return (
    <PartnerLayout
      title={order ? `Order #${String(order._id).slice(-8).toUpperCase()}` : "Order Details"}
      subtitle={order ? `Placed ${formatTimeAgo(order.createdAt)}` : "Loading..."}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        className="btn-partner-secondary"
        onClick={() => navigate("/foodpartner/orders")}
        style={{ marginBottom: 16, minHeight: 36, fontSize: 13 }}
      >
        ← Back to Orders
      </button>

      {loading ? (
        <SkeletonCard />
      ) : !order ? (
        <div className="partner-card">
          <p>Order not found or has been removed.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Status Timeline Card */}
          <div className="partner-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>Order Progress Tracker</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, zIndex: 2 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isPassed ? "var(--partner-primary)" : "rgba(255,255,255,0.1)",
                        color: isPassed ? "#04110A" : "var(--partner-text-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 12,
                        boxShadow: isCurrent ? "0 0 12px var(--partner-primary)" : "none",
                      }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: isCurrent ? 800 : 500, color: isCurrent ? "var(--partner-primary)" : "var(--partner-text-soft)", textAlign: "center" }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="partner-card">
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>Customer Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--partner-text-soft)" }}>Customer Name</span>
                <span style={{ fontWeight: 700 }}>{order.user?.fullName || order.customerName || "Customer"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--partner-text-soft)" }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: "var(--partner-primary)" }}>{order.paymentMethod || "COD"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--partner-text-soft)" }}>Delivery Address</span>
                <span style={{ fontWeight: 600, textAlign: "right", maxWidth: 220 }}>{order.deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="partner-card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>Ordered Items ({order.items?.length || 0})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(order.items || []).map((item, idx) => {
                const food = item.food || {};
                const itemTotal = (food.price || item.price || 0) * (item.quantity || 1);

                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: idx < order.items.length - 1 ? "1px solid var(--partner-border)" : "none" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "#1F3426", flexShrink: 0 }}>
                      {food.thumbnail ? (
                        <img src={food.thumbnail} alt={food.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🍲</div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--partner-text)" }}>
                        {food.name || "Item"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--partner-text-soft)" }}>
                        {formatCurrency(food.price || item.price || 0)} × {item.quantity}
                      </div>
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--partner-primary)" }}>
                      {formatCurrency(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="partner-card">
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>Financial Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--partner-text-muted)" }}>
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--partner-text-muted)" }}>
                <span>Taxes & Service Fees</span>
                <span>₹0 (Included)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--partner-border)", fontSize: 18, fontWeight: 800, color: "var(--partner-primary)" }}>
                <span>Final Total</span>
                <span>{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Rail Button */}
          {canUpdateOrder(order.orderStatus) && (
            <button
              className="btn-partner-primary"
              style={{ width: "100%", minHeight: 52, fontSize: 16 }}
              onClick={handleUpdateStatus}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Updating..."
                : order.orderStatus === ORDER_STATUS.PENDING
                ? "Accept Order"
                : order.orderStatus === ORDER_STATUS.ACCEPTED
                ? "Start Preparing"
                : order.orderStatus === ORDER_STATUS.PREPARING
                ? "Out for Delivery"
                : "Mark as Delivered"}
            </button>
          )}
        </div>
      )}
    </PartnerLayout>
  );
}
