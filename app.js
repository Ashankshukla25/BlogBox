const express = require('express');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogs');
const authRoutes = require('./routes/auth');
const Blog = require('./models/Blog'); // Make sure to import the Blog model
const jwt = require('jsonwebtoken');
const JWT_Secret = "this is a sample secret key 56789"; // Must match the one in auth.js

const app = express();

app.use(express.static('public'));
// middleware to parseJSON and urlencoded data
app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());

// view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Connect to MongoDB
const dbURI = 'mongodb+srv://ashank747:ashank2004@cluster0.s9gkp.mongodb.net/BlogBox_DB?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));
const db = mongoose.connection;
db.on('error', (err) => console.log(err));
db.once('open', () => console.log('Connected to MongoDB'));

// Add authentication middleware
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

// Route for homepage/explore page
app.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('author');
    res.render('explore', { blogs });
  } catch (err) {
    console.error(err);
    res.render('explore', { blogs: [], error: 'Failed to fetch blogs' });
  }
});

// Alternate route that redirects to home
app.get('/explore', (req, res) => {
  res.redirect('/');
});

app.get('/signin', (req, res) => {
  res.render('signin');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// First, define your specific routes
app.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author');
    
    if (!blog) {
      return res.status(404).render('blog-detail', { blog: null });
    }
    
    res.render('blog-detail', { blog });
  } catch (err) {
    console.error(err);
    res.status(500).render('blog-detail', { blog: null });
  }
});

app.get('/new-blog', (req, res) => {
  res.render('newblog');
});

// Route for dashboard (after login)
app.get('/dashboard', (req, res) => {
  res.redirect('/');  // Redirect to explore page
});

// Then register the routers
app.use('/blogs', blogRoutes);
app.use('/auth', authRoutes);


