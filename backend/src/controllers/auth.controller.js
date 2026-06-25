const Usermodel=require("../models/user.model");
const FoodPartnerModel=require("../models/foodpartner.model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");



async function registerUser(req,res){
const {fullName,email,password}=req.body;
if (
    [fullName, email, password].some(
        (field) => !field?.trim()
    )
) {
    return res.status(400).json({message:"All fields are required"})
}
const isUserExist= await Usermodel.findOne({email:email.toLowerCase().trim()});
if(isUserExist){
    return res.status(400).json({message:"User already exist"})
}
const hashPassword=await bcrypt.hash(password,10);
const newUser=await Usermodel.create({
    fullName:fullName.trim(),
    email:email.toLowerCase().trim(),
    password:hashPassword
});
const token=jwt.sign(
    {
        id:newUser._id,
    },
   process.env.JWT_SECRET
)

res.cookie("token",token,{
    httpOnly:true,
    secure:true
})
return res.status(201)
.json(
{
    message:"User registered successfully",
    user:{
    _id:newUser._id,
    fullName:newUser.fullName,
    email:newUser.email
    }
}
)

}


async function loginUser(req,res){
const {email,password}=req.body;

const user=await Usermodel.findOne({
    email:email.toLowerCase().trim()
})

if(!user){
    return res.status(400).json({message:"Invalid email or password"})
}
const isPasswordMatch=await bcrypt.compare(password,user.password);
if(!isPasswordMatch){
    return res.status(400).json({message:"Invalid email or password"})
}
const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
res.cookie("token",token,{
    httpOnly:true,
    secure:true
})

return res.status(200).json(
    {
        message:"User logged in successfully",
        user:{
            _id:user._id,
            fullName:user.fullName,
            email:user.email
        }
    }
)

}


async function logoutUser(req,res){
const token=req.cookies.token;
if(!token){
    return res.status(400).json({message:"User not logged in"})
}
res.clearCookie("token");
return res.status(200).json({message:"User logged out successfully"})
}

async function foodPartnerRegister(req,res){
const {fullName,email,password,bussinessName,phoneNumber,address}=req.body;
if (
    [fullName, email, password, bussinessName, phoneNumber, address].some(
        (field) => !field?.trim()
    )
) {
    return res.status(400).json({message:"All fields are required"})
}
const isFoodPartnerExist= await FoodPartnerModel.findOne({email:email.toLowerCase().trim()});
if(isFoodPartnerExist){
    return res.status(400).json({message:"Food partner already exist"})
}


const hashPassword=await bcrypt.hash(password,10);

const newFoodPartner=await FoodPartnerModel.create({
    fullName:fullName.trim(),
    email:email.toLowerCase().trim(),
    password:hashPassword,
    bussinessName:bussinessName.trim(),
    phoneNumber:phoneNumber.trim(),
    address:address.trim()
});


const token=jwt.sign(
    {
        id:newFoodPartner._id,
    },
   process.env.JWT_SECRET
)

res.cookie("token",token,{
    httpOnly:true,
    secure:true
})
return res.status(201).json(
    {
        message:"Food partner registered successfully",
        foodPartner:{
            _id:newFoodPartner._id,
            fullName:newFoodPartner.fullName,
            email:newFoodPartner.email,
            bussinessName:newFoodPartner.bussinessName,
            phoneNumber:newFoodPartner.phoneNumber,
            address:newFoodPartner.address
        }
    }
)
}


async function foodPartnerLogin(req,res){
const {email,password}=req.body;

const foodPartner=await FoodPartnerModel.findOne({
    email:email.toLowerCase().trim()
});

if(!foodPartner){
    return res.status(400).json({message:"Invalid email or password"})
}

const isPasswordMatch=await bcrypt.compare(password,foodPartner.password);

if(!isPasswordMatch){
    return res.status(400).json({message:"Invalid email or password"})
}

const token=jwt.sign(
    {
        id:foodPartner._id,
    },
   process.env.JWT_SECRET
)

res.cookie("token",token,{
    httpOnly:true,
    secure:true
})
return res.status(200).json(
    {
        message:"Food partner logged in successfully",
        foodPartner:{
            _id:foodPartner._id,
            fullName:foodPartner.fullName,
            email:foodPartner.email,
            bussinessName:foodPartner.bussinessName,
            phoneNumber:foodPartner.phoneNumber,
            address:foodPartner.address
        }
    }
)
}

async function foodPartnerLogout(req,res){
const token=req.cookies.token;
if(!token){
    return res.status(400).json({message:"Food partner not logged in"})
}
res.clearCookie("token");
return res.status(200).json({message:"Food partner logged out successfully"})
}


module.exports={
    registerUser,
    loginUser,
    logoutUser,
    foodPartnerRegister,
    foodPartnerLogin,
    foodPartnerLogout
}

 