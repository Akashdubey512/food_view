import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/order";

export const ordersAPI = {
  /**
   * Fetch all orders for food partner
   */
  getOrders: async () => {
    const response = await axios.get(`${API_URL}/foodpartner`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    const response = await axios.get(
      `${API_URL}/foodpartner/${orderId}`,
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, updationStatus) => {
    const response = await axios.patch(
      `${API_URL}/foodpartner/${orderId}`,
      { updationStatus },
      { withCredentials: true }
    );
    return response.data;
  },
};
