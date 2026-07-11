import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/FoodPartnerProfile.css";
import axios from "axios";

function PartnerHeader({ partner,totalMeals }) {
  return (
    <header className="partner-header">
      <div className="partner-top-row">
        <div className="partner-logo-wrap">
          <img
            src="https://res.cloudinary.com/duoqjugir/image/upload/v1765702465/samples/dessert-on-a-plate.jpg"
            alt={partner.fullName}
            className="partner-logo"
          />
        </div>

        <div className="partner-header-info">
          <h1 className="partner-name">{partner.fullName}</h1>
          <h2 className="partner-name">{partner.bussinessName}</h2>
          <p className="partner-address">{partner.address}</p>
        </div>
      </div>

      <div className="partner-stats-section">
        <div className="partner-stats">
          <div className="partner-stat">
            <span className="partner-stat-label">Total Meals</span>
            <span className="partner-stat-value">{totalMeals}</span>
          </div>

          <div className="partner-stat">
            <span className="partner-stat-label">Customers Served</span>
            {/* <span className="partner-stat-value">{partner.customersServed}</span> */}
          </div>
        </div>
        <div className="partner-divider" />
      </div>
    </header>
  );
}

function VideoGrid({ videos }) {
  const navigate = useNavigate();

  const handleVideoClick = (video) => {
    navigate(`/video/${video.id}`, { state: { video } });
  };

  return (
    <section className="video-grid-section">
      <div className="video-grid">
        {videos.map((video) => (
          <button
            key={video._id}
            className="video-card"
            type="button"
            onClick={() => handleVideoClick(video)}
          >
            <video
              className="video-card-media"
              src={video.video}
              muted
              playsInline
              preload="metadata"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function FoodPartnerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  // Fetch partner data based on partnerId
  const [videos, setVideos] = useState([]); // Replace with API call

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v1/food-partner/${id}`, { withCredentials: true })
      .then((response) => {
        setProfile(response.data.foodPartner);
        setVideos(response.data.foodPartner.foodItems);
      })
      .catch((error) => {
        console.error("Error fetching partner data:", error);
      });
  }, [id]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <main className="partner-profile-page">
      <div className="partner-profile-shell">
        <PartnerHeader partner={profile}
         totalMeals={videos.length}
        />
        <VideoGrid videos={videos} />
      </div>
    </main>
  );
}