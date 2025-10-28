const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  certificateNumber: { type: String, unique: true },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['issued', 'revoked'], default: 'issued' }
});

certificateSchema.index({ student: 1 });
certificateSchema.index({ course: 1 });
certificateSchema.index({ certificateNumber: 1 });

certificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await this.constructor.countDocuments();
      this.certificateNumber = `CERT-${Date.now()}-${count + 1}`;
    } catch (error) {
      this.certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
