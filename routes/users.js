const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cache = require('../utils/cache');
const dotenv = require('dotenv');
dotenv.config();

router.get('/', auth, permit('admin'), catchAsync(async (req, res, next) => {
  const cacheKey = 'users:all';
  
  const cachedUsers = await cache.get(cacheKey);
  if (cachedUsers) {
    return res.json(cachedUsers);
  }
  
  const users = await User.find().select('-password').lean();
  
  await cache.set(cacheKey, users, 300);
  
  res.json(users);
}));

router.get('/:id', auth, permit('admin'), catchAsync(async (req, res, next) => {
  const cacheKey = `user:${req.params.id}`;
  
  const cachedUser = await cache.get(cacheKey);
  if (cachedUser) {
    return res.json(cachedUser);
  }
  
  const user = await User.findById(req.params.id).select('-password').lean();
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  await cache.set(cacheKey, user, 600);
  
  res.json(user);
}));

router.put('/:id', auth, permit('admin'), catchAsync(async (req, res, next) => {
  const { role } = req.body;
  
  if (!role || !['student', 'instructor', 'admin'].includes(role)) {
    return next(new AppError('Valid role is required', 400));
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  user.role = role;
  await user.save();
  
  await cache.del(`user:${req.params.id}`);
  await cache.del('users:all');
  
  res.json(user);
}));

router.delete('/:id', auth, permit('admin'), catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  await cache.del(`user:${req.params.id}`);
  await cache.del('users:all');
  
  res.json({ message: 'User deleted successfully' });
}));

router.get('/dashboard/stats', auth, catchAsync(async (req, res, next) => {
  const Course = require('../models/Course');
  const Assignment = require('../models/Assignment');
  const Submission = require('../models/Submission');
  const Certificate = require('../models/Certificate');
  
  const cacheKey = `user:${req.user._id}:dashboard:stats:${req.user.role}`;
  
  const cachedStats = await cache.get(cacheKey);
  if (cachedStats && !req.query.refresh) {
    return res.json(cachedStats);
  }
  
  let stats = {};
  
  if (req.user.role === 'student') {
    const enrolledCourses = await Course.find({ students: req.user._id })
      .populate('instructor', 'name')
      .lean();
    
    const courseIds = enrolledCourses.map(course => course._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();
    
    const submissions = await Submission.find({ student: req.user._id }).lean();
    const certificates = await Certificate.find({ student: req.user._id }).lean();
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();
    
    const upcomingAssignments = assignments.filter(assignment => 
      assignment.dueDate && 
      new Date(assignment.dueDate) <= sevenDaysFromNow &&
      new Date(assignment.dueDate) > now
    );
    
    const submittedAssignmentIds = submissions.map(sub => sub.assignment.toString());
    const pendingAssignments = assignments.filter(assignment => 
      !submittedAssignmentIds.includes(assignment._id.toString())
    );
    
    stats = {
      role: 'student',
      activeCourses: enrolledCourses.length,
      totalAssignments: assignments.length,
      submittedAssignments: submissions.length,
      pendingAssignments: pendingAssignments.length,
      upcomingDeadlines: upcomingAssignments.length,
      certificates: certificates.length,
      recentCourses: enrolledCourses.slice(0, 3).map(course => ({
        id: course._id,
        title: course.title,
        progress: Math.floor(Math.random() * 100),
        instructor: course.instructor?.name || 'Unknown'
      })),
      upcomingDeadlines: upcomingAssignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        course: assignment.course?.title || 'Unknown Course'
      }))
    };
  } else if (req.user.role === 'instructor') {
    const createdCourses = await Course.find({ instructor: req.user._id })
      .populate('students', 'name')
      .lean();
    
    const courseIds = createdCourses.map(course => course._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();
    
    const totalStudents = createdCourses.reduce((sum, course) => sum + course.students.length, 0);
    
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } }).lean();
    const pendingSubmissions = submissions.filter(sub => sub.grade === undefined || sub.grade === null).length;
    
    const recentCourses = createdCourses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    stats = {
      role: 'instructor',
      createdCourses: createdCourses.length,
      totalAssignments: assignments.length,
      totalStudents: totalStudents,
      pendingSubmissions: pendingSubmissions,
      averageStudentsPerCourse: createdCourses.length > 0 ? Math.round(totalStudents / createdCourses.length) : 0,
      recentCourses: recentCourses.map(course => ({
        id: course._id,
        title: course.title,
        studentCount: course.students.length,
        createdAt: course.createdAt
      })),
      courseStats: createdCourses.map(course => ({
        id: course._id,
        title: course.title,
        studentCount: course.students.length,
        assignmentCount: assignments.filter(a => a.course._id.toString() === course._id.toString()).length
      }))
    };
  } else if (req.user.role === 'admin') {
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    
    const recentCourses = await Course.find()
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    stats = {
      role: 'admin',
      totalCourses,
      totalUsers,
      totalAssignments,
      totalSubmissions,
      recentCourses: recentCourses.map(course => ({
        id: course._id,
        title: course.title,
        instructor: course.instructor?.name || 'Unknown',
        studentCount: course.students.length,
        createdAt: course.createdAt
      }))
    };
  }
  
  await cache.set(cacheKey, stats, 300);
  
  res.json(stats);
}));

module.exports = router;