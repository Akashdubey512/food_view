import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "./services/orders.api";
import {
  ORDER_STATUS,
  DELIVERY_TYPE,
  STATUS_COLORS,
  formatTimeAgo,
  formatCurrency,
  getNextStatus,
  canUpdateOrder,
  isHighPriority,
} from "./utils/constants";
import "./PartnerOrders.css";

const getCustomerName = (order) => {
  return (
    order.customerName ||
    order.user?.fullName ||
    order.deliveryAddress?.split(",")?.[0]?.trim() ||
    "Customer"
  );
};

const getOrderCode = (orderId) => `#${String(orderId).slice(-8).toUpperCase()}`;

const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getFoodSummary = (items = []) => {
  if (!items.length) return "No items";
  const firstItem = items[0];
  const firstName = toTitleCase(firstItem.food?.name || "Item");
  const firstQty = firstItem.quantity || 1;
  const remaining = items.length - 1;

  if (remaining <= 0) return `${firstName} ×${firstQty}`;
  return `${firstName} ×${firstQty} + ${remaining} more`;
};

const getTotalItemCount = (items = []) => {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

const getDeliveryLabel = (order) => {
  const isDelivery = order.deliveryType === DELIVERY_TYPE.DELIVERY;
  const eta = order.eta || order.estimatedTime;

  if (isDelivery) {
    if (eta) return `🚚 Delivery • ETA ${eta}`;
    return "🚚 Delivery • On the way";
  }

  if (order.orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY) {
    return "🚚 Out for Delivery";
  }

  if (order.orderStatus === ORDER_STATUS.READY) {
    return "🛍 Pickup • Ready";
  }

  if (eta) {
    return `🛍 Pickup • Ready in ${eta}`;
  }

  return "🛍 Pickup";
};

const getPaymentLabel = (order) => {
  if (order.paymentMethod === "COD") return "💵 COD";
  if (order.paymentMethod === "ONLINE") return "💳 ONLINE";
  return "✓ PAID";
};

const getItemTotal = (item) => {
  const price = item?.food?.price || 0;
  const qty = item?.quantity || 0;
  return price * qty;
};

const StatusBadge = ({ status }) => {
  const statusConfig =
    STATUS_COLORS[status] || STATUS_COLORS[ORDER_STATUS.PENDING];
  return (
    <span
      className="status-badge-compact"
      style={{ backgroundColor: statusConfig.bg }}
      title={statusConfig.text}
    >
      {statusConfig.text}
    </span>
  );
};

const PaymentBadge = ({ order }) => (
  <span className="payment-badge-compact" title="Payment method">
    {getPaymentLabel(order)}
  </span>
);

const NavIcon = ({ type, active }) => {
  const stroke = active ? "#22C55E" : "#A7F3D0";

  switch (type) {
    case "orders":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={stroke} />
          <path d="M7 8h10" stroke={stroke} />
          <path d="M7 12h6" stroke={stroke} />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <path d="M5 6h14" stroke={stroke} />
          <path d="M5 12h14" stroke={stroke} />
          <path d="M5 18h14" stroke={stroke} />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <path d="M4 19V9" stroke={stroke} />
          <path d="M12 19V5" stroke={stroke} />
          <path d="M20 19v-7" stroke={stroke} />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke={stroke} />
          <path d="M5 19a7 7 0 0 1 14 0" stroke={stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
          <path d="M4 13.5 12 4l8 9.5" stroke={stroke} />
          <path d="M7 11.5v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7" stroke={stroke} />
        </svg>
      );
  }
};

const PriorityBadge = () => (
  <span className="priority-badge-inline" title="Order is high priority">
    ⚡ High Priority
  </span>
);

const ActionButtons = ({ order, actionLoading, onUpdateStatus }) => {
  const isLoading = actionLoading === order._id;

  if (order.orderStatus === ORDER_STATUS.PENDING) {
    return (
      <div className="card-buttons">
        <button
          type="button"
          className="btn btn-reject"
          disabled
          title="Reject action not connected yet"
        >
          Reject
        </button>
        <button
          type="button"
          className="btn btn-accept"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(order._id);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Accepting..." : "Accept"}
        </button>
      </div>
    );
  }

  if (order.orderStatus === ORDER_STATUS.ACCEPTED) {
    return (
      <div className="card-buttons">
        <button
          type="button"
          className="btn btn-action btn-full"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(order._id);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Start Preparing"}
        </button>
      </div>
    );
  }

  if (order.orderStatus === ORDER_STATUS.PREPARING) {
    return (
      <div className="card-buttons">
        <button
          type="button"
          className="btn btn-action btn-full"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(order._id);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Out for Delivery"}
        </button>
      </div>
    );
  }

  if (order.orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY) {
    return (
      <div className="card-buttons">
        <button
          type="button"
          className="btn btn-action btn-full"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(order._id);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Deliver Order"}
        </button>
      </div>
    );
  }

  if (order.orderStatus === ORDER_STATUS.DELIVERED) {
    return <div className="completed-badge-full">✓ Completed</div>;
  }

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    return <div className="cancelled-badge-full">✕ Cancelled</div>;
  }

  return null;
};

