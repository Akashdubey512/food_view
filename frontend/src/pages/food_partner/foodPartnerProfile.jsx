import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useAuth} from '../../context/AuthContext'
import api from "../../utils/api";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useCart } from "../../context/CartContext";
import "../../styles/partner-design-system.css";
import "../../styles/foodPartnerProfile.css";

const API = "/api/v1";

/* ══════════════════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════════════════ */
function Shimmer({ w, h, r = 10, style }) {
  return <div className="fpp-shimmer" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

function PageSkeleton() {
  return (
    <div className="fpp-skeleton-page">
      <div className="fpp-skeleton-header">
        <Shimmer w={44} h={44} r={22} />
        <div style={{ flex: 1 }}>
          <Shimmer w="60%" h={16} style={{ marginBottom: 6 }} />
          <Shimmer w="40%" h={12} />
        </div>
      </div>
      <div className="fpp-skeleton-stats">
        {[1, 2].map(i => (
          <Shimmer key={i} w={100} h={64} r={14} />
        ))}
      </div>
      <Shimmer w="100%" h={0} r={0} style={{ paddingBottom: "120%", margin: "0 0 16px" }} />
      <div style={{ padding: "0 16px" }}>
        <Shimmer w={100} h={16} style={{ marginBottom: 12 }} />
        <div className="fpp-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Shimmer key={i} w="100%" h={0} r={8} style={{ paddingBottom: "177%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   HERO FEATURED REEL PLAYER
══════════════════════════════════════════════════════════ */
function FeaturedPlayer({ reel, partnerName, onNextReel, onPrevReel, hasPrev, hasNext }) {
  const videoRef = useRef(null);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(reel?.likesCount || 0);
  const [saveCount, setSaveCount] = useState(reel?.saveCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cartLoad, setCartLoad] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [statusLoading, setStatusLoading] = useState(true);

  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const inCart = isInCart(reel._id);

  useEffect(() => {
    const fetchStatus = async () => {
      setStatusLoading(true);
      try {
        const likeRes = await api.get(`${API}/food/${reel._id}/like-status`);
        setIsLiked(likeRes.data.isLiked || false);
        
        const saveRes = await api.get(`${API}/food/${reel._id}/save-status`);
        setIsSaved(saveRes.data.isSaved || false);
        
        setLikeCount(reel?.likesCount || 0);
        setSaveCount(reel?.saveCount || 0);
      } catch (err) {
        console.error("Error fetching status:", err);
        setIsLiked(false);
        setIsSaved(false);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
    setPlaying(true);
    setProgress(0);
    setCartMsg("");
  }, [reel._id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [playing, reel._id]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v?.duration) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    v.currentTime = pos * v.duration;
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && hasNext && onNextReel) {
      onNextReel();
    } else if (isSwipeRight && hasPrev && onPrevReel) {
      onPrevReel();
    }
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    const prev = { isLiked, likeCount };
    setIsLiked(l => !l);
    setLikeCount(c => (isLiked ? c - 1 : c + 1));
    try {
      const res = await api.post(`${API}/food/like`, { foodId: reel._id });
      setIsLiked(res.data.likedStatus);
      setLikeCount(res.data.food?.likesCount ?? likeCount);
    } catch {
      setIsLiked(prev.isLiked);
      setLikeCount(prev.likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(s => !s);
    try {
      const res = await api.post(`${API}/food/save`, { foodId: reel._id });
      setIsSaved(res.data.savedStatus);
      setSaveCount(res.data.food?.saveCount ?? saveCount);
    } catch {
      setIsSaved(prevSaved);
      setSaveCount(prev.saveCount);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!reel.isAvailable) return;
    if (inCart) {
      navigate("/cart");
      return;
    }
    setCartLoad(true);
    const r = await addToCart(reel._id, 1);
    setCartLoad(false);
    setCartMsg(r.success ? "🎉 Added to cart!" : r.message || "Failed to add");
    setTimeout(() => setCartMsg(""), 2500);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: reel.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

if (statusLoading) {
  return (
    <div className="fpp-player">
      <div className="fpp-player__video-wrap" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  );
}

  return (
    <div className="fpp-player">
      <div
        className="fpp-player__video-wrap"
        onClick={() => setPlaying(p => !p)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          className="fpp-player__video"
          src={reel.video}
          loop
          playsInline
          autoPlay
          preload="auto"
          onTimeUpdate={onTimeUpdate}
        />

        <div className="fpp-player__gradient" />

        <div className={`fpp-player__play-icon ${playing ? "fpp-player__play-icon--hidden" : ""}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {hasPrev && (
          <button className="fpp-swipe-hint fpp-swipe-hint--left" onClick={(e) => { e.stopPropagation(); onPrevReel(); }} aria-label="Previous Reel">
            ‹
          </button>
        )}
        {hasNext && (
          <button className="fpp-swipe-hint fpp-swipe-hint--right" onClick={(e) => { e.stopPropagation(); onNextReel(); }} aria-label="Next Reel">
            ›
          </button>
        )}

        <div className="fpp-player__badges">
          <span className={`fpp-player__avail ${reel.isAvailable ? "fpp-player__avail--yes" : "fpp-player__avail--no"}`}>
            {reel.isAvailable ? "● Available" : "● Unavailable"}
          </span>
          {reel.isVeg !== undefined && (
            <span className="fpp-player__veg-tag">
              {reel.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
            </span>
          )}
        </div>

        {/* Action Rail */}
        <div className="fpp-player__rail">
          <button
            className={`fpp-rail-btn ${isLiked ? "fpp-rail-btn--liked" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="fpp-rail-btn__count">{likeCount}</span>
          </button>

          <button
            className={`fpp-rail-btn ${isSaved ? "fpp-rail-btn--saved" : ""}`}
            onClick={handleSave}
            disabled={isSaving}
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span className="fpp-rail-btn__count">{saveCount}</span>
          </button>

          <button className="fpp-rail-btn" onClick={handleShare} aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        <div className="fpp-player__bottom">
          <h3 className="fpp-player__food-name">{reel.name}</h3>
          {reel.description && <p className="fpp-player__food-desc">{reel.description}</p>}
          <span className="fpp-player__restaurant-tag">🏪 {partnerName}</span>
        </div>

        <div className="fpp-player__progress" onClick={(e) => { e.stopPropagation(); seek(e); }}>
          <div className="fpp-player__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="fpp-player__bar">
        <button className="fpp-ctrl" onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        {reel.price != null && (
          <div className="fpp-player__price-container">
            <span className="fpp-player__large-price">₹{reel.price}</span>
          </div>
        )}

        <button
          className={`fpp-cart-btn ${inCart ? "fpp-cart-btn--in" : ""} ${!reel.isAvailable ? "fpp-cart-btn--off" : ""}`}
          onClick={handleAddToCart}
          disabled={!reel.isAvailable || cartLoad}
        >
          {cartLoad ? "…" : inCart ? (
            <>✓ In Cart</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>

      {cartMsg && <div className="fpp-cart-toast">{cartMsg}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REEL THUMBNAIL CARD
══════════════════════════════════════════════════════════ */
function ReelThumb({ food, isActive, onClick }) {
  return (
    <button className={`fpp-thumb ${isActive ? "fpp-thumb--active" : ""}`} onClick={onClick} type="button">
      <div className="fpp-thumb__media">
        {food.thumbnail ? (
          <img src={food.thumbnail} alt={food.name} className="fpp-thumb__img" loading="lazy" />
        ) : (
          <video className="fpp-thumb__img" src={food.video} muted playsInline preload="metadata" />
        )}
      </div>

      <div className="fpp-thumb__overlay">
        <div className="fpp-thumb__play">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>

      {isActive && (
        <span className="fpp-thumb__playing-badge">
          🟢 Playing
        </span>
      )}

      <div className="fpp-thumb__footer">
        <span className="fpp-thumb__name">{food.name}</span>
        <span className="fpp-thumb__meta">❤ {food.likesCount ?? 0}</span>
      </div>

      {isActive && <div className="fpp-thumb__ring" />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN FOOD PARTNER PROFILE PAGE
══════════════════════════════════════════════════════════ */
export default function FoodPartnerProfile() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [partner, setPartner] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`${API}/food-partner/${id}`)
      .then(res => {
        const fp = res.data.foodPartner;
        setPartner(fp);
        const foodList = fp.foodItems || [];
        setFoods(foodList);
        setActiveReelIndex(0);
      })
      .catch(err => {
        console.error("Error fetching food partner:", err);
        setError("Could not load restaurant storefront.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const activeReel = foods[activeReelIndex] || null;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/user/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const selectReelByIndex = useCallback((idx) => {
    if (idx >= 0 && idx < foods.length) {
      setActiveReelIndex(idx);
      setTimeout(() => {
        heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }, [foods.length]);

  const selectReel = useCallback((food) => {
    const idx = foods.findIndex(f => f._id === food._id);
    if (idx !== -1) {
      selectReelByIndex(idx);
    }
  }, [foods, selectReelByIndex]);

  const handleShare = () => {
    const url = window.location.href;
    const name = partner?.bussinessName || "Restaurant Storefront";
    if (navigator.share) {
      navigator.share({ title: name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const availCount = foods.filter(f => f.isAvailable).length;

  return (
    <div className="fpp-page partner-app-container">

      {/* ══════════ 1. STICKY HEADER ══════════ */}
      <header className="fpp-header">
        <button className="icon-btn-partner" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="fpp-header__identity">
          <div className="fpp-header__avatar">
            {partner?.logo ? (
              <img src={partner.logo} alt={partner.bussinessName} className="fpp-header__avatar-img" />
            ) : (
              (partner?.bussinessName || "R").charAt(0).toUpperCase()
            )}
          </div>
          <div className="fpp-header__text">
            <span className="fpp-header__name">
              {partner?.bussinessName || (loading ? "Loading…" : "Restaurant")}
            </span>
            {partner?.fullName && (
              <span className="fpp-header__sub">by {partner.fullName}</span>
            )}
            {partner?.address && (
              <span className="fpp-header__sub fpp-header__location">📍 {partner.address}</span>
            )}
          </div>
        </div>

        <button className="icon-btn-partner" onClick={handleShare} aria-label="Share Storefront">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </header>

      {/* ══════════ BODY CONTENT ══════════ */}
      {loading && <PageSkeleton />}

      {!loading && error && (
        <div className="fpp-error-state">
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ color: "var(--partner-text)", fontWeight: 700 }}>{error}</p>
          <button className="btn-partner-secondary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && partner && (
        <main className="fpp-main">


          {/* ══════════ 3. HERO FEATURED REEL ══════════ */}
          <section className="fpp-hero" ref={heroRef}>
            {activeReel ? (
              <FeaturedPlayer
                key={activeReel._id}
                reel={activeReel}
                partnerName={partner.bussinessName || partner.fullName}
                onNextReel={() => selectReelByIndex(activeReelIndex + 1)}
                onPrevReel={() => selectReelByIndex(activeReelIndex - 1)}
                hasNext={activeReelIndex < foods.length - 1}
                hasPrev={activeReelIndex > 0}
              />
            ) : (
              <div className="fpp-placeholder">
                <div className="fpp-placeholder__ring">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="42" height="42">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <p className="fpp-placeholder__text">No reels uploaded yet.</p>
                <p className="fpp-placeholder__sub">Check back soon for new food videos!</p>
              </div>
            )}
          </section>

          {/* ══════════ 4. REEL GRID ══════════ */}
          <section className="fpp-grid-section">
            <div className="fpp-section-head">
              <h2 className="fpp-section-title">All Reels</h2>
              <span className="fpp-section-pill">{foods.length}</span>
            </div>

            {foods.length === 0 ? (
              <div className="fpp-empty">
                <span className="fpp-empty__icon">🎬</span>
                <p className="fpp-empty__text">No reels uploaded yet.</p>
                <p className="fpp-empty__sub">Check back soon for updates!</p>
              </div>
            ) : (
              <div className="fpp-grid">
                {foods.map(food => (
                  <ReelThumb
                    key={food._id}
                    food={food}
                    isActive={activeReel?._id === food._id}
                    onClick={() => selectReel(food)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ══════════ 5. ABOUT ══════════ */}
          {(partner.phoneNumber || partner.address || partner.email) && (
            <section className="fpp-about">
              <div className="fpp-section-head">
                <h2 className="fpp-section-title">About Storefront</h2>
              </div>
              <div className="fpp-about__card partner-card">
                {partner.bussinessName && (
                  <div className="fpp-about__row">
                    <span className="fpp-about__icon">🏬</span>
                    <div className="fpp-about__col">
                      <strong className="fpp-about__label">Restaurant &nbsp; &nbsp;</strong>
                      <span className="fpp-about__text">{partner.bussinessName}</span>
                    </div>
                  </div>
                )}
                {partner.address && (
                  <div className="fpp-about__row">
                    <span className="fpp-about__icon">📍</span>
                    <div className="fpp-about__col">
                      <strong className="fpp-about__label">Address &nbsp; &nbsp;</strong>
                      <span className="fpp-about__text">{partner.address}</span>
                    </div>
                  </div>
                )}
                {partner.phoneNumber && (
                  <div className="fpp-about__row">
                    <span className="fpp-about__icon">📞</span>
                    <div className="fpp-about__col">
                      <strong className="fpp-about__label">Phone &nbsp; &nbsp;</strong>
                      <span className="fpp-about__text">{partner.phoneNumber}</span>
                    </div>
                  </div>
                )}
                {partner.email && (
                  <div className="fpp-about__row">
                    <span className="fpp-about__icon">✉️</span>
                    <div className="fpp-about__col">
                      <strong className="fpp-about__label">Email &nbsp; &nbsp;</strong>
                      <span className="fpp-about__text">{partner.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        </main>
      )}

      <BottomNav />
    </div>
  );
}