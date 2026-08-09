import React, { useEffect, useRef } from "react";
import ReelCard from "./ReelCard";
import "./Reels.css";

const Reels = ({ reels, onRemoveReel, onLoadMore, loadingMore, hasNextPage }) => {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const sentinelRef = useRef(null);

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

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !hasNextPage || !onLoadMore) return;

    const sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { root: container, rootMargin: "200px", threshold: 0 }
    );

    sentinelObserver.observe(sentinel);
    return () => sentinelObserver.disconnect();
  }, [hasNextPage, onLoadMore, reels.length]);

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

      {/* Sentinel: triggers onLoadMore when scrolled into view */}
      {hasNextPage && <div ref={sentinelRef} style={{ height: 1 }} />}

      {/* Loading indicator while fetching next page */}
      {loadingMore && (
        <div className="reels-load-more">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export default Reels;