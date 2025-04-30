const express = require('express');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');
const JWT_Secret = "this is a sample secret key 56789"; // Must match the one in auth.js
const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_Secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

router.get('/test-route', (req, res) => {
    console.log("Test route hit");
    res.send("Test route working");
});

//get all blogs from the db
router.get('/', async(req,res)=>{
    try{
        const blogs = await Blog.find().sort({createdAt:-1});
        res.json(blogs);
    } catch(err){
        res.status(500).json({message: err.message});
    }
});

//gets a single blog by id 
router.get('/:id', async(req,res)=>{
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'});
        }
        res.json(blog);
    } catch (err){
        res.status(500).json({message: err.message});
    }
});


//post a new blog
router.post('/', authenticateToken, async(req, res) => {
  try {
    const { title, description, body } = req.body;
    
    // Create new blog with author from token
    const blog = new Blog({
      title,
      description,
      body,
      author: req.user.id  // This comes from the authenticateToken middleware
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to create blog' });
  }
});

//update a blog
router.put('/:id', async(req,res)=>{
    const {title, description, body}=req.body;
    try{
        const blog = await
        Blog.findByIdAndUpdate(req.params.id, req.body, {new:true});
            if(!blog){
               return res.status(404).json({messsage: 'Blog not found'});
            }
            res.json(blog);
    } catch(err){
        res.status(400).json({message: err.message});
    }
});

//delete a blog
router.delete('/:id', async(req, res)=>{
    try{
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'});
        }
        res.json({message: 'Blog deleted'});
    } catch(err){
        res.status(500).json({message: err.message});
    }

});



//export the router
module.exports= router;