const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filePath: String,
  submittedAt: { type: Date, default: Date.now },
  grade: Number,
  feedback: String
});

submissionSchema.index({ assignment: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);