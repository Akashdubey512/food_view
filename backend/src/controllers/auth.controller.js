const Usermodel=require("../models/user.model");
const FoodPartnerModel=require("../models/foodpartner.model");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");



async function registerUser(req,res){
try{
const {fullName,email,password}=req.body;
if (
    [fullName, email, password].some(
        (field) => !field?.trim()
    )
) {
    return res.status(400).json({message:"All fields are required"})
}
const normalizedEmail = email.toLowerCase().trim();
const user = await Usermodel.findOne({ email:normalizedEmail });
const partner = await FoodPartnerModel.findOne({ email:normalizedEmail });

if (user || partner) {
    return res.status(400).json({
        message: "Email already exists"
    });
}
const hashPassword=await bcrypt.hash(password,10);
const newUser=await Usermodel.create({
    fullName:fullName.trim(),
    email:normalizedEmail,
    password:hashPassword
});
const token=jwt.sign(
    {
        id:newUser._id,
        role: 'user'
    },
   process.env.JWT_SECRET,
   {
    expiresIn:"7d"
   }
)

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
return res.status(201)
.json(
{
    message:"User registered successfully",
    account:{
      _id:newUser._id,
      role: 'user',
      fullName:newUser.fullName,
      email:newUser.email
    }
}
)
}
catch(err){
     console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}


async function loginUser(req,res){
try{
const {email,password}=req.body;

 if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
        message: "Email and password are required"
    });
}

const user=await Usermodel.findOne({
    email:email.toLowerCase().trim()
})

if(!user){
    return res.status(401).json({message:"Invalid email or password"})
}
const isPasswordMatch=await bcrypt.compare(password,user.password);
if(!isPasswordMatch){
    return res.status(401).json({message:"Invalid email or password"})
}
const token=jwt.sign(
    {
    id:user._id,
    role: 'user'
    },
    process.env.JWT_SECRET,
    {
        expiresIn:"7d"
    }
);

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

return res.status(200).json(
    {
        message:"User logged in successfully",
        account:{
            _id:user._id,
            role: 'user',
            fullName:user.fullName,
            email:user.email
        }
    }
)

}
catch(err){
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}

async function logoutUser(req,res){
try{
  res.clearCookie("token", {
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({message:"User logged out successfully"})
}catch(err){
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}

async function foodPartnerRegister(req,res){
try{
const {fullName,email,password,bussinessName,phoneNumber,address}=req.body;
if (
    [fullName, email, password, bussinessName, phoneNumber, address].some(
        (field) => !field?.trim()
    )
) {
    return res.status(400).json({message:"All fields are required"})
}
const normalizedEmail = email.toLowerCase().trim();
const user = await Usermodel.findOne({ email:normalizedEmail});
const partner = await FoodPartnerModel.findOne({ email:normalizedEmail });

if (user || partner) {
    return res.status(400).json({
        message: "Email already exists"
    });
}


const hashPassword=await bcrypt.hash(password,10);

const newFoodPartner=await FoodPartnerModel.create({
    fullName:fullName.trim(),
    email:normalizedEmail,
    password:hashPassword,
    bussinessName:bussinessName.trim(),
    phoneNumber:phoneNumber.trim(),
    address:address.trim()
});


const token=jwt.sign(
    {
        id:newFoodPartner._id,
        role: 'foodPartner'
    },
   process.env.JWT_SECRET,
   {
    expiresIn:"7d"
   }
)

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
return res.status(201).json(
    {
        message:"Food partner registered successfully",
        account:{
            _id:newFoodPartner._id,
            role: 'foodPartner',
            fullName:newFoodPartner.fullName,
            email:newFoodPartner.email,
            bussinessName:newFoodPartner.bussinessName,
            phoneNumber:newFoodPartner.phoneNumber,
            address:newFoodPartner.address
        }
    }
)
}
catch(err){
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}


async function foodPartnerLogin(req,res){
try{
const {email,password}=req.body;

if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
        message: "Email and password are required"
    });
}

const foodPartner=await FoodPartnerModel.findOne({
    email:email.toLowerCase().trim()
});

if(!foodPartner){
    return res.status(401).json({message:"Invalid email or password"})
}

const isPasswordMatch=await bcrypt.compare(password,foodPartner.password);

if(!isPasswordMatch){
    return res.status(401).json({message:"Invalid email or password"})
}

const token=jwt.sign(
    {
        id:foodPartner._id,
        role: 'foodPartner'
    },
   process.env.JWT_SECRET,
   {
    expiresIn:"7d"
   }
)

res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
return res.status(200).json(
    {
        message:"Food partner logged in successfully",
        account:{
            _id:foodPartner._id,
            role: 'foodPartner',
            fullName:foodPartner.fullName,
            email:foodPartner.email,
            bussinessName:foodPartner.bussinessName,
            phoneNumber:foodPartner.phoneNumber,
            address:foodPartner.address
        }
    }
)
}catch(err){
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}

async function foodPartnerLogout(req,res){try {
    
    res.clearCookie("token", 
        { path: '/', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === "production",
        });
    return res.status(200).json({message:"Food partner logged out successfully"})
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}
}


module.exports={
    registerUser,
    loginUser,
    logoutUser,
    foodPartnerRegister,
    foodPartnerLogin,
    foodPartnerLogout
}

 