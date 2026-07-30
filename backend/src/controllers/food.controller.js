const foodModel = require('../models/food.model');
const LikeModel = require('../models/like.model');
const saveFoodModel = require('../models/saveFood.model');
const uploadOnCloudinary = require('../utils/cloudinary').uploadOnCloudinary;
const { v4:uuid} = require('uuid');
const { isValidObjectId } = require('mongoose');

async function createFood(req,res){
    try{
        const videoBuffer    = req.files?.video?.[0]?.buffer;
        const thumbnailBuffer = req.files?.thumbnail?.[0]?.buffer;

        if (!videoBuffer || !thumbnailBuffer) {
            return res.status(400).json({
                message: "Both video and thumbnail are required"
            });
        }

        const [videoResult, thumbnailResult] = await Promise.all([
            uploadOnCloudinary(videoBuffer, "video"),
            uploadOnCloudinary(thumbnailBuffer, "image")
        ]);

        const food = await foodModel.create({
            name:        req.body.name,
            description: req.body.description,
            price:       Number(req.body.price),
            prepTime:    req.body.prepTime ? Number(req.body.prepTime) : undefined,
            isVeg:       req.body.isVeg === "false" ? false : true,
            isAvailable: req.body.isAvailable === "false" ? false : true,
            foodPartner: req.account.data._id,
            video:       videoResult.secure_url,
            thumbnail:   thumbnailResult.secure_url
        });

        return res.status(201).json({
            message: "Food created successfully",
            food
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getFoodItems(req, res) {
    try {
        const [foodItems, likedFoodIds, savedFoodIds] = await Promise.all([
            foodModel.find({}).sort({ createdAt: -1 }),
            LikeModel.find({ user: req.user._id }).distinct("food"),
            saveFoodModel.find({ user: req.user._id }).distinct("food")
        ]);

        const likedSet = new Set(
            likedFoodIds.map(id => id.toString())
        );

        const savedSet = new Set(
            savedFoodIds.map(id => id.toString())
        );

        const result = foodItems.map(food => ({
            ...food.toObject(),
            isLiked: likedSet.has(food._id.toString()),
            isSaved: savedSet.has(food._id.toString())
        }));

        return res.status(200).json({
            message: "Food items retrieved successfully",
            foodItems: result
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        });
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
async function getSavedFood(req, res) {
    try {
        const [savedFood, likedFoodIds] = await Promise.all([
            saveFoodModel.find({
                user: req.user._id
            })
            .sort({ createdAt: -1 })
            .populate("food"),

            LikeModel.distinct("food", {
                user: req.user._id
            })
        ]);

        const likedSet = new Set(
            likedFoodIds.map(id => id.toString())
        );

        const foodItems = savedFood.map(item => ({
            ...item.food.toObject(),
            isSaved: true,
            isLiked: likedSet.has(item.food._id.toString())
        }));

        return res.status(200).json({
            message: "Saved food retrieved successfully",
            foodItems
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function editFood(req, res) {
    try {
        const { id } = req.params;
        const partnerId = req.account.data._id;

        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        if (food.foodPartner.toString() !== partnerId.toString()) {
            return res.status(403).json({ message: "Not authorised to edit this food" });
        }

        // Upload new video if provided
        if (req.files?.video?.[0]?.buffer) {
            const videoResult = await uploadOnCloudinary(req.files.video[0].buffer, "video");
            food.video = videoResult.secure_url;
        }

        // Upload new thumbnail if provided
        if (req.files?.thumbnail?.[0]?.buffer) {
            const thumbResult = await uploadOnCloudinary(req.files.thumbnail[0].buffer, "image");
            food.thumbnail = thumbResult.secure_url;
        }

        if (req.body.name        !== undefined) food.name        = req.body.name;
        if (req.body.description !== undefined) food.description = req.body.description;
        if (req.body.price       !== undefined) food.price       = Number(req.body.price);
        if (req.body.prepTime    !== undefined) food.prepTime    = Number(req.body.prepTime);
        if (req.body.isVeg       !== undefined) food.isVeg       = req.body.isVeg === "false" ? false : true;
        if (req.body.isAvailable !== undefined) food.isAvailable = req.body.isAvailable === "false" ? false : true;

        await food.save();

        return res.status(200).json({
            message: "Food updated successfully",
            food
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteFood(req, res) {
    try {
        const { id } = req.params;
        const partnerId = req.account.data._id;

        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        if (food.foodPartner.toString() !== partnerId.toString()) {
            return res.status(403).json({ message: "Not authorised to delete this food" });
        }

        await food.deleteOne();

        return res.status(200).json({ message: "Food deleted successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSavedFood,
    editFood,
    deleteFood
}