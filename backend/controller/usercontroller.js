const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.SignUp  = async(req,res)=>{
    const { name, email, password } = req.body;
    console.log(name,email,password)

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create new user
      user = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10) // Hash the password
      });
  
   const NewUser =    await user.save();
   console.log(NewUser);
   
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
}
exports.SignIn = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session data
    req.session.userName = user.name;
    req.session.userId = user._id;

    // Save session and ensure it is saved before responding
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Generate token after the session is saved
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        'yourSecretKey', 
        { expiresIn: '1h' }
      );

      // Send response
      res.status(200).json({ 
        message: 'Sign-in successful', 
        token, 
        user: { email: user.email, name: user.name } 
      });
    });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
