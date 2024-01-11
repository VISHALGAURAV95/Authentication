import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


mongoose.connect("mongodb+srv://gvvishal95:Vishal%406462@cluster0.nog0za5.mongodb.net/",{
      dbName:"backend",
}).then(()=>console.log("database connected")).catch((e)=>console.log(e));


const UsersSchema=new mongoose.Schema({
      name:String,
      email:String,
      password:String,
});


const Users=mongoose.model("Users",UsersSchema);
const app= express();

// Using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
//Setting up a View Engine
app.set("view engine", "ejs");//it is important as we have to use the ejs library 


const Isauthenticated= async (req,res,next)=>{
      const token =req.cookies.token;
      if(token){
            const decoded= jwt.verify(token,"sdjasdbajsdbjasd");
            console.log(decoded);
            req.user= await Users.findById(decoded._id)
      next();
      }
      else{
       res.render("login");
      }
};


app.get("/",Isauthenticated,(req,res)=>{
          res.render("logout",{name:req.user.name});

})

app.get("/login", (req, res) => {
      res.render("login");
    });
    

app.get("/register", (req, res) => {
      res.render("register");
    });


app.post("/login", async (req, res) => {
      const { email, password } = req.body;
    
      let user = await Users.findOne({ email });
    
      if (!user) return res.redirect("/register");
    
      const isMatch = await bcrypt.compare(password, user.password);
    
      if (!isMatch)
        return res.render("login", { email, message: "Incorrect Password" });
    
      const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");
    
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
      });
      res.redirect("/");
    });

    app.post("/register", async (req, res) => {
      const { name, email, password } = req.body;
    
      let user = await Users.findOne({ email });
      if (user) {
        return res.redirect("/login");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
    
      user = await Users.create({
        name,
        email,
        password: hashedPassword,
      });
    
      const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");
    
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
      });
      res.redirect("/");
    });


    app.get("/logout", (req, res) => {
      res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
      res.redirect("/");
    });
    
    app.listen(5000, () => {
      console.log("Server is working");
    });




