const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100 },
  atsScore: { type: Number, min: 0, max: 100 },
  sections: {
    contact: { score: Number, feedback: String },
    summary: { score: Number, feedback: String },
    experience: { score: Number, feedback: String },
    education: { score: Number, feedback: String },
    skills: { score: Number, feedback: String },
    projects: { score: Number, feedback: String }
  },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  keywords: {
    found: [String],
    missing: [String]
  },
  jobMatch: {
    percentage: Number,
    matchedSkills: [String],
    missingSkills: [String]
  },
  detailedFeedback: String,
  analyzedAt: { type: Date, default: Date.now }
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: Number,
  fileType: String,
  extractedText: {
    type: String,
    required: true
  },
  targetJobTitle: String,
  targetJobDescription: String,
  analysis: analysisSchema,
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
