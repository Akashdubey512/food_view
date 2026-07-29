import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const EMPTY_CART = { items: [], totalPrice: 0 };

function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const { account, loading: authLoading } = useAuth();

  const resetCart = useCallback(() => {
    setCart(EMPTY_CART);
    setLoading(false);
  }, []);

  const fetchCart = useCallback(async () => {
    if (authLoading || !account || account.role !== "user") {
      resetCart();
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:3000/api/v1/cart", {
        withCredentials: true,
      });

      if (currentRequestId === requestIdRef.current) {
        setCart(res.data.cart || EMPTY_CART);
      }
    } catch {
      if (currentRequestId === requestIdRef.current) {
        setCart(EMPTY_CART);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [account, authLoading, resetCart]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!account || account.role !== "user") {
      resetCart();
      return;
    }

    fetchCart();
  }, [account, authLoading, fetchCart, resetCart]);

  const addToCart = useCallback(async (foodId, quantity = 1) => {
    if (!account || account.role !== "user") {
      return { success: false, message: "Cart is only available for user accounts" };
    }

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
  }, [account]);

  const removeFromCart = useCallback(async (foodId) => {
    if (!account || account.role !== "user") {
      return { success: false, message: "Cart is only available for user accounts" };
    }

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
  }, [account]);

  const updateQuantity = useCallback(async (foodId, operation) => {
    if (!account || account.role !== "user") {
      return { success: false, message: "Cart is only available for user accounts" };
    }

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
  }, [account]);

  const clearCart = useCallback(async () => {
    if (!account || account.role !== "user") {
      return;
    }

    try {
      await axios.delete("http://localhost:3000/api/v1/cart/clear", {
        withCredentials: true,
      });
      setCart(EMPTY_CART);
    } catch {}
  }, [account]);

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
