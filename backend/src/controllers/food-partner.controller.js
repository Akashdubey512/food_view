const foodModel = require('../models/food.model');
const foodPartnerModel = require('../models/foodpartner.model');
const { isValidObjectId } = require('mongoose');


async function getFoodPartnerById(req, res) {
    try{
        
        const { id } = req.params;
        if(!isValidObjectId(id)){
            return res.status(400).json({ error: "Invalid food partner ID" });
        }
        const foodPartnerDetail = await foodPartnerModel.findById(id);
        if (!foodPartnerDetail) {
            return res.status(404).json({ error: "Food partner not found" });
        }

        const foodItems = await foodModel.find({ foodPartner: id });
        res.status(200).json({
            message: "Food partner fetched successfully",
            foodPartner: {
                ...foodPartnerDetail.toObject(),
                foodItems: foodItems
            }
        });
    }
    catch(error){
        console.error( "error fetching food partner by ID:");
        res.status(500).json({message: "Internal server error" });
    }
}


module.exports = {
    getFoodPartnerById
}
