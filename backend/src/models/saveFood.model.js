const mongoose = require('mongoose');

const SaveFoodSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    food:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    }
},{timestamps:true});



SaveFoodSchema.index(
    {
        user:1,
        food:1
    },
    {
        unique:true
    }
);

SaveFoodSchema.index({ user: 1, createdAt: -1 });

const saveFoodModel = mongoose.model('saveFood', SaveFoodSchema);

module.exports  = saveFoodModel; 
