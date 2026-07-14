import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Reels from "../../components/Reels/Reels";
import BottomNav from "../../components/BottomNav/BottomNav";
import "../../styles/unified-design-system.css";
import "./page.css";

const Saved = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedReels = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/v1/food/saved", {
          withCredentials: true,
        });

        setReels(response.data.foodItems ?? []);
        setError(null);
      } catch (err) {
        console.error("Error fetching saved reels:", err.message);
        setError(err.message);
        if (err.response?.status === 401) {
          navigate("/user/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSavedReels();
  }, [navigate]);

  const handleRemoveReel = (reelId) => {
    setReels((prevReels) =>
      prevReels.filter((reel) => reel._id !== reelId)
    );
  };

  if (loading) {
    return (
      <div className="page-state loading-state">
        <div className="spinner" />
        <p className="state-text">Loading your saved reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state error-state">
        <p className="state-icon">⚠️</p>
        <p className="state-text">Couldn't load saved reels</p>
        <p className="state-subtext">{error}</p>
        <button
          className="state-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="page-state empty-state">
        <p className="state-icon">🔖</p>
        <p className="state-text">No saved reels yet</p>
        <p className="state-subtext">
          Explore and save your favorite food reels
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <Reels reels={reels} onRemoveReel={handleRemoveReel} />
      <BottomNav />
    </div>
  );
};

export default Saved;