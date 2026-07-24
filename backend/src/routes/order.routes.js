const router = require("express").Router();
const {
  makeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/order.controller");
const { authUserMiddleware } = require("../middlewares/auth.middleware");

router.use(authUserMiddleware);

router.post("/", makeOrder);
router.get("/", getMyOrders);
router.get("/:orderId", getOrderById);
router.post("/:orderId/cancel", cancelOrder);

module.exports = router;
