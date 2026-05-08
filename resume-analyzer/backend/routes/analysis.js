const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildAnalysisPrompt = (resumeText, jobTitle, jobDescription) => {
  return `You are an expert resume analyzer and career coach with 15+ years of experience in HR and recruitment across top tech companies. Analyze the following resume thoroughly.

RESUME TEXT:
${resumeText}

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}` : ''}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Perform a comprehensive analysis and return a JSON response with EXACTLY this structure (no markdown, just raw JSON):

{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100, ATS compatibility score>,
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<specific feedback>" },
    "summary": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "projects": { "score": <0-100>, "feedback": "<specific feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>",
    "<actionable suggestion 5>"
  ],
  "keywords": {
    "found": ["<keyword 1>", "<keyword 2>"],
    "missing": ["<important missing keyword 1>", "<important missing keyword 2>"]
  },
  "jobMatch": {
    "percentage": <0-100 or null if no job description>,
    "matchedSkills": ["<skill 1>"],
    "missingSkills": ["<skill 1>"]
  },
  "detailedFeedback": "<2-3 paragraph comprehensive feedback with specific, actionable advice>"
}

Be specific, honest, and actionable. Focus on quantifiable achievements, ATS optimization, and industry-relevant improvements.`;
};

// @route   POST /api/analysis/analyze/:resumeId
router.post('/analyze/:resumeId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    if (resume.status === 'analyzing') {
      return res.status(400).json({ success: false, message: 'Analysis already in progress' });
    }

    // Update status to analyzing
    resume.status = 'analyzing';
    await resume.save();

    const prompt = buildAnalysisPrompt(
      resume.extractedText,
      req.body.jobTitle || resume.targetJobTitle,
      req.body.jobDescription || resume.targetJobDescription
    );

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text.trim();
    
    // Parse JSON response
    let analysisData;
    try {
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleanJson);
    } catch (parseError) {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // Save analysis to resume
    resume.analysis = {
      ...analysisData,
      analyzedAt: new Date()
    };
    resume.status = 'completed';
    if (req.body.jobTitle) resume.targetJobTitle = req.body.jobTitle;
    if (req.body.jobDescription) resume.targetJobDescription = req.body.jobDescription;
    
    await resume.save();

    res.json({ success: true, message: 'Analysis completed', analysis: resume.analysis, resumeId: resume._id });
  } catch (error) {
    await Resume.findByIdAndUpdate(req.params.resumeId, { status: 'failed' });
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: 'Analysis failed: ' + error.message });
  }
});

// @route   GET /api/analysis/:resumeId
router.get('/:resumeId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id })
      .select('analysis status originalName targetJobTitle');
    
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    
    res.json({ success: true, analysis: resume.analysis, status: resume.status, resumeName: resume.originalName });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analysis/stats/overview
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id, status: 'completed' }).select('analysis uploadedAt originalName');
    
    if (resumes.length === 0) {
      return res.json({ success: true, stats: null, message: 'No analyzed resumes yet' });
    }

    const avgScore = resumes.reduce((sum, r) => sum + (r.analysis?.overallScore || 0), 0) / resumes.length;
    const avgAts = resumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / resumes.length;
    const bestResume = resumes.reduce((best, r) => 
      (r.analysis?.overallScore || 0) > (best.analysis?.overallScore || 0) ? r : best
    );

    res.json({
      success: true,
      stats: {
        totalAnalyzed: resumes.length,
        avgScore: Math.round(avgScore),
        avgAtsScore: Math.round(avgAts),
        bestScore: bestResume.analysis?.overallScore,
        bestResumeName: bestResume.originalName,
        recentScores: resumes.slice(-5).map(r => ({
          name: r.originalName,
          score: r.analysis?.overallScore,
          date: r.uploadedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
