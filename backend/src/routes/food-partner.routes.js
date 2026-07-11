const router = require("express").Router();
const { getFoodPartnerById } = require("../controllers/food-partner.controller");
const {authUserMiddleware} = require("../middlewares/auth.middleware")


router.get("/:id",
    getFoodPartnerById);


module.exports = router;