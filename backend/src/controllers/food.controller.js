const foodModel = require('../models/food.model');
const uploadOnCloudinary = require('../utils/cloudinary').uploadOnCloudinary;
const { v4:uuid} = require('uuid');

async function createFood(req,res){
    try{
        const videoLocalPath = req.file.buffer;

        const videoResult = await uploadOnCloudinary(
            videoLocalPath,
            "video"
        );

        const food = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            foodPartner: req.foodPartner?._id,
            video: videoResult.secure_url
        });

        return res.status(201).json({
            message: "Food created successfully",
            food : food
        });

    }catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
}

async function getFoodItems(req,res){
    try{
        const foodItems = await foodModel.find({})   
        return res.status(200).json({
            message: "Food items retrieved successfully",
            foodItems : foodItems
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
}
module.exports = {
    createFood,
    getFoodItems
}