import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { PartnerLayout, Toast } from "../../components/Partner/PartnerComponents";
import "../../styles/partner-design-system.css";

/* TODO: Backend food.model.js persistence requires multipart form upload with field 'video'. Category, isVeg, prepTime, ingredients can be added to backend model. */

export default function PartnerAddFood() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditMode = Boolean(id || location.state?.food);
  const existingFood = location.state?.food;

  const [name, setName] = useState(existingFood?.name || "");
  const [description, setDescription] = useState(existingFood?.description || "");
  const [price, setPrice] = useState(existingFood?.price || "");
  const [category, setCategory] = useState(existingFood?.category || "Main Course");
  const [prepTime, setPrepTime] = useState(existingFood?.prepTime || 15);
  const [isVeg, setIsVeg] = useState(existingFood?.isVeg !== undefined ? existingFood.isVeg : true);
  const [isAvailable, setIsAvailable] = useState(existingFood?.isAvailable !== false);
  const [ingredients, setIngredients] = useState(existingFood?.ingredients || "");

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(existingFood?.thumbnail || existingFood?.video || "");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (existingFood) {
      setName(existingFood.name || "");
      setDescription(existingFood.description || "");
      setPrice(existingFood.price || "");
      setCategory(existingFood.category || "Main Course");
      setPrepTime(existingFood.prepTime || 15);
      setIsVeg(existingFood.isVeg !== undefined ? existingFood.isVeg : true);
      setIsAvailable(existingFood.isAvailable !== false);
      setIngredients(existingFood.ingredients || "");
      setMediaPreview(existingFood.thumbnail || existingFood.video || "");
    }
  }, [existingFood]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ message: "Food name is required", type: "error" });
      return;
    }
    if (!description.trim()) {
      setToast({ message: "Description is required", type: "error" });
      return;
    }
    if (!price || Number(price) <= 0) {
      setToast({ message: "Please enter a valid price (> 0)", type: "error" });
      return;
    }
    if (!isEditMode && !mediaFile) {
      setToast({ message: "Please upload a food video or image file", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("prepTime", prepTime);
      formData.append("isVeg", isVeg);
      formData.append("isAvailable", isAvailable);
      formData.append("ingredients", ingredients);

      if (mediaFile) {
        formData.append("video", mediaFile);
      }

      await api.post("/api/v1/food", formData);

      setToast({
        message: isEditMode
          ? "Food item updated successfully!"
          : isDraft
          ? "Draft saved successfully!"
          : "Food item published successfully!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/foodpartner/menu");
      }, 1200);
    } catch (err) {
      console.error("Error saving food item:", err);
      setToast({
        message: err.response?.data?.message || "Failed to save food item",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PartnerLayout
      title={isEditMode ? "Edit Dish" : "Add New Dish"}
      subtitle={isEditMode ? "Update dish details" : "Create a new offering for your restaurant"}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form onSubmit={(e) => handleSubmit(e, false)} style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="partner-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Media Upload & Preview */}
          <div className="partner-input-group">
            <label className="partner-input-label">Food Video / Image Upload *</label>
            <div
              style={{
                border: "2px dashed var(--partner-border)",
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                background: "rgba(255,255,255,0.02)",
                position: "relative",
                cursor: "pointer",
              }}
            >
              {mediaPreview ? (
                <div style={{ position: "relative", width: "100%", maxHeight: 220, overflow: "hidden", borderRadius: 12 }}>
                  {mediaFile?.type?.includes("video") || mediaPreview.includes(".mp4") ? (
                    <video src={mediaPreview} controls style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />
                  ) : (
                    <img src={mediaPreview} alt="Preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview("");
                    }}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 20,
                      padding: "6px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 36 }}>🎥</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--partner-primary)" }}>
                    Upload Food Short Video / Photo
                  </span>
                  <span style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>
                    Supported formats: MP4, MOV, JPG, PNG (Max 50MB)
                  </span>
                  <input type="file" accept="video/*,image/*" onChange={handleMediaChange} style={{ display: "none" }} />
                </label>
              )}
            </div>
          </div>

          {/* Dish Name */}
          <div className="partner-input-group">
            <label className="partner-input-label">Dish Name *</label>
            <input
              type="text"
              className="partner-input"
              placeholder="e.g. Paneer Butter Masala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="partner-input-group">
            <label className="partner-input-label">Description *</label>
            <textarea
              className="partner-textarea"
              placeholder="Describe ingredients, taste profile, or special preparation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Category & Price Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="partner-input-group">
              <label className="partner-input-label">Category</label>
              <select className="partner-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="partner-input-group">
              <label className="partner-input-label">Price (₹) *</label>
              <input
                type="number"
                min="1"
                className="partner-input"
                placeholder="250"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Prep Time & Diet Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="partner-input-group">
              <label className="partner-input-label">Prep Time (Mins)</label>
              <input
                type="number"
                min="5"
                className="partner-input"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>

            <div className="partner-input-group">
              <label className="partner-input-label">Dietary Preference</label>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className={isVeg ? "badge-veg" : "btn-partner-secondary"}
                  style={{ flex: 1, minHeight: 44, justifyContent: "center" }}
                  onClick={() => setIsVeg(true)}
                >
                  🟢 Veg
                </button>
                <button
                  type="button"
                  className={!isVeg ? "badge-nonveg" : "btn-partner-secondary"}
                  style={{ flex: 1, minHeight: 44, justifyContent: "center" }}
                  onClick={() => setIsVeg(false)}
                >
                  🔴 Non-Veg
                </button>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Immediate Availability</div>
              <div style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>Mark item ready for customer ordering</div>
            </div>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: 22, height: 22, accentColor: "var(--partner-primary)", cursor: "pointer" }}
            />
          </div>

          {/* Ingredients Tag / Field */}
          <div className="partner-input-group">
            <label className="partner-input-label">Key Ingredients (Optional)</label>
            <input
              type="text"
              className="partner-input"
              placeholder="e.g. Cottage cheese, Tomato gravy, Butter, Cashews"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          {/* Submit Action Buttons */}
          <div style={{ display: "flex", gap: 12, paddingTop: 12 }}>
            <button
              type="button"
              className="btn-partner-secondary"
              style={{ flex: 1 }}
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="btn-partner-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? "Publishing..." : isEditMode ? "Save Changes" : "Publish Dish"}
            </button>
          </div>
        </div>
      </form>
    </PartnerLayout>
  );
}
