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
  foodId,        // Add this prop
  foodName,      // Add this prop
}) => {
  const navigate = useNavigate();

  const handleVisitStore = () => {
    navigate(`/foodpartner/${foodPartnerId}`);
  };

  const handleShare = () => {
    // Create URL with food ID as query parameter
    const shareableUrl = `${window.location.origin}/foodpartner/${foodPartnerId}?food=${foodId}`;
    const title = foodName || "Check out this food reel!";
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out ${foodName || "this food"} on FoodView! 🍕`,
        url: shareableUrl,
      }).catch(() => {});
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText(shareableUrl)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch(() => {
          prompt("Copy this link:", shareableUrl);
        });
    }
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

      {/* ====== SHARE ACTION ====== */}
      <div className="action-item">
        <button
          className="action-button action-button--share"
          onClick={handleShare}
          aria-label="Share"
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="action-icon"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActionRail;