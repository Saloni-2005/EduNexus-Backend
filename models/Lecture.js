const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  description: String,
  videoPath: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lecture', lectureSchema);