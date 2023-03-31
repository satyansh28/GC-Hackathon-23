const express = require("express");
require("dotenv").config();
const cookieParser = require('cookie-parser');

const authRoutes = require("./routes/authRoutes");
const cors=(req,res,next)=>{
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND || "localhost");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials",true);
  res.header("Access-Control-Expose-Headers","set-cookie");
  next();
}
const app = express();
app.use(cookieParser());
app.use(cors);
app.use(express.json({ limit: "10kb" }));

app.options("*",(req,res)=>{res.status(200).send()});
app.use("/auth", authRoutes);
app.use((err,req,res,next)=>{
  if(err)
  {
    console.log(err);
    res.status(400).send("Congratulations little fellow,you created an uncaught exception! Not enough to hack the server but atleast you can pat yourself on the back!");
  }
})
module.exports = app;