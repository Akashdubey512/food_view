import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Reels from "../../components/Reels/Reels";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/unified-design-system.css";
import "./page.css";

const Home = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);

        const foodResponse = await axios.get(
          "http://localhost:3000/api/v1/food",
          {
            withCredentials: true,
          }
        );

        const foodItems = foodResponse.data.foodItems || [];

        setReels(foodItems);
        setError(null);
        setReels(foodItems);
      } catch (err) {
        console.error("Error fetching reels:", err.message);
        setError(err.message);
        if (err.response?.status === 401) {
          navigate("/user/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, [navigate, isAuthenticated]);

  if (loading) {
    return (
      <div className="page-state loading-state">
        <div className="spinner" />
        <p className="state-text">Discovering delicious reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state error-state">
        <p className="state-icon">⚠️</p>
        <p className="state-text">Couldn't load reels</p>
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

  return (
    <div className="page">
      <Header />
      <Reels reels={reels} />
      <BottomNav />
    </div>
  );
};

export default Home;