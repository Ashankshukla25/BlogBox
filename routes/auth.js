const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_Secret = "this is a sample secret key 56789";

//signup post 
router.post('/signup', async(req,res)=>{
    const{firstname, lastname, email, username, password} = req.body;

    //all fields are required
    if(!firstname || !lastname || !email || !username || !password){
        return res.status(400).json({message: "All fields are required"});
    }

    try{
        const existingUser = await User.findOne({$or:[{email}, {username}]});
        if(existingUser){
            return res.status(400).json({message:"User aready exists"});
        }

        //hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //create new user
        const user = new User({
            firstname, lastname, email, username, password: hashedPassword
        });

        const savedUser = await user.save();
        
        //create jwt token
        const token = jwt.sign({id: savedUser.id, username: savedUser.username}, JWT_Secret,{expiresIn: '1h'});
        res.status(201).json({message: "User created successfully", user: {id: savedUser._id, username: savedUser.username, email: savedUser.email}, token})
    } catch (err){
        console.log("SignUp error:", err);
        res.status(500).json({message: "Internal server error"});
    }
});


//login routes 

router.post('/signin', async(req,res)=>{
    const {credential, password} = req.body;
    if(!credential || !password){
        return res.status(400).json({message: "All fields are required"});
    }
    try{
        const user = await User.findOne({$or:[ {email: credential.toLowerCase()}, {username: credential}]});
        if(!user){
            return res.status(400).json({message: "User does not exist"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }

        //create jwt token
        const token = jwt.sign({id: user.id, username: user.username}, JWT_Secret, {expiresIn: '1h'});
        res.status(200).json({
            message: "Login successful", 
            user: {
                id: user._id, 
                username: user.username, 
                email: user.email,
                firstname: user.firstname
            }, 
            token
        });
    } catch(err){
        console.log("Login error:", err);
        res.status(500).json({message: "Internal server errorr"});
    }

});

module.exports = router;
