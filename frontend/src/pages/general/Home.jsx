import React, { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);

  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  // Fetch videos
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/food", {
        withCredentials: true,
      })
      .then((response) => {
        setVideos(response.data.foodItems || []);
      })
      .catch((err) => {
        console.error("Error fetching videos:", err.message);
       navigate("/user/login")
      });
  }, []);

  // Play only the active reel
  useEffect(() => {
    const container = containerRef.current;

    if (!container || videos.length === 0) return;

    const playCurrentVideo = () => {
      const viewportCenter = window.innerHeight / 2;

      let activeIndex = 0;
      let minDistance = Infinity;

      videoRefs.current.forEach((video, index) => {
        if (!video) return;

        const rect = video.getBoundingClientRect();
        const videoCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - videoCenter);

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      videoRefs.current.forEach((video, index) => {
        if (!video) return;

        if (index === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0; // remove this line if you want paused videos to resume instead of restarting
        }
      });
    };

    playCurrentVideo();

    container.addEventListener("scroll", playCurrentVideo);

    return () => {
      container.removeEventListener("scroll", playCurrentVideo);
    };
  }, [videos]);

  return (
    <div className="reels-container" ref={containerRef}>
      {videos.map((video, index) => (
        <section className="reel-slide" key={video._id}>
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            className="reel-video"
            src={video.video}
            muted
            loop
            playsInline
            preload="metadata"
          />

          <div className="reel-overlay">
            <p className="reel-description">{video.description}</p>

            <Link
              to={`/foodpartner/${video.foodPartner}`}
              className="visit-store-btn"
            >
              Visit Store
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
};

export default Home;