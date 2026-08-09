import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../utils/api";
import { PartnerBottomNav } from "../../components/Partner/PartnerComponents";
import "../../styles/createFood.css";

const API = "/api/v1/food";

export default function CreateFood() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();

  const existingFood = location.state?.food || null;
  const isEditMode   = Boolean(existingFood || id);

  /* ── Form state ─────────────────────────────── */
  const [name,        setName]        = useState(existingFood?.name        || "");
  const [description, setDescription] = useState(existingFood?.description || "");
  const [price,       setPrice]       = useState(existingFood?.price       || "");
  const [prepTime,    setPrepTime]    = useState(existingFood?.prepTime    || "");
  const [isVeg,       setIsVeg]       = useState(existingFood?.isVeg !== undefined ? existingFood.isVeg : true);
  const [isAvailable, setIsAvailable] = useState(existingFood?.isAvailable !== false);

  /* ── Media state ─────────────────────────────── */
  const [videoFile,     setVideoFile]     = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [videoPreview,     setVideoPreview]     = useState(existingFood?.video     || "");
  const [thumbnailPreview, setThumbnailPreview] = useState(existingFood?.thumbnail || "");

  const videoInputRef     = useRef(null);
  const thumbnailInputRef = useRef(null);

  /* ── Feedback ────────────────────────────────── */
  const [status,  setStatus]  = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingFood) {
      setName(existingFood.name        || "");
      setDescription(existingFood.description || "");
      setPrice(existingFood.price       || "");
      setPrepTime(existingFood.prepTime    || "");
      setIsVeg(existingFood.isVeg !== undefined ? existingFood.isVeg : true);
      setIsAvailable(existingFood.isAvailable !== false);
      setVideoPreview(existingFood.video     || "");
      setThumbnailPreview(existingFood.thumbnail || "");
    }
  }, [existingFood]);

  /* ── Handlers ────────────────────────────────── */
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!name.trim())                        { setError("Food name is required.");             return; }
    if (!description.trim())                 { setError("Description is required.");           return; }
    if (!price || Number(price) <= 0)        { setError("Enter a valid price (> 0).");         return; }
    if (!isEditMode && !videoFile)           { setError("Please select a video file.");        return; }
    if (!isEditMode && !thumbnailFile)       { setError("Please select a thumbnail image.");   return; }

    const formData = new FormData();
    formData.append("name",        name);
    formData.append("description", description);
    formData.append("price",       price);
    formData.append("isVeg",       isVeg);
    formData.append("isAvailable", isAvailable);
    if (prepTime) formData.append("prepTime", prepTime);
    if (videoFile)     formData.append("video",     videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    try {
      setLoading(true);

      if (isEditMode) {
        const foodId = existingFood?._id || id;
        await api.patch(`${API}/${foodId}`, formData);
        setStatus("Dish updated successfully!");
      } else {
        await api.post(API, formData);
        setStatus("Dish published successfully!");
      }

      setTimeout(() => navigate("/foodpartner/menu"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save dish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="cf-page">

      {/* Header */}
      <header className="cf-header">
        <button className="cf-back-btn" type="button" onClick={() => navigate("/foodpartner/menu")}>
          ← Back
        </button>
          <h1 className="cf-header-title">{isEditMode ? "Edit Dish" : "Add New Dish"}</h1>
      </header>

      <main className="cf-main">
        <form className="cf-form" onSubmit={handleSubmit}>

          {/* ── Media Uploads ── */}
          <div className="cf-card">
            <p className="cf-section-label">Media Files</p>

            <div className="cf-media-row">
              {/* Video */}
              <div className="cf-media-block">
                <span className="cf-media-label">Food Video {!isEditMode && <span className="cf-required">*</span>}</span>

                {videoPreview ? (
                  <div className="cf-preview-wrap">
                    <video src={videoPreview} controls className="cf-preview-media" />
                    <button type="button" className="cf-change-btn"
                      onClick={() => { setVideoFile(null); setVideoPreview(""); }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="cf-dropzone" onClick={() => videoInputRef.current?.click()}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && videoInputRef.current?.click()}>
                    <span className="cf-drop-icon">🎬</span>
                    <span className="cf-drop-title">Upload Video</span>
                    <span className="cf-drop-sub">MP4, MOV</span>
                  </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/*"
                  style={{ display: "none" }} onChange={handleVideoChange} />
              </div>

              {/* Thumbnail */}
              <div className="cf-media-block">
                <span className="cf-media-label">Thumbnail Image {!isEditMode && <span className="cf-required">*</span>}</span>

                {thumbnailPreview ? (
                  <div className="cf-preview-wrap">
                    <img src={thumbnailPreview} alt="Thumbnail" className="cf-preview-media cf-thumb-preview" />
                    <button type="button" className="cf-change-btn"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(""); }}>
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="cf-dropzone" onClick={() => thumbnailInputRef.current?.click()}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && thumbnailInputRef.current?.click()}>
                    <span className="cf-drop-icon">🖼️</span>
                    <span className="cf-drop-title">Upload Thumbnail</span>
                    <span className="cf-drop-sub">JPG, PNG, WebP</span>
                  </div>
                )}
                <input ref={thumbnailInputRef} type="file" accept="image/*"
                  style={{ display: "none" }} onChange={handleThumbnailChange} />
              </div>
            </div>
          </div>

          {/* ── Dish Details ── */}
          <div className="cf-card">
            <p className="cf-section-label">Dish Details</p>

            <div className="cf-field">
              <label className="cf-label">Dish Name <span className="cf-required">*</span></label>
              <input type="text" className="cf-input"
                placeholder="e.g. Paneer Butter Masala"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="cf-field">
              <label className="cf-label">Description <span className="cf-required">*</span></label>
              <textarea className="cf-textarea"
                placeholder="Describe the taste and what makes it special..."
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} required />
            </div>

            <div className="cf-row">
              <div className="cf-field">
                <label className="cf-label">Price (₹) <span className="cf-required">*</span></label>
                <input type="number" min="1" className="cf-input"
                  placeholder="250" value={price}
                  onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="cf-field">
                <label className="cf-label">Prep Time (mins)</label>
                <input type="number" min="10" className="cf-input"
                  placeholder="15" value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Preferences ── */}
          <div className="cf-card">
            <p className="cf-section-label">Preferences</p>

            <div className="cf-field">
              <label className="cf-label">Dietary Type</label>
              <div className="cf-toggle-row">
                <button type="button"
                  className={`cf-diet-btn ${isVeg ? "cf-diet-active-veg" : ""}`}
                  onClick={() => setIsVeg(true)}>
                  🟢 Vegetarian
                </button>
                <button type="button"
                  className={`cf-diet-btn ${!isVeg ? "cf-diet-active-nonveg" : ""}`}
                  onClick={() => setIsVeg(false)}>
                  🔴 Non-Vegetarian
                </button>
              </div>
            </div>

            <div className="cf-availability-row">
              <div>
                <div className="cf-avail-title">Available for Ordering</div>
                <div className="cf-avail-sub">Customers can order this dish immediately</div>
              </div>
              <input type="checkbox" className="cf-checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)} />
            </div>
          </div>

          {/* ── Feedback ── */}
          {error  && <div className="cf-msg cf-msg-error">⚠️ {error}</div>}
          {status && <div className="cf-msg cf-msg-success">✅ {status}</div>}

          {/* ── Submit ── */}
          <button type="submit" className="cf-submit-btn" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Publish Dish"}
          </button>

        </form>
      </main>

      <PartnerBottomNav />
    </div>
  );
}