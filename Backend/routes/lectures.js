const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/:courseId', auth, permit('instructor'), upload.single('video'), async (req,res) => {
  const course = await Course.findById(req.params.courseId);
  if(!course) return res.status(404).json({ message: 'Course not found' });
  if(!course.instructor.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const lecture = new Lecture({
    course: course._id,
    title: req.body.title,
    description: req.body.description,
    videoPath: req.file ? req.file.path.replace(/\\/g, "/") : null
  });
  await lecture.save();
  res.json(lecture);
});

router.get('/course/:courseId', auth, async (req,res) => {
  const lectures = await Lecture.find({ course: req.params.courseId }).sort({ uploadedAt: 1 });
  res.json(lectures);
});

module.exports = router;