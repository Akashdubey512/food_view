import React from "react";
import { useNavigate } from "react-router-dom";
import "./ActionRail.css";

const ActionRail = ({
  isLiked,
  isSaved,
  likeCount,
  saveCount,
  onLike,
  onSave,
  showLikeAnimation,
  showSaveAnimation,
  foodPartnerId,
}) => {
  const navigate = useNavigate();

  const handleVisitStore = () => {
    navigate(`/foodpartner/${foodPartnerId}`);
  };

  const handleOrder = () => {
    // Placeholder for future order flow
    console.log("Order initiated for:", foodPartnerId);
  };

  return (
    <div className="action-rail" role="group" aria-label="Reel actions">
      {/* ====== LIKE ACTION ====== */}
      <div className="action-item">
        <button
          className={`action-button ${isLiked ? "action-button--liked" : ""} ${
            showLikeAnimation ? "action-button--pop" : ""
          }`}
          onClick={onLike}
          aria-label={isLiked ? "Unlike" : "Like"}
          type="button"
        >
          {isLiked ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="action-icon">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="action-icon"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </button>
        <span className={`action-count ${showLikeAnimation ? "action-count--animate" : ""}`}>
          {likeCount}
        </span>
      </div>

      {/* ====== SAVE ACTION ====== */}
      <div className="action-item">
        <button
          className={`action-button ${isSaved ? "action-button--saved" : ""} ${
            showSaveAnimation ? "action-button--bookmark" : ""
          }`}
          onClick={onSave}
          aria-label={isSaved ? "Unsave" : "Save"}
          type="button"
        >
          {isSaved ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="action-icon">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="action-icon"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          )}
        </button>
        <span className={`action-count ${showSaveAnimation ? "action-count--animate" : ""}`}>
          {saveCount}
        </span>
      </div>

      {/* ====== VISIT STORE ACTION ====== */}
      <div className="action-item">
        <button
          className="action-button action-button--visit"
          onClick={handleVisitStore}
          aria-label="Visit Store"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="action-icon"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
          </svg>
        </button>
      </div>

      {/* ====== ORDER ACTION ====== */}
      <div className="action-item">
        <button
          className="action-button action-button--order"
          onClick={handleOrder}
          aria-label="Order"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="action-icon"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActionRail;