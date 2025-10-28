const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null,'uploads/'),
  filename: (req,file,cb) => cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({ storage });

router.post('/:courseId', auth, permit('instructor'), async (req,res) => {
  const course = await Course.findById(req.params.courseId);
  if(!course) return res.status(404).json({ message: 'Course not found' });
  if(!course.instructor.equals(req.user._id) && req.user.role!=='admin') return res.status(403).json({ message: 'Forbidden' });

  const a = new Assignment({
    course: course._id,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate
  });
  await a.save();
  res.json(a);
});

router.post('/submit/:assignmentId', auth, permit('student'), upload.single('file'), async (req,res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    if(!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    const existingSubmission = await Submission.findOne({ 
      assignment: assignment._id, 
      student: req.user._id 
    });
    
    if(existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }
    
    const submission = new Submission({
      assignment: assignment._id,
      student: req.user._id,
      filePath: req.file ? req.file.path.replace(/\\/g, "/") : null
    });
    await submission.save();
    
    const certificate = new Certificate({
      student: req.user._id,
      course: assignment.course._id,
      assignment: assignment._id,
      submission: submission._id,
      certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
  await certificate.save();
    
    res.json({ 
      submission, 
      certificate: {
        id: certificate._id,
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt
      },
      message: 'Assignment submitted successfully! Certificate generated.'
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
});

router.get('/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('course', 'title instructor')
      .populate('submissions', 'student submittedAt');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
});

router.get('/:assignmentId/submissions', auth, permit('instructor','admin'), async (req,res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course', 'title instructor');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (assignment.course.instructor.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }
    
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json({
      assignment: {
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        course: assignment.course.title
      },
      submissions: submissions.map(sub => ({
        id: sub._id,
        student: sub.student,
        filePath: sub.filePath,
        submittedAt: sub.submittedAt,
        grade: sub.grade,
        feedback: sub.feedback,
        isGraded: sub.grade !== undefined && sub.grade !== null
      }))
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

router.put('/submissions/:submissionId/grade', auth, permit('instructor','admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Grade is required' });
    }
    
    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: 'Grade must be between 0 and 100' });
    }
    
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment')
      .populate('student', 'name email');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    const assignment = await Assignment.findById(submission.assignment._id).populate('course', 'instructor');
    
    if (assignment.course.instructor.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }
    
    submission.grade = grade;
    submission.feedback = feedback || '';
    await submission.save();
    
    const cacheKey = `user:${submission.student._id}:dashboard:stats:student`;
    await cache.del(cacheKey);
    
    res.json({
      message: 'Submission graded successfully',
      submission: {
        id: submission._id,
        student: submission.student,
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Error grading submission' });
  }
});

router.get('/instructor/assignments', auth, permit('instructor','admin'), async (req, res) => {
  try {
    const createdCourses = await Course.find({ instructor: req.user._id });
    const courseIds = createdCourses.map(course => course._id);
    
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();

    const submissionCounts = await Promise.all(assignments.map(async (assignment) => {
      const total = await Submission.countDocuments({ assignment: assignment._id });
      const graded = await Submission.countDocuments({ 
        assignment: assignment._id,
        grade: { $exists: true, $ne: null }
      });
      return {
        assignmentId: assignment._id,
        total,
        graded
      };
    }));

    const assignmentsWithStats = assignments.map(assignment => {
      const stats = submissionCounts.find(s => s.assignmentId.toString() === assignment._id.toString());
      return {
        ...assignment,
        submissionStats: {
          total: stats?.total || 0,
          graded: stats?.graded || 0,
          pending: (stats?.total || 0) - (stats?.graded || 0)
        }
      };
    });

    res.json(assignmentsWithStats);
  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

router.get('/instructor/submissions', auth, permit('instructor','admin'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    
    const createdCourses = await Course.find({ instructor: req.user._id });
    const courseIds = createdCourses.map(course => course._id);
    
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();
    
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name email')
      .populate('assignment', 'title dueDate')
      .sort({ submittedAt: -1 });
    
    const submissionsWithDetails = submissions.map(sub => ({
      id: sub._id,
      student: sub.student,
      assignment: sub.assignment,
      course: assignments.find(a => a._id.toString() === sub.assignment._id.toString())?.course,
      filePath: sub.filePath,
      submittedAt: sub.submittedAt,
      grade: sub.grade,
      feedback: sub.feedback,
      isGraded: sub.grade !== undefined && sub.grade !== null,
      isLate: sub.submittedAt > sub.assignment.dueDate
    }));
    
    res.json(submissionsWithDetails);
  } catch (error) {
    console.error('Error fetching instructor submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

router.get('/user/assignments', auth, async (req,res) => {
  try {
    const Course = require('../models/Course');
    
    const enrolledCourses = await Course.find({ students: req.user._id });
    const courseIds = enrolledCourses.map(course => course._id);
    
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .sort({ dueDate: 1 });
    
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ 
      assignment: { $in: assignmentIds }, 
      student: req.user._id 
    });
    
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignment.toString()] = sub;
    });
    
    const assignmentsWithStatus = assignments.map(assignment => ({
      ...assignment.toObject(),
      isSubmitted: !!submissionMap[assignment._id.toString()],
      submission: submissionMap[assignment._id.toString()] || null
    }));
    
    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

router.get('/user/certificates', auth, permit('student'), async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title instructor')
      .populate('assignment', 'title')
      .populate('submission', 'submittedAt')
      .sort({ issuedAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
});

module.exports = router;