const router=require("express").Router();
const { getCart,addToCart,removeFromCart,updateCartItemQuantity,clearCart } =require('../controllers/cart.controller')
const {authUserMiddleware} =require('../middlewares/auth.middleware')

router.use(authUserMiddleware);

router.get("/",getCart);
router.post("/add",addToCart);
router.patch("/update",updateCartItemQuantity);
router.delete("/remove",removeFromCart);
router.delete("/clear",clearCart);

module.exports=router