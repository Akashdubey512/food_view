import React from "react";
import "../../styles/Home.css";

const videos = [
  {
    id: 1,
    videoUrl: "https://res.cloudinary.com/duoqjugir/video/upload/v1782536150/food_view/qqb7jpbmaunpuilyimti.mp4",
    badge: "🔥 Trending",
    storeName: "Fresh Basket",
    tagline: "Fresh & Organic",
    rating: "4.8",
    deliveryTime: "20–25 min",
    deliveryFee: "Free Delivery",
    description:
      "Fresh groceries delivered to your doorstep with the best quality and amazing prices.",
    storeLink: "/store/1",
  },
  {
    id: 2,
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    badge: "⭐ Bestseller",
    storeName: "Green Harvest",
    tagline: "Healthy Salads",
    rating: "4.7",
    deliveryTime: "18–22 min",
    deliveryFee: "\$1.5 Delivery",
    description:
      "Discover organic fruits and vegetables directly from trusted local sellers near you.",
    storeLink: "/store/2",
  },
  {
    id: 3,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    badge: "🥬 Healthy Choice",
    storeName: "Snack Point",
    tagline: "Vegetarian",
    rating: "4.9",
    deliveryTime: "15–20 min",
    deliveryFee: "\$2 Delivery",
    description:
      "Order snacks, drinks, and daily essentials from your favorite nearby store in minutes.",
    storeLink: "/store/3",
  },
];

const Home = () => {
  return (
    <div className="reels-container">
      {videos.map((video) => {
        const metaItems = [
          `⭐ ${video.rating}`,
          `⏱ ${video.deliveryTime}`,
          `🚚 ${video.deliveryFee}`,
        ];

        return (
          <div className="reel-slide" key={video.id}>
            <video
              className="reel-video"
              src={video.videoUrl}
              autoPlay
              muted
              loop
              playsInline
            />

            <div className="status-badge">{video.badge}</div>

            <div className="reel-overlay">
              <div className="content-panel">
                <h3 className="store-name">{video.storeName}</h3>
                <p className="store-tagline">{video.tagline}</p>

                <div className="store-meta">
                  {metaItems.map((item, index) => (
                    <span className="meta-item" key={index}>
                      {item}
                    </span>
                  ))}
                </div>

                <p className="reel-description">{video.description}</p>

                <button
                  className="visit-store-btn"
                  onClick={() => (window.location.href = video.storeLink)}
                >
                  Visit Store
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;