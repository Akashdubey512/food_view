const mongoose =require('mongoose');

const LikeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    food:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'food',
        required:true
    }
},{timestamps:true});

LikeSchema.index(
    {
        user: 1,
        food: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model('Like',LikeSchema);