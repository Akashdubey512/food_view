const mongoose = require('mongoose')
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const cartModel = require('../models/cart.model');
const foodModel = require('../models/food.model');
const { isValidObjectId } = mongoose;

// Endpoints for user
async function  makeOrder(req,res){
try {
    const user = req.user._id;
    const {deliveryAddress,paymentMethod} = req.body;
    if(!deliveryAddress || !deliveryAddress.trim()) {
        return res.status(400).json({
            message: "Delivery address is required"
        });
    }
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
        return res.status(400).json({
            message: "Invalid payment method"
        });
    }
    const cart =await cartModel.findOne({user});
    if(!cart||cart.items.length==0){
        return res.status(400).json({
            message:"Cart is empty"
        })
    }
    const foodIds = cart.items.map(item => item.food);

const foods = await foodModel.find(
    {
    _id: { $in: foodIds }
    },
    "name isAvailable price"
);

if (foods.length !== foodIds.length) {
    return res.status(400).json({
        message: "Some items in your cart are no longer available."
    });
}

const unavailableFood = foods.find(food => !food.isAvailable);

if (unavailableFood) {
    return res.status(400).json({
        message: `${unavailableFood.name} is currently unavailable`
    });
}
const foodPriceMap = new Map();

foods.forEach(food => {
    foodPriceMap.set(food._id.toString(), food.price);
});

const totalAmount = cart.items.reduce((sum, item) => {
    const price = foodPriceMap.get(item.food.toString());
    return sum + price * item.quantity;
}, 0);


    const order = await orderModel.create({
        user,
        foodPartner:cart.foodPartner,
        items:cart.items,
        totalAmount,
        deliveryAddress,
        paymentMethod
    })
    if(paymentMethod==="COD"){
        cart.items = [];
        cart.totalPrice = 0;
        cart.foodPartner = null;
        await cart.save();
    }

    

    await order.populate([
        {
            path: "items.food",
            select: "name thumbnail price"
        },
        {
            path: "foodPartner",
            select: "restaurantName"
        }
    ]);
    return res.status(201).json({
        message: "Order placed successfully",
        order
    });

} catch (err) {
    console.error("error:",err)
    return res.status(500).json({
        message:"Internal server error"
    })
}
}

async function getMyOrders(req,res) {
try {
    const user = req.user._id;
    const orders = await orderModel
            .find({ user })
            .sort({ createdAt: -1 })
            .populate({
                path: "items.food",
                select: "name thumbnail price"
            })
            .populate({
                path: "foodPartner",
                select: "restaurantName"
            });

        if (orders.length === 0) {
            return res.status(200).json({
                message: "No orders found",
                orders: []
            });
        }

        return res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
} catch (err) {
     console.error("error:",err)
    return res.status(500).json({
        message:"Internal server error"
    })
}    
}

async function getOrderById(req,res){
    try {
        const user = req.user._id;
        const {orderId} = req.params;
        if(!isValidObjectId(orderId)) {
            return res.status(400).
            json({ message: "Invalid or missing order ID" });
        }
        const order = await orderModel
            .findOne({
                _id: orderId,
                user
            })
            .populate({
                path: "items.food",
                select: "name thumbnail price"
            })
            .populate({
                path: "foodPartner",
                select: "restaurantName"
            });
        
        if(!order){
            return res.status(404).json({ message: "Not found" });
        }
        return res.status(200).json({
            message:"Order fetched successfully",
            order
        })

    } catch (err) {
         console.error("error:",err)
    return res.status(500).json({
        message:"Internal server error"
    })
    }
}

async function cancelOrder(req,res) {
    try {
        const user = req.user._id
        const {orderId} = req.params
        
        if(!isValidObjectId(orderId)) {
            return res.status(400).
            json({ message: "Invalid or missing order ID" });
        }

        const order = await orderModel
            .findOne({
                _id: orderId,
                user
            });
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        if(["Preparing","Out for Delivery","Delivered","Cancelled"].includes(order.orderStatus)){
            return res.status(400).json({
                message:"Now you cannot cancel the order"
            })
        }
        order.orderStatus="Cancelled";
        await order.save();
        return res.status(200).json({
            message:"Order cancelled successfully"
        })


    } catch (err) {
        console.error("error:",err)
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

//Endpoints for food partner
async function getFoodPartnerOrders(req,res){
    try {
        const foodPartner = req.foodPartner._id;
        const orders = await orderModel
            .find({ foodPartner })
            .sort({ createdAt: -1 })
            .populate({
                path: "items.food",
                select: "name thumbnail price"
            });

        if (orders.length === 0) {
            return res.status(200).json({
                message: "No orders found",
                orders: []
            });
        }

        return res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
    } catch (err) {
        console.error("error:",err)
    return res.status(500).json({
        message:"Internal server error"
    })
    }
}

async function updateOrderStatus(req,res) {
    try {
        const foodPartner = req.foodPartner._id;
        const {orderId} = req.params
        const {updationStatus} = req.body
        if(!isValidObjectId(orderId)) {
            return res.status(400).
            json({ message: "Invalid or missing order ID" });
        }
        const order = await orderModel.findOne({
            _id:orderId,
            foodPartner
        })
        if (!order) {
            return res.status(404).
            json({ message: "Order not found" });
        }
        if(["Cancelled","Delivered"].includes(order.orderStatus)){
            return res.status(400).json({
                message:"Can not change order status either it is cancelled or delivered"
            });
        }
         const allowedStatuses = [
            "Accepted",
            "Preparing",
            "Out for Delivery",
            "Delivered"
        ];
        if (!allowedStatuses.includes(updationStatus)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const validTransitions = {
            Pending: "Accepted",
            Accepted: "Preparing",
            Preparing: "Out for Delivery",
            "Out for Delivery": "Delivered"
        };
        if (validTransitions[order.orderStatus] !== updationStatus) {
            return res.status(400).json({
                message: `Order can only be updated from "${order.orderStatus}" to "${validTransitions[order.orderStatus]}".`
            });
        }
         order.orderStatus = updationStatus;
        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });
        
    } catch (err) {
        console.error("error:",err)
        return res.status(500).json({
            message:"Internal server error"
        })
    }
} 

async function getFoodPartnerOrdersByID(req,res) {
    try {
        const foodPartner = req.foodPartner._id;
        const {orderId} = req.params
        if(!isValidObjectId(orderId)) {
            return res.status(400).
            json({ message: "Invalid or missing order ID" });
        }
        const order = await orderModel.findOne({
            _id:orderId,
            foodPartner
        }).populate({
            path: "items.food",
            select: "name thumbnail price"
        });
        if (!order) {
            return res.status(404).
            json({ message: "Order not found" });
        }
        return res.status(200).json({
            message: "Order fetched successfully",
            order
        });


    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

module.exports = {
    makeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getFoodPartnerOrders,
    updateOrderStatus,
    getFoodPartnerOrdersByID

}