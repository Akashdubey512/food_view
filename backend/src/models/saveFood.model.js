const mongoose = require('mongoose');

const SaveFoodSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
    
)

const saveFoodModel = mongoose.model('saveFood', SaveFoodSchema);

module.exports  = saveFoodModel; 
