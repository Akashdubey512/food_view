const mongoose = require('mongoose')
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model');
const cartModel = require('../models/cart.model');
const crypto = require("crypto");
const { isValidObjectId } = mongoose;

async function createPaymentOrder(req,res) {
    try {
        const user  = req.user._id;
        const {orderId} =  req.body;
        if(!isValidObjectId(orderId)) {
            return res.status(400).
            json({ message: "Invalid or missing order ID" });
        }
        const order = await orderModel.findOne({
            _id:orderId,
            user
        });
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                message: "Cannot pay for a cancelled order"
            });
        }
        if (order.paymentMethod !== "ONLINE") {
            return res.status(400).json({
                message: "This order does not require online payment"
            });
        }
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({
                message: "Order is already paid"
            });
        }
        const existingPayment = await paymentModel.findOne({
            order: order._id
        });

        if (existingPayment) {
            return res.status(400).json({
                message: "Payment already initiated for this order"
            });
        }
        const options = {
            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: `order_${order._id}`
        };
        const razorpayOrder = await razorpay.orders.create(options);
        if (!razorpayOrder) {
            return res.status(500).json({
                message: "Failed to create Razorpay order"
            });
        }
        const payment = await paymentModel.create({
            user,
            order: order._id,
            amount: order.totalAmount,
            paymentMethod: "ONLINE",
            razorpayOrderId: razorpayOrder.id
        });
        return res.status(201).json({
            key: process.env.RAZORPAY_KEY_ID,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            paymentId: payment._id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message:"Internal server error"
        });
    }
}

async function verifyPayment(req,res) {
    try {
        const user  = req.user._id;
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature } =  req.body;
        if (!razorpay_order_id ||!razorpay_payment_id ||!razorpay_signature) {
            return res.status(400).json({
                message: "Missing payment details"
            });
        }
        const payment = await paymentModel.findOne({
            razorpayOrderId: razorpay_order_id,
            user
        });
        if(!payment){
            return res.status(404).json({
                message: "Missing payment"
            });
        }
        if (["Success", "Refunded"].includes(payment.status)) {
            return res.status(400).json({
                message: "Payment has already been processed"
            });
        }
        const order = await orderModel.findById(payment.order);
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({
                message: "Order is already marked as paid"
            });
        }
        const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(
            razorpay_order_id + "|" + razorpay_payment_id
        )
        .digest("hex");
        if (generatedSignature !== razorpay_signature){
            payment.status = "Failed";
            await payment.save();
            return res.status(400).json({
                message:"Payment verification failed"
            })
        }
        payment.status = "Success";

        payment.razorpayPaymentId = razorpay_payment_id;

        payment.paidAt = new Date();
        order.paymentStatus = "Paid";
        
        await Promise.all([
            payment.save(),
            order.save()
        ]);

        const cart = await cartModel.findOne({
            user
        });

        if(cart) {
            cart.items = [];
            cart.totalPrice = 0;
            cart.foodPartner = null;

            await cart.save();
        }

        return res.status(200).json({
            message: "Payment verified successfully",
            paymentStatus: payment.status,
            orderStatus: order.orderStatus,
            paymentId: payment._id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message:"Internal server error"
        });
    }
}