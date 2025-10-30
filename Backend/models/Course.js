const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, enum: ['Web Development', 'Data Science', 'Design', 'Programming', 'Business', 'Marketing'], default: 'Programming' },
  duration: { type: String, default: '8h' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, default: 0 },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ students: 1 });
courseSchema.index({ price: 1 });

courseSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('Course', courseSchema);