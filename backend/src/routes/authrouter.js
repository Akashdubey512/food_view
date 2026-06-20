const router=require("express").Router();
const {registerUser,loginUser,logoutUser,foodPartnerLogin,foodPartnerRegister,foodPartnerLogout}=require("../controllers/auth.controller");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logoutUser);
router.post("/food-partner/register",foodPartnerRegister);
router.post("/food-partner/login",foodPartnerLogin);
router.get("/food-partner/logout",foodPartnerLogout);

module.exports=router;