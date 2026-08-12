const foodModel = require('../models/food.model');
const LikeModel = require('../models/like.model');
const saveFoodModel = require('../models/saveFood.model');
const { uploadOnCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getFoodItems(req, res) {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        let foodQuery = foodModel.find(
            {},
            "name description price video thumbnail isAvailable isVeg prepTime likesCount saveCount foodPartner createdAt"
        ).sort({ createdAt: -1 });

        const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

        if (isPaginated) {
            foodQuery = foodQuery.skip((page - 1) * limit).limit(limit);
        }

        const [foodItems, totalCount, likedFoodIds, savedFoodIds] = await Promise.all([
            foodQuery.lean(),
            foodModel.estimatedDocumentCount(),
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
            ...food,
            isLiked: likedSet.has(food._id.toString()),
            isSaved: savedSet.has(food._id.toString())
        }));

        return res.status(200).json({
            message: "Food items retrieved successfully",
            foodItems: result,
            pagination: {
                totalCount,
                totalPages: isPaginated ? Math.ceil(totalCount / limit) : 1,
                currentPage: isPaginated ? page : 1,
                hasNextPage: isPaginated ? page < Math.ceil(totalCount / limit) : false
            }
        });

    } catch (err) {
        console.error(err);
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

        const [food, existingLike] = await Promise.all([
            foodModel.findById(foodId),
            LikeModel.findOne({
                user: req.user._id,
                food: foodId
            })
        ])
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        if (existingLike) {

            const [updatedFood] = await Promise.all([
                foodModel.findByIdAndUpdate(
                    foodId,
                    { $inc: { likesCount: -1 } },
                    { returnDocument: 'after' }
                ),
                existingLike.deleteOne()
            ]);

            return res.status(200).json({
                message: "Food unliked successfully",
                food: updatedFood,
                likedStatus: false
            });
        }

        const [updatedFood] = await Promise.all([
            foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { likesCount: 1 } },
                { returnDocument: 'after' }
            ),
            LikeModel.create({
                user: req.user._id,
                food: foodId
            })
        ]);

        return res.status(200).json({
            message: "Food liked successfully",
            food: updatedFood,
            likedStatus: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
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

    const [food, isSaved] = await Promise.all([
        foodModel.findById(foodId),
        saveFoodModel.findOne({
            user: req.user._id,
            food: foodId
        })
    ]);

    if (!food) {
        return res.status(404).json({ message: "Food not found" });
    }

    if(isSaved){
        const [updatedFood] = await Promise.all([
            foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { saveCount: -1 } },
                { returnDocument: 'after' }
            ),
                isSaved.deleteOne()
        ]);

        return res.status(200).json({
            message: "Food removed from saves",
            food: updatedFood,
            savedStatus: false
        });
    }

   const [updatedFood] = await Promise.all([
            foodModel.findByIdAndUpdate(
                foodId,
                { $inc: { saveCount: 1 } },
                { returnDocument: 'after' }
            ),
            saveFoodModel.create({
                user: req.user._id,
                food: foodId
            })
        ]);

    return res.status(200).json({
        message: "Food saved successfully",
        food: updatedFood,
        savedStatus: true
    });
}catch(err){
    console.error(err);
    return res.status(500).json({
        message: "Internal server error"
    });
}
}

async function getLikeStatus(req, res) {
    try {
        const { foodId } = req.params;
        
        if (!isValidObjectId(foodId)) {
            return res.status(400).json({ message: "Invalid food ID" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const existingLike = await LikeModel.findOne({
            user: req.user._id,
            food: foodId
        });

        res.status(200).json({
            isLiked: !!existingLike
        });
    } catch (error) {
        console.error("Error getting like status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getSaveStatus(req, res) {
    try {
        const { foodId } = req.params;
        
        if (!isValidObjectId(foodId)) {
            return res.status(400).json({ message: "Invalid food ID" });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        const existingSave = await saveFoodModel.findOne({
            user: req.user._id,
            food: foodId
        });

        res.status(200).json({
            isSaved: !!existingSave
        });
    } catch (error) {
        console.error("Error getting save status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getSavedFood(req, res) {
    try {
        const [savedFood, likedFoodIds] = await Promise.all([
            saveFoodModel.find({
                user: req.user._id
            })
            .sort({ createdAt: -1 })
            .populate({ path: "food", select: "name thumbnail price description video isAvailable isVeg likesCount saveCount foodPartner" })
            .lean(),

            LikeModel.distinct("food", {
                user: req.user._id
            })
        ]);

        const likedSet = new Set(
            likedFoodIds.map(id => id.toString())
        );

        const foodItems = savedFood
            .filter(item => item.food)
            .map(item => ({
                ...item.food,
                isSaved: true,
                isLiked: likedSet.has(item.food._id.toString())
            }));

        return res.status(200).json({
            message: "Saved food retrieved successfully",
            foodItems
        });

    } catch (err) {
        console.error(err);

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

        let oldVideo = null;
        let oldThumbnail = null;

        // Upload new video if provided
        if (req.files?.video?.[0]?.buffer) {
            const videoResult = await uploadOnCloudinary(req.files.video[0].buffer, "video");
            oldVideo = food.video;
            food.video = videoResult.secure_url;
        }

        // Upload new thumbnail if provided
        if (req.files?.thumbnail?.[0]?.buffer) {
            const thumbResult = await uploadOnCloudinary(req.files.thumbnail[0].buffer, "image");
            oldThumbnail = food.thumbnail;
            food.thumbnail = thumbResult.secure_url;
        }

        if (req.body.name        !== undefined) food.name        = req.body.name;
        if (req.body.description !== undefined) food.description = req.body.description;
        if (req.body.price       !== undefined) food.price       = Number(req.body.price);
        if (req.body.prepTime    !== undefined) food.prepTime    = Number(req.body.prepTime);
        if (req.body.isVeg       !== undefined) food.isVeg       = req.body.isVeg === "false" ? false : true;
        if (req.body.isAvailable !== undefined) food.isAvailable = req.body.isAvailable === "false" ? false : true;

        await food.save();
        if (oldVideo) {
            deleteFromCloudinary(oldVideo, "video").catch(err => console.error("Cloudinary video delete error:", err));
        }
        if (oldThumbnail) {
            deleteFromCloudinary(oldThumbnail, "image").catch(err => console.error("Cloudinary thumbnail delete error:", err));
        }

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

        const videoToDelete = food.video;
        const thumbnailToDelete = food.thumbnail;

        await food.deleteOne();

        if (videoToDelete) {
            deleteFromCloudinary(videoToDelete, "video").catch(err => console.error("Cloudinary video delete error:", err));
        }
        if (thumbnailToDelete) {
            deleteFromCloudinary(thumbnailToDelete, "image").catch(err => console.error("Cloudinary thumbnail delete error:", err));
        }

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
    deleteFood,
    getLikeStatus,
    getSaveStatus
}
