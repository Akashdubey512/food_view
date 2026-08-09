const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const sanitizeValue = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitizeValue(obj[key]);
      }
    }
  }
  return obj;
};
const mongoSanitize = () => (req, _res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.params) sanitizeValue(req.params);
  next();
};
const hpp = require("hpp");
const compression = require("compression");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const foodPartnerRoutes = require("./routes/food-partner.routes");
const meRoutes = require("./routes/me.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const healthRoutes = require("./routes/health.routes");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();
app.set("trust proxy", 1);

// Security Headers & Compression
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS")); // Allow configured requests with credentials
      }
    },
    credentials: true,
  })
);

// Body Parsing & Sanitization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

// Health Check (unthrottled)
app.use("/api/v1/health", healthRoutes);

// Rate Limiting
app.use(apiLimiter);
app.use("/api/v1/auth", authLimiter, authRoutes);

// Application Routes
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/food-partner", foodPartnerRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = app;
