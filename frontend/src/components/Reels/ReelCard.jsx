import React, { useState } from "react";
import axios from "axios";
import ActionRail from "../ActionRail/ActionRail";
import "./ReelCard.css";

const ReelCard = ({ reel, videoRef, onRemoveReel }) => {
  const [isLiked, setIsLiked] = useState(reel?.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel?.isSaved || false);
  const [likeCount, setLikeCount] = useState(reel?.likeCount || 0);
  const [saveCount, setSaveCount] = useState(reel?.saveCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

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

  return (
    <section className="reel-card">
      {/* Video - Hero */}
      <video
        ref={videoRef}
        className="reel-card__video"
        src={reel.video}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Overlay */}
      <div className="reel-card__overlay" />

      {/* Left Side Content - Description Only (No Placeholder) */}
      <div className="reel-card__content">
        {/* Only show description if it exists and is not empty */}
        {reel.description && reel.description.trim() && (
          <p className="reel-card__description">{reel.description}</p>
        )}
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