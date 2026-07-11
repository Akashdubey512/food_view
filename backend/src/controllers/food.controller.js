const foodModel = require('../models/food.model');
const LikeModel = require('../models/like.model');
const uploadOnCloudinary = require('../utils/cloudinary').uploadOnCloudinary;
const { v4:uuid} = require('uuid');
const { isValidObjectId } = require('mongoose');

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

async function likeFood(req,res){
    try{
        const { foodId } = req.body;
        if (!isValidObjectId(foodId)) {
            return res.status(400).json({
                message: "Invalid food id"
            });
        }
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const existingLike = await LikeModel.findOne({
            user: req.user._id,
            food: foodId
        });
        if (existingLike) {

            await existingLike.deleteOne();

            const updatedFood = await foodModel.findByIdAndUpdate(
                foodId,{
                    $inc:{
                        likesCount: -1
                    }
                },
            {
                new: true
            }
            );

            return res.status(200)
            .json(
                { message: "You have removed your like",
                    food: updatedFood
                 }
            );
    }

        await LikeModel.create({
            user: req.user._id,
            food: foodId
        });

        const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            {
                $inc:{
                    likesCount: 1
                }
            },{
                new: true
            }
        )
        return res.status(200).json({
            message: "Food liked successfully",
            food: updatedFood
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood
}