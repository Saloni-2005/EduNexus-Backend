const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const Course = require('../models/Course');
const catchAsync = require('../utils/catchAsync');

router.get('/students', auth, permit('instructor'), catchAsync(async (req, res) => {
  try {
    // Get all courses where the current user is the instructor
    const courses = await Course.find({ instructor: req.user._id })
      .populate('students', 'name email')
      .lean();

    // Extract unique students from all courses
    const uniqueStudents = new Map();
    courses.forEach(course => {
      course.students.forEach(student => {
        uniqueStudents.set(student._id.toString(), student);
      });
    });

    // Convert Map values to array
    const students = Array.from(uniqueStudents.values());

    res.json({
      total: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching instructor students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
}));

module.exports = router;