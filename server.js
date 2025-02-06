// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set static folder for public assets
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware (using MongoDB to store sessions)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Multer setup for file uploads (profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Prepend Date.now() to make filename unique
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Import the User model
const User = require('./models/User');

// -----------------------
// ROUTES & MIDDLEWARE
// -----------------------

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Registration form
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
app.post('/register', upload.single('profilePic'), async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  let profilePicPath = req.file ? '/uploads/' + req.file.filename : '';

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    return res.render('register', { error: 'Please fill in all fields.' });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'Email is already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user with default role 'user'
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePic: profilePicPath,
      role: 'user'  // You can later change this for role-based access control
    });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

// Login form
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // Check if account is locked (for additional security)
    if (user.isLocked) {
      return res.render('login', { error: 'Account is locked due to multiple failed login attempts.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = user.failedLoginAttempts + 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
      }
      await user.save();
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    await user.save();

    // Save user data in session
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic
    };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

// Dashboard (Protected Route)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Example of a CRUD operation route (e.g., editing user profile)
app.get('/edit-profile', ensureAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('edit-profile', { user, error: null });
});

app.post('/edit-profile', ensureAuthenticated, upload.single('profilePic'), async (req, res) => {
  const { username, email } = req.body;
  let profilePicPath = req.file ? '/uploads/' + req.file.filename : req.session.user.profilePic;
  
  if (!username || !email) {
    return res.render('edit-profile', { user: req.session.user, error: 'All fields are required.' });
  }
  
  try {
    const updatedUser = await User.findByIdAndUpdate(req.session.userId, { username, email, profilePic: profilePicPath }, { new: true });
    // Update session info
    req.session.user.username = updatedUser.username;
    req.session.user.email = updatedUser.email;
    req.session.user.profilePic = updatedUser.profilePic;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('edit-profile', { user: req.session.user, error: 'Update failed. Try again.' });
  }
});

// -----------------------
// Start the Server
// -----------------------
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
