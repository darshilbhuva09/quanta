const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const driveServices = require('../google-drive_services/driveServices')

// @desc    Register a user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  console.log('Registration attempt:', { username, email, passwordLength: password ? password.length : 0 });

  try {
    // Check if user already exists
    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      console.log('Email already in use:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
      console.log('Username already taken:', username);
      return res.status(400).json({ message: 'Username already taken' });
    }


    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    console.log('Saving new user to database...');
    await user.save();
    console.log('User saved successfully:', user._id);

     //create folder in drive

     const folderResponse = await driveServices.createFolder(username);
     folderId = folderResponse.folderId;
     console.log("folderResponse"+ folderResponse)
     console.log(folderResponse.folderId)

    if (!folderResponse || !folderResponse.folderId) {
      return res.status(500).json({ message: "User registered, but folder creation failed" });
    }
    //save folder id in datbase
    user.folderId = folderId;
    try{
      user.set("folderId" , folderId);
      await user.save();  
    }catch(error){
      return res.status(500).json({message : "errror in user folder id save"})
    }
  
    // Generate JWT
    const payload = {
      user: {
        id: user.id
      }
    };

     
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'quantasharesecret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        console.log('JWT token generated successfully');
        res.json({ token });
      }
    );

  


  } catch (err) {
    console.log(error)
    console.error('Registration error:', err.message);
    // More descriptive error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: Object.values(err.errors).map(e => e.message) });
    } else if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error', field: Object.keys(err.keyPattern)[0] });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  console.log('Login attempt for user:', username);

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'quantasharesecret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        console.log('Login successful, JWT token generated for user:', user.username);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/user
exports.getUser = async (req, res) => {
  try {
    console.log('Getting user data for ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User data retrieved successfully');
    res.json(user);
  } catch (err) {
    console.error('Error retrieving user data:', err.message);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
};

// @desc    Test authentication
// @route   GET /api/auth/test
exports.testAuth = (req, res) => {
  res.json({ message: 'Authentication is working', user: req.user.id });
};