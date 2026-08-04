const foodModel = require('../models/food.model');
const foodPartnerModel = require('../models/foodpartner.model');
const bcrypt = require('bcrypt');
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

async function editFoodPartnerProfile(req,res){
    try {
        const partnerId = req.account.data._id;
        const { fullName, bussinessName, phoneNumber, address } = req.body;

        if (fullName !== undefined &&  fullName.trim() === "") {
            return res.status(400).json({
                message: "Full name cannot be empty"
            });
        }
        if (bussinessName !== undefined &&  bussinessName.trim() === "") {
            return res.status(400).json({
                message: "Bussiness Name cannot be empty"
            });
        }
        if (phoneNumber !== undefined &&  phoneNumber.trim() === "") {
            return res.status(400).json({
                message: "Phone Number cannot be empty"
            });
        }
        if (address !== undefined &&  address.trim() === "") {
            return res.status(400).json({
                message: "address cannot be empty"
            });
        }

        const foodPartner = await foodPartnerModel.findById(partnerId);

        if (fullName !== undefined) foodPartner.fullName  = fullName;
        if (bussinessName !== undefined) foodPartner.bussinessName  = bussinessName;
        if (phoneNumber !== undefined) foodPartner.phoneNumber  = phoneNumber;
        if (address !== undefined) foodPartner.address  = address;

        await foodPartner.save();

        return res.status(200).json({
            message:"Profile details updated successfully"
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message:"Internal server error",
        })
    }
}

async function changePassword(req,res){
    try {
        const partnerId = req.account.data._id;
        const { currentPassword,newPassword} = req.body;
        if (!currentPassword?.trim() || !newPassword?.trim()) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        const foodPartner =await foodPartnerModel.findById(partnerId);

        if (!foodPartner) {
            return res.status(404).json({
                message: "Food partner not found"
            });
        }
        const isPasswordMatch=await bcrypt.compare(currentPassword,foodPartner.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Wrong old password"
            })
        }
        const hashPassword=await bcrypt.hash(newPassword,10);
        foodPartner.password=hashPassword;
        await foodPartner.save();

        return res.status(200).json({
            message:"password updated successfully"
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getFoodPartnerById,
    editFoodPartnerProfile,
    changePassword
}
