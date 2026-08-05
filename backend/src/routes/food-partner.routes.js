const router = require("express").Router();
const { getFoodPartnerById,changePassword,editFoodPartnerProfile } = require("../controllers/food-partner.controller");
const {authFoodPartnerMiddleware,authUserMiddleware} = require("../middlewares/auth.middleware")

router.get("/:id",
authUserMiddleware,
    getFoodPartnerById);
router.patch("/edit-profile",authFoodPartnerMiddleware,editFoodPartnerProfile);
router.patch("/change-password",authFoodPartnerMiddleware,changePassword);

module.exports = router;