const OrderCardSkeleton = () => (
  <div className="order-card skeleton-card" aria-hidden="true">
    <div className="card-top">
      <div className="food-thumbnail skeleton-box"></div>
      <div className="customer-section-wrapper">
        <div className="skeleton-line skeleton-line-lg"></div>
        <div className="skeleton-line skeleton-line-sm"></div>
        <div className="skeleton-line skeleton-line-xs"></div>
      </div>
      <div className="skeleton-arrow skeleton-box"></div>
    </div>
    <div className="skeleton-line skeleton-line-md"></div>
    <div className="skeleton-line skeleton-line-md"></div>
    <div className="info-footer">
      <div className="skeleton-line skeleton-line-sm"></div>
      <div className="skeleton-line skeleton-line-price"></div>
    </div>
    <div className="card-buttons">
      <div className="skeleton-btn skeleton-box"></div>
      <div className="skeleton-btn skeleton-box"></div>
    </div>
  </div>
);

const OrderCard = ({
  order,
  isExpanded,
  onToggle,
  actionLoading,
  onUpdateStatus,
}) => {
  const highPriority = isHighPriority(order.createdAt);
  const firstFoodImage = order.items?.[0]?.food?.thumbnail;
  const subtotal = order.totalAmount || 0;
  const deliveryCharge = order.deliveryCharge || 0;
  const platformFee = order.platformFee || 0;
  const total = subtotal + deliveryCharge + platformFee;
  const customerPhone = order.customerPhone || order.user?.phone;
  const itemCount = getTotalItemCount(order.items);

  const handleCardClick = () => {
    onToggle(order._id);
  };

  return (
    <article
      className={`order-card ${isExpanded ? "expanded" : ""}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Order ${getOrderCode(order._id)}, ${getCustomerName(order)}`}
    >
      {/* Card Top Section - Image + Info */}
      <div className="card-top">
        <div className="food-thumbnail">
          {firstFoodImage ? (
            <img
              src={firstFoodImage}
              alt={order.items?.[0]?.food?.name || "Food"}
              loading="lazy"
            />
          ) : (
            <div className="food-placeholder">🍽️</div>
          )}
        </div>

        <div className="customer-section-wrapper">
          <div className="customer-header">
            <h3 className="customer-name">{getCustomerName(order)}</h3>
            <div className="expand-icon-container">
              <span className={`expand-icon ${isExpanded ? "open" : ""}`}>⌄</span>
            </div>
          </div>

          <div className="badges-row">
            <StatusBadge status={order.orderStatus} />
          </div>

          <div className="order-meta-row">
            <span className="order-id">{getOrderCode(order._id)}</span>
            <span className="meta-separator">•</span>
            <span className="order-time">{formatTimeAgo(order.createdAt)}</span>
          </div>

          <PaymentBadge order={order} />
        </div>
      </div>

      {/* Items Count + Summary */}
      <div className="items-summary-section">
        <div className="items-count">{itemCount} Items</div>
        <div className="food-summary-compact" title={getFoodSummary(order.items)}>
          {getFoodSummary(order.items)}
        </div>
      </div>

      {/* Delivery Info + Price */}
      <div className="info-footer">
        <div className="delivery-info-compact">{getDeliveryLabel(order)}</div>
        <div className="price-prominent">{formatCurrency(total)}</div>
      </div>

      {/* Expanded Details */}
      <div className={`expanded-shell ${isExpanded ? "open" : ""}`}>
        <div className="expanded-inner">
          <div className="expanded-details">
            {/* Items Breakdown */}
            <div className="items-breakdown">
              <div className="items-list-header">Items</div>
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="item-line-expanded">
                  <span className="item-name-expanded">
                    {toTitleCase(item.food?.name || "Item")} ×{item.quantity}
                  </span>
                  <span className="item-price-expanded">
                    {formatCurrency(getItemTotal(item))}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider"></div>

            {/* Totals Section */}
            <div className="totals-section">
              <div className="total-line">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="total-line">
                  <span>Delivery Charge</span>
                  <span>{formatCurrency(deliveryCharge)}</span>
                </div>
              )}
              {platformFee > 0 && (
                <div className="total-line">
                  <span>Platform Fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
              )}
              <div className="total-line total-final">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="divider"></div>

            {/* Customer Details */}
            <div className="order-details-meta">
              {order.deliveryAddress && (
                <div className="meta-item-detail">
                  <span className="meta-label-detail">📍 Address</span>
                  <span className="meta-value-detail">{order.deliveryAddress}</span>
                </div>
              )}

              <div className="meta-item-detail">
                <span className="meta-label-detail">💳 Payment Method</span>
                <span className="meta-value-detail">{order.paymentMethod}</span>
              </div>

              {(order.specialInstructions ||
                order.instructions ||
                order.notes) && (
                <div className="meta-item-detail">
                  <span className="meta-label-detail">📝 Notes</span>
                  <span className="meta-value-detail">
                    {order.specialInstructions ||
                      order.instructions ||
                      order.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        order={order}
        actionLoading={actionLoading}
        onUpdateStatus={onUpdateStatus}
      />
    </article>
  );
};

const PartnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getOrders();
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (orderId) => {
    try {
      setActionLoading(orderId);
      const order = orders.find((o) => o._id === orderId);
      const nextStatus = getNextStatus(order.orderStatus);

      if (!nextStatus || !canUpdateOrder(order.orderStatus)) {
        return;
      }

      await ordersAPI.updateOrderStatus(orderId, nextStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: nextStatus } : o
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error updating order:", err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          order.orderStatus.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const customerName = getCustomerName(order).toLowerCase();
        const orderId = String(order._id).toLowerCase();
        const foodMatch = (order.items || []).some((item) =>
          item.food?.name?.toLowerCase().includes(query)
        );

        return (
          customerName.includes(query) ||
          orderId.includes(query) ||
          foodMatch
        );
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.totalAmount - a.totalAmount;
      if (sortBy === "lowest") return a.totalAmount - b.totalAmount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [orders, activeFilter, searchQuery, sortBy]);

  const stats = useMemo(
    () => ({
      pending: orders.filter((o) => o.orderStatus === ORDER_STATUS.PENDING)
        .length,
      accepted: orders.filter((o) => o.orderStatus === ORDER_STATUS.ACCEPTED)
        .length,
      preparing: orders.filter((o) => o.orderStatus === ORDER_STATUS.PREPARING)
        .length,
      outForDelivery: orders.filter((o) => o.orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY)
        .length,
      completed: orders.filter((o) => o.orderStatus === ORDER_STATUS.DELIVERED)
        .length,
      cancelled: orders.filter((o) => o.orderStatus === ORDER_STATUS.CANCELLED)
        .length,
    }),
    [orders]
  );

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Preparing", value: "preparing" },
    { label: "Out for Delivery", value: "out for delivery" },
    { label: "Completed", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const statFilters = [
    { label: "Pending", value: "pending", count: stats.pending },
    { label: "Accepted", value: "accepted", count: stats.accepted },
    { label: "Preparing", value: "preparing", count: stats.preparing },
    { label: "Out for Delivery", value: "out for delivery", count: stats.outForDelivery },
    { label: "Completed", value: "delivered", count: stats.completed },
  ];

  const navItems = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Orders", key: "orders" },
    { label: "Menu", key: "menu" },
    { label: "Analytics", key: "analytics" },
    { label: "Profile", key: "profile" },
  ];

  return (
    <div className="partner-dashboard">
      <header className="dashboard-header">
        <div className="header-top">
          <h1 className="header-title">Partner Orders</h1>
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
        </div>

        <div className="quick-stats" role="tablist" aria-label="Order status filters">
          {statFilters.map((stat) => (
            <button
              key={stat.value}
              type="button"
              className={`stat-chip ${activeFilter === stat.value ? "active" : ""}`}
              onClick={() => setActiveFilter(stat.value)}
              aria-pressed={activeFilter === stat.value}
            >
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.count}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search customer, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search orders"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="controls-section">
        <div className="filter-chips">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${
                activeFilter === option.value ? "active" : ""
              }`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="sort-dropdown">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort orders"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      <main className="dashboard-content">
        {error && orders.length > 0 && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="orders-container">
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">✨</div>
            <h2>You're all caught up!</h2>
            <p>No pending orders right now.</p>
          </div>
        ) : (
          <div className="orders-container">
            {filteredAndSortedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isExpanded={!!expandedOrders[order._id]}
                onToggle={toggleOrderDetails}
                actionLoading={actionLoading}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>

      <nav className="partner-nav">
        {navItems.map((item) => {
          const isActive = item.key === "orders";
          return (
            <button
              key={item.key}
              className={`nav-item ${isActive ? "active" : ""}`}
              type="button"
              title={item.label}
            >
              <NavIcon type={item.key} active={isActive} />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
export default PartnerOrdersPage;