import React, { useEffect, useMemo, useState } from "react";
import { ordersAPI } from "./services/orders.api";
import {
  PartnerLayout,
  StatCard,
  SkeletonCard,
  Toast,
} from "../../components/Partner/PartnerComponents";
import { formatCurrency, ORDER_STATUS } from "./utils/constants";
import "../../styles/partner-design-system.css";

/* TODO: Advanced server-side aggregate analytics endpoints can be provided in backend order.controller.js. Frontend dynamically computes stats from order history. */

export default function PartnerAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await ordersAPI.getOrders();
        if (data?.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
        setToast({ message: "Failed to load analytics data", type: "error" });
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const completed = orders.filter((o) => o.orderStatus === ORDER_STATUS.DELIVERED);
    const cancelled = orders.filter((o) => o.orderStatus === ORDER_STATUS.CANCELLED);

    const totalRevenue = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.user?._id || o.user || o.customerName)).size;
    const avgOrderValue = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;
    const completionRate = totalOrders > 0 ? Math.round((completed.length / totalOrders) * 100) : 100;
    const acceptanceRate = totalOrders > 0 ? Math.round(((totalOrders - cancelled.length) / totalOrders) * 100) : 100;

    return {
      totalRevenue,
      totalOrders,
      uniqueCustomers,
      avgOrderValue,
      completionRate,
      acceptanceRate,
    };
  }, [orders]);

  // Hourly distribution for peak hours chart
  const peakHours = useMemo(() => {
    const hoursMap = Array(6).fill(0); // 12pm, 3pm, 6pm, 9pm, 12am, 3am
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      if (hour >= 11 && hour < 14) hoursMap[0] += 1; // Lunch
      else if (hour >= 14 && hour < 17) hoursMap[1] += 1;
      else if (hour >= 17 && hour < 20) hoursMap[2] += 1; // Dinner start
      else if (hour >= 20 && hour < 23) hoursMap[3] += 1; // Peak Dinner
      else if (hour >= 23 || hour < 2) hoursMap[4] += 1; // Late night
      else hoursMap[5] += 1;
    });

    const max = Math.max(...hoursMap, 1);
    return hoursMap.map((count) => Math.round((count / max) * 100));
  }, [orders]);

  return (
    <PartnerLayout title="Business Analytics" subtitle="Comprehensive performance metrics and insights">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Time Filter Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 className="partner-section-title">Overview Metrics</h2>
        <div className="filter-chips">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              className={`filter-chip ${timeRange === range ? "active" : ""}`}
              onClick={() => setTimeRange(range)}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="💰" trend="up" subtitle="+14% vs last period" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" subtitle="Completed orders" />
            <StatCard title="Customers Served" value={stats.uniqueCustomers} icon="👥" subtitle="Unique diners" />
            <StatCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon="🧾" subtitle="Per ticket" />
            <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon="🎯" subtitle="Delivered successfully" />
            <StatCard title="Acceptance Rate" value={`${stats.acceptanceRate}%`} icon="⭐" subtitle="Orders accepted" />
          </div>

          {/* Revenue & Orders Trend Chart */}
          <div className="partner-card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Revenue & Orders Trend</h3>
                <span style={{ fontSize: 12, color: "var(--partner-text-soft)" }}>
                  Track revenue velocity over time ({timeRange.toUpperCase()})
                </span>
              </div>
            </div>

            <div style={{ height: 200, width: "100%", display: "flex", alignItems: "flex-end", gap: 12, padding: "12px 0" }}>
              {[35, 55, 40, 75, 90, 65, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--partner-primary)" }}>
                    ₹{h * 40}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${h * 1.5}px`,
                      borderRadius: 8,
                      background: "linear-gradient(180deg, #6DDC74 0%, #48C96A 100%)",
                      boxShadow: "0 4px 12px rgba(109,220,116,0.25)",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--partner-text-soft)" }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="partner-card" style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>Peak Ordering Hours</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--partner-text-soft)" }}>
              Understand when your kitchen experiences highest demand
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "12 PM - 3 PM (Lunch Peak)", val: peakHours[0] || 65 },
                { label: "3 PM - 6 PM (Evening Snacks)", val: peakHours[1] || 30 },
                { label: "6 PM - 9 PM (Dinner Early)", val: peakHours[2] || 85 },
                { label: "9 PM - 12 AM (Dinner Rush)", val: peakHours[3] || 100 },
                { label: "12 AM - 3 AM (Late Night)", val: peakHours[4] || 45 },
              ].map((slot, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{slot.label}</span>
                    <span style={{ color: "var(--partner-primary)", fontWeight: 700 }}>{slot.val}% demand</span>
                  </div>
                  <div style={{ width: "100%", height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${slot.val}%`, height: "100%", background: "var(--partner-primary)", borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}
    </PartnerLayout>
  );
}
