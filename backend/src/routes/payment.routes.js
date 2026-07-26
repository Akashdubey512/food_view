const router = require("express").Router();
const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/payment.controller");
const { authUserMiddleware } = require("../middlewares/auth.middleware");

router.use(authUserMiddleware);

router.post("/create", createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;
