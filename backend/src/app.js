const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter=require("./routes/authrouter");
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth",authRouter);


module.exports = app;