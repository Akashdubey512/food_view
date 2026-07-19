const mongoose =require('mongoose')

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    video:{
        type:String,
        required:true
    },
    description:{
        type: String,
        required:true,
        trim:true,
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    foodPartner:{
        type:mongoose.Schema.Types.ObjectId,
       ref:"FoodPartner",
       required:true
    },
    likesCount:{
        type:Number,
        default:0
    },
    saveCount:{
        type:Number,
        default:0
    },
    isAvailable:{
        type:Boolean,
        default:true
    }

},{timestamps:true})

const foodModel = mongoose.model("food",foodSchema);

module.exports= foodModel;