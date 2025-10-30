const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const Course = require('../models/Course');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cache = require('../utils/cache');
const dotenv = require('dotenv');
dotenv.config();

router.get('/', auth, catchAsync(async (req, res, next) => {
  const { search, category, sort, level, page = 1, limit = 10 } = req.query;
  
  const cacheKey = `courses:${JSON.stringify({ search, category, sort, level, page, limit })}`;
  
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  
  let query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  
  if (level && level !== 'All Levels') {
    query.level = level;
  }
  
  let sortOption = {};
  switch (sort) {
    case 'Newest':
      sortOption = { createdAt: -1 };
      break;
    case 'Oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'Popular':
      sortOption = { students: -1 };
      break;
    case 'Rating':
      sortOption = { averageRating: -1 };
      break;
    case 'Title':
      sortOption = { title: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const courses = await Course.find(query)
    .populate('instructor','name email')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
    
  const total = await Course.countDocuments(query);
  
  const result = {
    courses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalCourses: total,
      hasNext: skip + courses.length < total,
      hasPrev: parseInt(page) > 1
    }
  };
  
  await cache.set(cacheKey, result, 300);
    
  res.json(result);
}));

router.get('/mine', auth, permit('instructor','admin'), catchAsync(async (req, res, next) => {
  const cacheKey = `user:${req.user._id}:courses:created`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const courses = await Course.find({ instructor: req.user._id })
    .populate('instructor','name email')
    .lean();

  await cache.set(cacheKey, courses, 300);
  res.json(courses);
}));

router.get('/:id', auth, catchAsync(async (req, res, next) => {
  const cacheKey = `course:${req.params.id}`;
  
  const cachedCourse = await cache.get(cacheKey);
  if (cachedCourse) {
    return res.json(cachedCourse);
  }
  
  const course = await Course.findById(req.params.id)
    .populate('instructor','name email')
    .lean();
    
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  await cache.set(cacheKey, course, 600);
  
  res.json(course);
}));

router.post('/', auth, permit('instructor'), catchAsync(async (req, res, next) => {
  const { title, description, category, level, duration, price } = req.body;
  
  if (!title || !description) {
    return next(new AppError('Title and description are required', 400));
  }
  
  const course = new Course({ 
    title, 
    description, 
    category,
    level,
    duration,
    price,
    instructor: req.user._id 
  });
  
  await course.save();
  
  await cache.delPattern('courses:*');
  
  res.status(201).json(course);
}));

router.put('/:id', auth, permit('instructor','admin'), catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
    return next(new AppError('Not authorized to edit this course', 403));
  }
  
  Object.assign(course, req.body);
  await course.save();
  
  await cache.del(`course:${req.params.id}`);
  await cache.delPattern('courses:*');
  
  res.json(course);
}));

router.delete('/:id', auth, permit('instructor','admin'), catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (req.user.role !== 'admin' && !course.instructor.equals(req.user._id)) {
    return next(new AppError('Not authorized to delete this course', 403));
  }
  
  await Course.findByIdAndDelete(req.params.id);
  
  await cache.del(`course:${req.params.id}`);
  await cache.delPattern('courses:*');
  
  res.json({ message: 'Course deleted successfully' });
}));

router.post('/:id/enroll', auth, permit('student'), catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (course.students.includes(req.user._id)) {
    return next(new AppError('You are already enrolled in this course', 400));
  }
  
  course.students.push(req.user._id);
  await course.save();
  
  await cache.del(`course:${req.params.id}`);
  await cache.delPattern('courses:*');
  
  res.json({ message: 'Successfully enrolled in course' });
}));

router.get('/user/enrolled', auth, catchAsync(async (req, res, next) => {
  const cacheKey = `user:${req.user._id}:enrolled`;
  
  const cachedCourses = await cache.get(cacheKey);
  if (cachedCourses) {
    return res.json(cachedCourses);
  }
  
  const courses = await Course.find({ students: req.user._id })
    .populate('instructor','name email')
    .lean();
  
  await cache.set(cacheKey, courses, 300);
  
  res.json(courses);
}));

router.get('/:id/stats', auth, catchAsync(async (req, res, next) => {
  const cacheKey = `course:${req.params.id}:stats`;
  
  const cachedStats = await cache.get(cacheKey);
  if (cachedStats) {
    return res.json(cachedStats);
  }
  
  const course = await Course.findById(req.params.id).populate('students');
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  const stats = {
    enrollmentCount: course.students.length,
    averageRating: course.averageRating,
    totalReviews: course.totalRatings,
    duration: course.duration,
    category: course.category,
    level: course.level,
    price: course.price,
    isNew: Date.now() - new Date(course.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
  };
  
  await cache.set(cacheKey, stats, 600);
  
  res.json(stats);
}));

router.get('/:id/progress', auth, catchAsync(async (req, res, next) => {
  const cacheKey = `user:${req.user._id}:course:${req.params.id}:progress`;
  
  const cachedProgress = await cache.get(cacheKey);
  if (cachedProgress) {
    return res.json(cachedProgress);
  }
  
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (!course.students.includes(req.user._id)) {
    return next(new AppError('You must be enrolled in this course to view progress', 403));
  }
  
  const progress = Math.floor(Math.random() * 100);
  
  const result = { progress };
  
  await cache.set(cacheKey, result, 300);
  
  res.json(result);
}));

router.post('/:id/rate', auth, catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }
  
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  if (!course.students.includes(req.user._id)) {
    return next(new AppError('You must be enrolled in this course to rate it', 403));
  }
  
  const existingRating = course.ratings.find(r => r.user.toString() === req.user._id.toString());
  if (existingRating) {
    return next(new AppError('You have already rated this course', 400));
  }
  
  course.ratings.push({
    user: req.user._id,
    rating: rating,
    review: review
  });
  
  course.calculateAverageRating();
  await course.save();
  
  await cache.del(`course:${req.params.id}`);
  await cache.del(`course:${req.params.id}:stats`);
  await cache.delPattern('courses:*');
  
  res.json({ 
    message: 'Rating submitted successfully', 
    averageRating: course.averageRating,
    totalRatings: course.totalRatings
  });
}));

router.get('/:id/ratings', auth, catchAsync(async (req, res, next) => {
  const cacheKey = `course:${req.params.id}:ratings`;
  
  const cachedRatings = await cache.get(cacheKey);
  if (cachedRatings) {
    return res.json(cachedRatings);
  }
  
  const course = await Course.findById(req.params.id)
    .populate('ratings.user', 'name email')
    .select('ratings averageRating totalRatings')
    .lean();
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  
  const result = {
    ratings: course.ratings,
    averageRating: course.averageRating,
    totalRatings: course.totalRatings
  };
  
  await cache.set(cacheKey, result, 600);
  
  res.json(result);
}));

module.exports = router;