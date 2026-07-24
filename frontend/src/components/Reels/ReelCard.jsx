import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ActionRail from "../ActionRail/ActionRail";
import { useCart } from "../../context/CartContext";
import "./ReelCard.css";

const ReelCard = ({ reel, videoRef, onRemoveReel }) => {
  const [isLiked, setIsLiked] = useState(reel?.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel?.isSaved || false);
  const [likeCount, setLikeCount] = useState(reel?.likesCount || 0);
  const [saveCount, setSaveCount] = useState(reel?.saveCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const inCart = isInCart(reel._id);

  const handleLike = async () => {
    if (isLiking) return;
    const previousLiked = isLiked;
    const previousCount = likeCount;
    setShowLikeAnimation(true);
    setIsLiking(true);
    setTimeout(() => setShowLikeAnimation(false), 300);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/food/like",
        { foodId: reel._id },
        { withCredentials: true }
      );
      const { food, likedStatus } = response.data;
      setIsLiked(likedStatus);
      setLikeCount(food?.likesCount ?? likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    const previousSaved = isSaved;
    const previousCount = saveCount;
    setShowSaveAnimation(true);
    setIsSaving(true);
    setTimeout(() => setShowSaveAnimation(false), 300);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/food/save",
        { foodId: reel._id },
        { withCredentials: true }
      );
      const { food, savedStatus } = response.data;
      setIsSaved(savedStatus);
      setSaveCount(food?.saveCount ?? saveCount);
      if (!savedStatus && onRemoveReel) {
        setTimeout(() => onRemoveReel(reel._id), 300);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(previousSaved);
      setSaveCount(previousCount);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCartAction = async () => {
    if (!reel.isAvailable) return;
    if (inCart) {
      navigate("/cart");
      return;
    }
    setCartLoading(true);
    setCartError("");
    const result = await addToCart(reel._id, 1);
    setCartLoading(false);
    if (!result.success) {
      setCartError(result.message || "Failed to add");
      setTimeout(() => setCartError(""), 3000);
    }
  };

  return (
    <section className="reel-card">
      {/* Video */}
      <video
        ref={videoRef}
        className="reel-card__video"
        src={reel.video}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Gradient Overlay */}
      <div className="reel-card__overlay" />

      {/* Bottom info card */}
      <div className="reel-card__bottom-content">
        <div className="reel-card__info-card">
          {/* Availability badge */}
          <span className={`reel-card__badge ${reel.isAvailable ? "reel-card__badge--available" : "reel-card__badge--unavailable"}`}>
            {reel.isAvailable ? "● Available" : "● Unavailable"}
          </span>

          <div className="reel-card__meta">
            {reel.name && reel.name.trim() && (
              <h3 className="reel-card__title">{reel.name}</h3>
            )}
            {reel.description && reel.description.trim() && (
              <p className="reel-card__description">{reel.description}</p>
            )}
          </div>

          {/* Price + CTA row */}
          <div className="reel-card__cta-row">
            <span className="reel-card__price">
              {reel.price != null ? `₹${reel.price}` : ""}
            </span>

            {cartError && (
              <span className="reel-card__cart-error">{cartError}</span>
            )}

            <button
              className={`reel-card__cart-btn ${inCart ? "reel-card__cart-btn--in-cart" : ""} ${!reel.isAvailable ? "reel-card__cart-btn--disabled" : ""}`}
              onClick={handleCartAction}
              disabled={!reel.isAvailable || cartLoading}
              aria-label={inCart ? "Go to Cart" : "Add to Cart"}
            >
              {cartLoading ? (
                <span className="reel-card__cart-spinner" />
              ) : inCart ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="reel-card__btn-icon">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Buy Now
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="reel-card__btn-icon">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Action Rail */}
      <ActionRail
        isLiked={isLiked}
        isSaved={isSaved}
        likeCount={likeCount}
        saveCount={saveCount}
        onLike={handleLike}
        onSave={handleSave}
        showLikeAnimation={showLikeAnimation}
        showSaveAnimation={showSaveAnimation}
        foodPartnerId={reel.foodPartner}
      />
    </section>
  );
};

export default ReelCard;