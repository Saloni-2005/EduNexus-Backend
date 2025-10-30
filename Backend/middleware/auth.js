const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const auth = async (req,res,next) => {
  const token = req.cookies?.jwt_token;
  if(!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if(!req.user) return res.status(401).json({ message: 'Invalid token' });
    next();
  } catch(err){
    res.status(401).json({ message: 'Token not valid' });
  }
};

module.exports = auth;