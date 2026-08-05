const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes=require("./routes/auth.routes");
const foodRoutes=require('./routes/food.routes')
const foodPartnerRoutes=require('./routes/food-partner.routes')
const meRoutes=require('./routes/me.routes')
const cartRoutes=require('./routes/cart.routes')
const orderRoutes=require('./routes/order.routes')
const paymentRoutes=require('./routes/payment.routes')
const healthRoutes=require('./routes/health.routes')
const cors=require('cors')
const apiLimiter = require("./middlewares/rateLimit.middleware");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/v1/health", healthRoutes);
app.use(apiLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/me",meRoutes);
app.use("/api/v1/food",foodRoutes);
app.use("/api/v1/food-partner", foodPartnerRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

module.exports = app;