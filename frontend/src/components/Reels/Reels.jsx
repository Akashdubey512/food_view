import React, { useEffect, useRef } from "react";
import ReelCard from "./ReelCard";
import "./Reels.css";

const Reels = ({ reels, onRemoveReel }) => {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !reels.length) return;

    const observerOptions = {
      root: container,
      rootMargin: "0px",
      threshold: [0.5],
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }, observerOptions);

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [reels.length]);

  if (!reels || reels.length === 0) {
    return (
      <div className="reels-empty">
        <div className="reels-empty__content">
          <p className="reels-empty__icon">🍽️</p>
          <p className="reels-empty__text">No reels found</p>
          <p className="reels-empty__subtext">
            Come back later for more delicious content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reels-container" ref={containerRef}>
      {reels.map((reel, index) => (
        <ReelCard
          key={reel._id}
          reel={reel}
          videoRef={(el) => (videoRefs.current[index] = el)}
          onRemoveReel={onRemoveReel}
        />
      ))}
    </div>
  );
};

export default Reels;