const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const dotenv = require('dotenv');
dotenv.config();

router.post('/register', catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return next(new AppError('Name, email, and password are required', 400));
  }
  
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const user = new User({ name, email, password, role });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY || '7d' });
  
  res.status(201).json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  });
}));

router.post('/login', catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY || '7d' });
  
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    } 
  });
}));

module.exports = router;