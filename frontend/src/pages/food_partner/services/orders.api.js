import api from "../../../utils/api";

export const ordersAPI = {

  getOrders: async () => {
    const response = await api.get("/api/v1/order/foodpartner");
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/api/v1/order/foodpartner/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, updationStatus) => {
    const response = await api.patch(
      `/api/v1/order/foodpartner/${orderId}`,
      { updationStatus }
    );
    return response.data;
  },
};

