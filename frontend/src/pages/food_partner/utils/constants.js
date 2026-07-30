export const ORDER_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const DELIVERY_TYPE = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
};

export const PAYMENT_METHOD = {
  COD: "COD",
  ONLINE: "ONLINE",
};

export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: { bg: "#D4A574", text: "Pending" },
  [ORDER_STATUS.ACCEPTED]: { bg: "#6BA3E5", text: "Accepted" },
  [ORDER_STATUS.PREPARING]: { bg: "#B088D9", text: "Preparing" },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: { bg: "#FFA500", text: "Out for Delivery" },
  [ORDER_STATUS.DELIVERED]: { bg: "#6B7280", text: "Completed" },
  [ORDER_STATUS.CANCELLED]: { bg: "#EF4444", text: "Cancelled" },
};

export const formatTimeAgo = (date) => {
  const now = new Date();
  const orderDate = new Date(date);
  const diffMs = now - orderDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const formatItemsPreview = (items, maxDisplay = 1) => {
  if (!items || items.length === 0) return "No items";

  const displayed = items.slice(0, maxDisplay);
  const remaining = items.length - displayed.length;

  let preview = displayed
    .map((item) => {
      const foodName = item.food?.name || "Unknown item";
      return `${foodName} ×${item.quantity}`;
    })
    .join(", ");

  if (remaining > 0) {
    preview += ` + ${remaining} more`;
  }

  return preview;
};

export const getNextStatus = (currentStatus) => {
  const transitions = {
    [ORDER_STATUS.PENDING]: ORDER_STATUS.ACCEPTED,
    [ORDER_STATUS.ACCEPTED]: ORDER_STATUS.PREPARING,
    [ORDER_STATUS.PREPARING]: ORDER_STATUS.OUT_FOR_DELIVERY,
    [ORDER_STATUS.OUT_FOR_DELIVERY]: ORDER_STATUS.DELIVERED,
  };
  return transitions[currentStatus] || null;
};

export const canUpdateOrder = (currentStatus) => {
  const finalStatuses = [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED];
  return !finalStatuses.includes(currentStatus);
};

export const isHighPriority = (createdAt) => {
  const now = new Date();
  const orderDate = new Date(createdAt);
  const diffMins = Math.floor((now - orderDate) / 60000);
  return diffMins >= 10;
};