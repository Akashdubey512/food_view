require("dotenv").config();
const app=require("./src/app");
const express=require("express");
const connectDB=require("./src/db/db");
const dns=require("dns");
dns.setServers(['8.8.8.8', '8.8.4.4'])

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



