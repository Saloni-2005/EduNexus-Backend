const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const discussionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Discussion = mongoose.model('Discussion', discussionSchema);

router.post('/:courseId', auth, async (req,res) => {
  const d = new Discussion({ course: req.params.courseId, user: req.user._id, message: req.body.message });
  await d.save();
  res.json(d);
});

router.get('/:courseId', auth, async (req,res) => {
  const list = await Discussion.find({ course: req.params.courseId }).populate('user','name').sort({ createdAt: 1 });
  res.json(list);
});

module.exports = router;