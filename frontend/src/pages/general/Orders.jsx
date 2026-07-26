import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNav";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import "../../styles/unified-design-system.css";
import "./page.css";
import "./Orders.css";

const STATUS_COLORS = {
  Pending:          { bg: "rgba(255,214,10,0.15)",   color: "#ffd60a",  border: "rgba(255,214,10,0.3)" },
  Accepted:         { bg: "rgba(0,122,255,0.15)",    color: "#0a84ff",  border: "rgba(0,122,255,0.3)" },
  Preparing:        { bg: "rgba(255,149,0,0.15)",    color: "#ff9500",  border: "rgba(255,149,0,0.3)" },
  "Out for Delivery":{ bg: "rgba(48,209,88,0.15)",   color: "#30d158",  border: "rgba(48,209,88,0.3)" },
  Delivered:        { bg: "rgba(52,199,89,0.15)",    color: "#34c759",  border: "rgba(52,199,89,0.3)" },
  Cancelled:        { bg: "rgba(255,59,48,0.12)",    color: "#ff3b30",  border: "rgba(255,59,48,0.25)" },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/v1/order", {
        withCredentials: true,
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await axios.post(
        `http://localhost:3000/api/v1/order/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o))
      );
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(null);
    }
  };

  const handlePayNow = async (order) => {
    setPayError("");
    setPayingOrder(order._id);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setPayError("Razorpay SDK failed to load. Check internet connection.");
        setPayingOrder(null);
        return;
      }

      const payRes = await axios.post(
        "http://localhost:3000/api/v1/payment/create",
        { orderId: order._id },
        { withCredentials: true }
      );

      const { key, razorpayOrderId, amount, currency } = payRes.data;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "FoodView",
        description: `Order #${order._id.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await axios.post(
              "http://localhost:3000/api/v1/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            );
            await fetchOrders();
          } catch (vErr) {
            setPayError(vErr.response?.data?.message || "Payment verification failed.");
          } finally {
            setPayingOrder(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingOrder(null);
          },
        },
        theme: {
          color: "#ff3b30",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setPayError(`Payment failed: ${response.error?.description || "Something went wrong"}`);
        setPayingOrder(null);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.response?.data?.message || "Failed to initiate payment.");
      setPayingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="page-state loading-state">
        <div className="spinner" />
        <p className="state-text">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Header />
      <main className="orders-main">
        <h1 className="orders-heading">Your Orders</h1>

        {payError && <p className="orders-error-toast">{payError}</p>}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty__icon">📦</div>
            <p className="orders-empty__title">No orders yet</p>
            <p className="orders-empty__sub">Your order history will appear here</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusStyle = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.Pending;
              const canCancel = order.orderStatus === "Pending";
              const needsPayment =
                order.paymentMethod === "ONLINE" &&
                order.paymentStatus !== "Paid" &&
                order.orderStatus !== "Cancelled";
              const itemCount = order.items?.length || 0;

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card__top">
                    <div className="order-card__partner">
                      {order.foodPartner?.restaurantName || "Restaurant"}
                    </div>
                    <div className="order-card__badges">
                      <span
                        className="order-card__payment-badge"
                        style={{
                          background:
                            order.paymentStatus === "Paid"
                              ? "rgba(52,199,89,0.15)"
                              : "rgba(255,149,0,0.15)",
                          color:
                            order.paymentStatus === "Paid" ? "#34c759" : "#ff9500",
                          border: `1px solid ${
                            order.paymentStatus === "Paid"
                              ? "rgba(52,199,89,0.3)"
                              : "rgba(255,149,0,0.3)"
                          }`,
                        }}
                      >
                        {order.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                      </span>
                      <span
                        className="order-card__status"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="order-card__items">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-card__item-chip">
                        {item.food?.name || "Item"} ×{item.quantity}
                      </span>
                    ))}
                    {itemCount > 3 && (
                      <span className="order-card__item-chip order-card__item-chip--more">
                        +{itemCount - 3} more
                      </span>
                    )}
                  </div>

                  <div className="order-card__meta">
                    <div className="order-card__address">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {order.deliveryAddress}
                    </div>
                    <div className="order-card__bottom-row">
                      <span className="order-card__total">₹{order.totalAmount}</span>
                      <span className="order-card__method">{order.paymentMethod}</span>
                      
                      {needsPayment && (
                        <button
                          className="order-card__pay-btn"
                          onClick={() => handlePayNow(order)}
                          disabled={payingOrder === order._id}
                        >
                          {payingOrder === order._id ? "Opening..." : "Pay Now"}
                        </button>
                      )}

                      {canCancel && (
                        <button
                          className="order-card__cancel-btn"
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelling === order._id}
                        >
                          {cancelling === order._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Orders;
