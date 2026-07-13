const foodModel = require('../models/food.model');
const LikeModel = require('../models/like.model');
const saveFoodModel = require('../models/saveFood.model');
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
        const likedItems = await LikeModel.find({ user: req.user._id }).select('food');
        const likedFoodIds = new Set(likedItems.map((like) => like.food.toString()));

        const foodItemsWithLike = foodItems.map((item) => ({
            ...item.toObject(),
            isLiked: likedFoodIds.has(item._id.toString()),
        }));

        return res.status(200).json({
            message: "Food items retrieved successfully",
            foodItems : foodItemsWithLike
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
                foodId,{ $inc:{ likesCount: -1 } },{ returnDocument: 'after' }
            );

            return res.status(200).json({
                message: "Food unliked successfully",
                food: updatedFood,
                likedStatus: false
            });
        }

        await LikeModel.create({
            user: req.user._id,
            food: foodId
        });

        const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc:{ likesCount: 1 } },
            { returnDocument: 'after' }
        )
        return res.status(200).json({
            message: "Food liked successfully",
            food: updatedFood,
            likedStatus: true
        });
    } catch (error) {
        return res.status(500).json("Internal server error");
    }
}

async function saveFood(req,res){
try{
    const { foodId } = req.body;

    if(!isValidObjectId(foodId)){
        return res.status(400).json({
            message: "Invalid food"
        });
    }
    
    const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }


    const isSaved = await saveFoodModel.findOne({
        food: foodId,
        user: req.user._id
    });
    if(isSaved){
        await isSaved.deleteOne();
        const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            {
                $inc:{
                    saveCount: -1
                }
            },
            {
                returnDocument: 'after'
            }
        )
        return res.status(200).json({
            message: "Food removed from saves",
            food: updatedFood,
            savedStatus: false
        });
    }

    await saveFoodModel.create({
        user: req.user._id,
        food: foodId
    });
    const updatedFood = await foodModel.findByIdAndUpdate(
        foodId,
        {
            $inc: {
                saveCount: 1
            }
        },
        {
            returnDocument: 'after'
        }
    )
    return res.status(200).json({
        message: "Food saved successfully",
        food: updatedFood,
        savedStatus: true
    });
}catch(err){
    return res.status(500).json({
        message: "Internal server error"
    });
}
}

async function getSavedFood(req,res){
    try{
        const savedFood = await saveFoodModel.find({
            user:req.user?._id
        }).sort({createdAt:-1})
        .populate('food');

        return res.status(200).json({
            message: "Saved food retrieved successfully",
            savedFood: savedFood
        })

    }catch(err){
         return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSavedFood
}