const mongoose=require("mongoose");

const foodPartnerSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    bussinessName:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    customerServed:{
        type:Number,
        default:0
    }

},{timestamps:true})

const foodPartnerModel=mongoose.model("FoodPartner",foodPartnerSchema);

module.exports=foodPartnerModel;