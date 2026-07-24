import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useCart } from "../../context/CartContext";
import "../../styles/unified-design-system.css";
import "./page.css";
import "./Cart.css";

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderError, setOrderError] = useState("");
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

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setOrderError("Please enter your delivery address.");
      return;
    }
    setPlacing(true);
    setOrderError("");
    try {
      await axios.post(
        "http://localhost:3000/api/v1/order",
        { deliveryAddress: address, paymentMethod: "COD" },
        { withCredentials: true }
      );
      setOrderMsg("🎉 Order placed successfully! Redirecting to your orders...");
      await fetchCart();
      setTimeout(() => navigate("/orders"), 2200);
    } catch (err) {
      setOrderError(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
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

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-main">
        <div className="cart-header-section">
          <h1 className="cart-heading">Your Cart</h1>
          {items.length > 0 && (
            <button className="cart-clear-btn" onClick={clearCart}>
              Clear All
            </button>
          )}
        </div>

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
            <div className="cart-items">
              {items.map((item) => {
                const food = item.food || {};
                const name = food.name || "Unknown Item";
                const price = item.price ?? food.price ?? 0;
                return (
                  <div key={item._id || food._id} className="cart-item">
                    <div className="cart-item__info">
                      <p className="cart-item__name">{name}</p>
                      <p className="cart-item__price">₹{price} × {item.quantity}</p>
                      <p className="cart-item__subtotal">= ₹{(price * item.quantity).toFixed(0)}</p>
                    </div>
                    <div className="cart-item__controls">
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantity(food._id || item.food, -1)}
                        aria-label="Decrease"
                      >−</button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantity(food._id || item.food, 1)}
                        aria-label="Increase"
                      >+</button>
                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(food._id || item.food)}
                        aria-label="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span>₹{cart.totalPrice?.toFixed(0) || 0}</span>
              </div>
            </div>

            <div className="cart-checkout">
              <label className="cart-address-label" htmlFor="delivery-address">
                Delivery Address
              </label>
              <textarea
                id="delivery-address"
                className="cart-address-input"
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />

              {orderError && <p className="cart-error">{orderError}</p>}
              {orderMsg && <p className="cart-success">{orderMsg}</p>}

              <button
                className="cart-order-btn"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? (
                  <span className="cart-order-spinner" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    Place Order · ₹{cart.totalPrice?.toFixed(0) || 0}
                  </>
                )}
              </button>
              <p className="cart-cod-note">💳 Cash on Delivery</p>
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Cart;
