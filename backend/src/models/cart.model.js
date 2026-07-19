const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    food:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    quantity:{
        type: Number,
        default: 1,
        min:1
    },
    price:{
        type:Number,
        required:true,
        min:0
    }
},{_id:false});


const cartSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    items:{
    type:[cartItemSchema],
    default:[]
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodPartner",
        default: null,
    },
    totalPrice:{
        type: Number,
        default:0,
        min:0
    },
},{timestamps:true});

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;