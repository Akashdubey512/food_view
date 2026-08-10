const router = require("express").Router();
const { getFoodPartnerById,changePassword,editFoodPartnerProfile } = require("../controllers/food-partner.controller");
const { authFoodPartnerMiddleware, authAnyMiddleware } = require("../middlewares/auth.middleware");

router.get("/:id", authAnyMiddleware, getFoodPartnerById);
router.patch("/edit-profile",authFoodPartnerMiddleware,editFoodPartnerProfile);
router.patch("/change-password",authFoodPartnerMiddleware,changePassword);

module.exports = router;