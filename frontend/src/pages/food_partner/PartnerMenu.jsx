import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  PartnerLayout,
  FoodCard,
  EmptyState,
  SkeletonCard,
  ConfirmationDialog,
  Toast,
} from "../../components/Partner/PartnerComponents";
import "../../styles/partner-design-system.css";


export default function PartnerMenu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, foodId: null });

  const navigate = useNavigate();
  const { account } = useAuth();

  const fetchFoods = async () => {
    if (!account?._id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/v1/food-partner/${account._id}`,
        { withCredentials: true }
      );
      if (response.data?.foodPartner?.foodItems) {
        setFoods(response.data.foodPartner.foodItems);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setToast({ message: "Failed to load menu items", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [account]);

  // Search and sort logic
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [foods, searchQuery, sortBy]);

  const handleToggleAvailability = (foodId) => {
    setFoods((prev) =>
      prev.map((f) => (f._id === foodId ? { ...f, isAvailable: !f.isAvailable } : f))
    );
    setToast({ message: "Food availability updated", type: "success" });
  };

  const handleEdit = (food) => {
    navigate(`/foodpartner/edit-food/${food._id}`, { state: { food } });
  };

  const handleDuplicate = (food) => {
    const duplicated = {
      ...food,
      _id: `temp-${Date.now()}`,
      name: `${food.name} (Copy)`,
    };
    setFoods((prev) => [duplicated, ...prev]);
    setToast({ message: "Food item duplicated as draft", type: "success" });
  };

  const confirmDelete = async () => {
    const foodId = deleteModal.foodId;
    setDeleteModal({ isOpen: false, foodId: null });
    try {
      await axios.delete(`http://localhost:3000/api/v1/food/${foodId}`, { withCredentials: true });
      setFoods((prev) => prev.filter((f) => f._id !== foodId));
      setToast({ message: "Food item deleted from menu", type: "success" });
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ message: err.response?.data?.message || "Failed to delete food item", type: "error" });
    }
  };

  return (
    <PartnerLayout title="Menu Management" subtitle="Manage your restaurant offerings">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Floating Action Button */}
      <button className="partner-fab" onClick={() => navigate("/foodpartner/add-food")}>
        <span>➕</span>
        <span>Add Food</span>
      </button>

      {/* Top Search & Filter Bar */}
      <div className="search-section" style={{ borderRadius: 16, marginBottom: 16, border: "1px solid var(--partner-border)" }}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search food name, ingredients, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Controls Section: Sort dropdown, Grid/List toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <select
            className="partner-select"
            style={{ minHeight: 40, fontSize: 13, flex: 1 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>


        </div>
      </div>

      {/* Main Dishes Container */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))"}}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <EmptyState
          title="No Foods Yet"
          message={searchQuery ? "No dishes match your search." : "Start by adding your first dish to your restaurant menu."}
          icon="🍲"
          actionLabel="+ Add First Dish"
          onAction={() => navigate("/foodpartner/add-food")}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))"}}>
          {filteredFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={(id) => setDeleteModal({ isOpen: true, foodId: id })}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, foodId: null })}
        onConfirm={confirmDelete}
        title="Delete Food Item"
        message="Are you sure you want to remove this dish from your menu? Customers will no longer be able to order it."
        confirmText="Delete Dish"
        isDanger={true}
      />
    </PartnerLayout>
  );
}
