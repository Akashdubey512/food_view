import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useCart } from "../../context/CartContext";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import "../../styles/unified-design-system.css";
import "./page.css";
import "./Cart.css";

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderError, setOrderError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    return () => {};
  }, []);

  const handleQuantity = async (foodId, op) => {
    await updateQuantity(foodId, op);
  };

  const handleRemove = async (foodId) => {
    await removeFromCart(foodId);
  };

  const handleChangeAddress = () => {
    setTempAddress(address);
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    if (tempAddress.trim()) {
      setAddress(tempAddress);
      setIsEditingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    setOrderError("");
    setOrderMsg("");

    if (!address.trim()) {
      setOrderError("Please enter your delivery address.");
      return;
    }

    if (!paymentMethod) {
      setOrderError("Choose payment method first");
      return;
    }

    setPlacing(true);

    try {
      // 1. Create order in backend
      const orderRes = await axios.post(
        "http://localhost:3000/api/v1/order",
        { deliveryAddress: address, paymentMethod: paymentMethod },
        { withCredentials: true }
      );

      const createdOrder = orderRes.data.order;

      // 2. If Cash on Delivery, done directly
      if (paymentMethod === "COD") {
        setOrderMsg("🎉 Order placed successfully! Redirecting to your orders...");
        await fetchCart();
        setTimeout(() => navigate("/orders"), 2200);
        setPlacing(false);
        return;
      }

      // 3. If ONLINE payment method, initiate Razorpay order
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setOrderError("Razorpay SDK failed to load. Please check your internet connection.");
        setPlacing(false);
        return;
      }

      const payRes = await axios.post(
        "http://localhost:3000/api/v1/payment/create",
        { orderId: createdOrder._id },
        { withCredentials: true }
      );

      const { key, razorpayOrderId, amount, currency } = payRes.data;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "FoodView",
        description: `Order #${createdOrder._id.slice(-6)}`,
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
            setOrderMsg("🎉 Payment successful & Order placed! Redirecting...");
            await fetchCart();
            setTimeout(() => navigate("/orders"), 2000);
          } catch (vErr) {
            setOrderError(vErr.response?.data?.message || "Payment verification failed.");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setOrderError("Payment process was cancelled. You can pay from your Orders page.");
            setPlacing(false);
          },
        },
        theme: {
          color: "#A7D39B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setOrderError(`Payment failed: ${response.error?.description || "Something went wrong"}`);
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      setOrderError(err.response?.data?.message || "Failed to place order. Try again.");
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-state loading-state">
        <div className="spinner" />
        <p className="state-text">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  return (
    <div className="cart-page">
      <main className="cart-main">
        {/* HEADER */}
        <div className="cart-header-section">
          <div className="cart-title-bar">
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="22"
                height="22"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <h1 className="cart-heading">My Cart</h1>
            {items.length > 0 && (
              <button className="cart-clear-btn" onClick={clearCart}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <p className="cart-empty__title">Your cart is empty</p>
            <p className="cart-empty__sub">Add food from the reels to get started</p>
            <button className="cart-browse-btn" onClick={() => navigate("/")}>
              Browse Reels
            </button>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="cart-items">
              {items.map((item) => {
                const food = item.food || {};
                const name = food.name || "Unknown Item";
                const price = item.price ?? food.price ?? 0;
                const thumbnail = food.thumbnail;
                const subtotal = price * item.quantity;

                return (
                  <div key={item._id || food._id} className="cart-item">
                    {/* IMAGE */}
                    <div className="cart-item__image-wrapper">
                      <img
                        src={thumbnail}
                        alt={name}
                        className="cart-item__image"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="cart-item__content">
                      <h3 className="cart-item__name">{name}</h3>
                      <p className="cart-item__price">
                        ₹{price} × {item.quantity}
                      </p>
                      <p className="cart-item__subtotal">
                        ₹{subtotal.toFixed(0)}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="cart-item__actions-wrapper">
                      <div className="cart-item__controls">
                        <button
                          className="cart-qty-btn"
                          onClick={() => handleQuantity(food._id || item.food, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => handleQuantity(food._id || item.food, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(food._id || item.food)}
                        aria-label="Remove item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="16"
                          height="16"
                        >
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="order-summary-section">
              <h3 className="order-summary-title">ORDER SUMMARY</h3>
              <div className="order-summary-content">
                <div className="summary-row">
                  <span className="summary-label">Items ({items.length})</span>
                  <span className="summary-value">₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Delivery</span>
                  <span className="summary-free">Free</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span className="summary-total-label">Total</span>
                  <span className="summary-total-value">₹{totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            {!isEditingAddress ? (
              <div className="delivery-address-card">
                <div className="delivery-card-header">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="18"
                    height="18"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <h4 className="delivery-card-title">Delivery Address</h4>
                  <button
                    className="delivery-card-change-btn"
                    onClick={handleChangeAddress}
                  >
                    Change
                  </button>
                </div>
                {address && (
                  <p className="delivery-card-text">{address}</p>
                )}
                {!address && (
                  <p className="delivery-card-empty">Add a delivery address to continue</p>
                )}
              </div>
            ) : (
              <div className="delivery-address-edit">
                <h4 className="edit-address-title">Edit Delivery Address</h4>
                <textarea
                  className="edit-address-input"
                  placeholder="Enter your full delivery address..."
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  rows="4"
                />
                <div className="edit-address-actions">
                  <button
                    className="edit-address-btn cancel-btn"
                    onClick={handleCancelAddress}
                  >
                    Cancel
                  </button>
                  <button
                    className="edit-address-btn save-btn"
                    onClick={handleSaveAddress}
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD */}
            <div className="payment-method-card">
              <div className="payment-card-header">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="18"
                  height="18"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                <h4 className="payment-card-title">Payment Method</h4>
              </div>

              <div className="payment-options">
                <button
                  className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <span className="payment-icon">💵</span>
                  <span className="payment-text">Cash on Delivery</span>
                  {paymentMethod === "COD" && (
                    <svg className="payment-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <button
                  className={`payment-option ${paymentMethod === "ONLINE" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("ONLINE")}
                >
                  <span className="payment-icon">💳</span>
                  <span className="payment-text">Online Payment</span>
                  {paymentMethod === "ONLINE" && (
                    <svg className="payment-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE - ABOVE BUTTON */}
            {orderError && <p className="cart-error">{orderError}</p>}
            {orderMsg && <p className="cart-success">{orderMsg}</p>}

            {/* PLACE ORDER BUTTON - FIXED */}
            <button
              className="cart-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <span className="cart-order-spinner" />
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="18"
                    height="18"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Place Order · ₹{totalPrice.toFixed(0)}
                </>
              )}
            </button>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Cart;