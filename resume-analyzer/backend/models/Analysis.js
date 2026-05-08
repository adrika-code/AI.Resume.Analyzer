const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobDescription: {
    type: String,
    default: ''
  },
  result: {
    overallScore: { type: Number, min: 0, max: 100 },
    atsScore: { type: Number, min: 0, max: 100 },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    missingKeywords: [String],
    matchedKeywords: [String],
    sections: {
      contact: { score: Number, feedback: String },
      summary: { score: Number, feedback: String },
      experience: { score: Number, feedback: String },
      education: { score: Number, feedback: String },
      skills: { score: Number, feedback: String },
      formatting: { score: Number, feedback: String }
    },
    careerLevel: String,
    recommendedRoles: [String],
    improvementPlan: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
