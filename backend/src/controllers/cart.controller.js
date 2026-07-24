const mongoose = require('mongoose')
const cartModel = require('../models/cart.model')
const foodModel = require('../models/food.model')
const { isValidObjectId } = mongoose;

function calculateCartTotal(items) {
    return items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
}

async function getCart(req,res){
    try {
        const user= req.user._id;
        const cart = await cartModel.findOne({user});
            if (!cart) {
                return res.status(200).json({
                    message: "Cart is empty",
                    cart:{
                        items:[],
                        totalPrice:0
                    }
                });
            }
        await cart.populate(
        {
            path: "items.food",
            select: "name thumbnail price"
        }
        );
        return res.status(200).json({
            message:"Cart fetched successfully",
            cart
        })

    } catch (err) {
        console.error(err)

        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

async function addToCart(req,res){
    try {
        const { food, quantity = 1} = req.body;
        const user = req.user._id;
         if(!isValidObjectId(food)) {
            return res.status(400).json({ error: "Invalid or missing food ID" });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }
        const foodDoc = await foodModel.findById(food);
        if(!foodDoc){
            return res.status(404).json({error:"food not found"})
        }
        let cart = await cartModel.findOne({user});

        if(!cart){
            cart = new cartModel({
                user,
                foodPartner: foodDoc.foodPartner,
                items: [],
                totalPrice: 0
            });
        }else if (!cart.foodPartner) {
            cart.foodPartner = foodDoc.foodPartner;
        }
        if(cart.foodPartner &&!cart.foodPartner.equals(foodDoc.foodPartner)){
            return res.status(400).json({
                message: "Your cart already contains items from another restaurant."
            });
        }

        const existingItem = cart.items.find(item =>
            item.food.equals(foodDoc._id)
        );
        if(existingItem){
            existingItem.quantity += quantity;
        }else{
            cart.items.push({
                food: foodDoc._id,
                quantity,
                price: foodDoc.price
            });
        }
        cart.totalPrice = calculateCartTotal(cart.items);

        await cart.save();
        await cart.populate({
            path: "items.food",
            select: "name thumbnail price"
        });
        return res.status(200)
        .json({
            message: "Item added to cart",
            cart
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function removeFromCart(req,res){
    try {
        const user=req.user._id;
        const {food} =req.body;
        if (!isValidObjectId(food)) {
            return res.status(400).json({ error: "Invalid or missing food ID" });
        }
        const cart = await cartModel.findOne({user});

        if(!cart){
            return res.status(404).json({
                message:"Cart not found"
            });
        }
        const itemExists = cart.items.some(item =>
            item.food.equals(food)
        );
        if(!itemExists){
            return res.status(404).json({
                message:"Item does not exist in cart"
            });
        }
        cart.items = cart.items.filter(
            item => !item.food.equals(food)
        );

        cart.totalPrice = calculateCartTotal(cart.items);
        if (cart.items.length === 0) {
            cart.foodPartner = null;
        }
        await cart.save();

        await cart.populate({
            path: "items.food",
            select: "name price thumbnail"
        });
        return res.status(200).json({
            message: "Item removed from cart",
            cart
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function updateCartItemQuantity(req,res){
    try {
        const user = req.user._id;
        const {food,operation} = req.body

        if(!isValidObjectId(food)) {
            return res.status(400).json({ error: "Invalid or missing food ID" });
        }
        if (![1, -1].includes(operation)) {
            return res.status(400).json({
                message: "Operation must be 1 or -1"
            });
        }

        const cart = await cartModel.findOne({user});
        if(!cart){
            return res.status(404).json({
                message:"food does not exists in the cart"
            })
        }
        
        const existingItem = cart.items.find(item =>
            item.food.equals(food)
        );

        if(!existingItem){
            return res.status(404).json({
                message:"food does not exists in the cart"
            })
        }

        existingItem.quantity+=operation;

        if(existingItem.quantity<=0){
           cart.items= cart.items.filter(item=>
                !item.food.equals(food)
            )
            if (cart.items.length === 0) {
                cart.foodPartner = null;
            }
        }

      cart.totalPrice = calculateCartTotal(cart.items);
        await cart.save();
        await cart.populate({
            path: "items.food",
            select: "name thumbnail price"
        });

        return res.status(200).json({
            message: "Cart updated successfully",
            cart
        })

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function clearCart(req,res){
    try {
        const user = req.user._id;
        const cart = await cartModel.findOne({ user });

       if (!cart) {
            return res.status(200).json({
                message: "Cart is already empty"
            });
        }

        cart.items = [];
        cart.totalPrice = 0;
        cart.foodPartner = null;

        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports={
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
}