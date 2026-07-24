import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/cart", {
        withCredentials: true,
      });
      setCart(res.data.cart || { items: [], totalPrice: 0 });
    } catch {
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (foodId, quantity = 1) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/cart/add",
        { food: foodId, quantity },
        { withCredentials: true }
      );
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add to cart" };
    }
  }, []);

  const removeFromCart = useCallback(async (foodId) => {
    try {
      const res = await axios.delete("http://localhost:3000/api/v1/cart/remove", {
        data: { food: foodId },
        withCredentials: true,
      });
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to remove from cart" };
    }
  }, []);

  const updateQuantity = useCallback(async (foodId, operation) => {
    try {
      const res = await axios.patch(
        "http://localhost:3000/api/v1/cart/update",
        { food: foodId, operation },
        { withCredentials: true }
      );
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update cart" };
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete("http://localhost:3000/api/v1/cart/clear", {
        withCredentials: true,
      });
      setCart({ items: [], totalPrice: 0 });
    } catch {}
  }, []);

  const isInCart = useCallback(
    (foodId) => cart.items?.some((item) => item.food?._id === foodId || item.food === foodId),
    [cart.items]
  );

  const cartCount = useMemo(() => cart.items?.length || 0, [cart.items]);

  const value = useMemo(
    () => ({ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, cartCount, fetchCart }),
    [cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, cartCount, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export { CartProvider, useCart };
