import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Header from "../../components/Header/Header";
import Reels from "../../components/Reels/Reels";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/unified-design-system.css";
import "./page.css";

const LIMIT = 10;

const Home = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isFetchingRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        setPage(1);

        const foodResponse = await api.get(`/api/v1/food?page=1&limit=${LIMIT}`);

        const foodItems = foodResponse.data.foodItems || [];
        const pagination = foodResponse.data.pagination || {};

        setReels(foodItems);
        setHasNextPage(pagination.hasNextPage ?? false);
        setError(null);
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

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasNextPage) return;
    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const foodResponse = await api.get(`/api/v1/food?page=${nextPage}&limit=${LIMIT}`);

      const newItems = foodResponse.data.foodItems || [];
      const pagination = foodResponse.data.pagination || {};

      setReels((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasNextPage(pagination.hasNextPage ?? false);
    } catch (err) {
      console.error("Error loading more reels:", err.message);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [hasNextPage, page]);

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
      <Reels
        reels={reels}
        onLoadMore={loadMore}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
      />
      <BottomNav />
    </div>
  );
};

export default Home;