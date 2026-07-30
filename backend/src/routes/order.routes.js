const router = require("express").Router();
const {
  makeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFoodPartnerOrders,
  updateOrderStatus,
  getFoodPartnerOrdersByID
} = require("../controllers/order.controller");
const { authUserMiddleware,authFoodPartnerMiddleware } = require("../middlewares/auth.middleware");
router.get("/foodpartner",authFoodPartnerMiddleware,getFoodPartnerOrders);
router.patch("/foodpartner/:orderId",authFoodPartnerMiddleware,updateOrderStatus);
router.get("/foodpartner/:orderId",authFoodPartnerMiddleware,getFoodPartnerOrdersByID);

router.use(authUserMiddleware);

router.post("/", makeOrder);
router.get("/", getMyOrders);
router.get("/:orderId", getOrderById);
router.post("/:orderId/cancel", cancelOrder);


module.exports = router;
