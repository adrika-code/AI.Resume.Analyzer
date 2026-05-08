const Anthropic = require('@anthropic-ai/sdk');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildPrompt = (resumeText, jobDescription) => {
  const hasJD = jobDescription && jobDescription.trim().length > 20;

  return `You are an expert ATS (Applicant Tracking System) and career coach. Analyze the following resume${hasJD ? ' against the provided job description' : ''} and return a comprehensive JSON analysis.

RESUME:
"""
${resumeText.substring(0, 8000)}
"""

${hasJD ? `JOB DESCRIPTION:\n"""\n${jobDescription.substring(0, 3000)}\n"""` : ''}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "overallScore": <0-100 integer>,
  "atsScore": <0-100 integer>,
  "careerLevel": "<Entry Level|Junior|Mid-Level|Senior|Lead|Executive>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "matchedKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "recommendedRoles": ["<role 1>", "<role 2>", "<role 3>"],
  "improvementPlan": ["<step 1>", "<step 2>", "<step 3>"],
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<specific feedback>" },
    "summary": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "formatting": { "score": <0-100>, "feedback": "<specific feedback>" }
  }
}

Be specific, actionable, and honest. Score rigorously.`;
};

const analyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Call Claude AI
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(resume.originalText, jobDescription)
        }
      ]
    });

    const responseText = message.content[0].text;

    let analysisResult;
    try {
      // Clean response in case of any markdown wrapping
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, '\nRaw response:', responseText);
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // Save analysis to DB
    const analysis = await Analysis.create({
      user: req.user.id,
      resume: resume._id,
      jobDescription: jobDescription || '',
      result: analysisResult
    });

    // Link analysis to resume
    resume.analyses.push(analysis._id);
    await resume.save();

    // Increment user's analysis count
    await User.findByIdAndUpdate(req.user.id, { $inc: { analysisCount: 1 } });

    res.status(201).json({
      id: analysis._id,
      result: analysisResult,
      resumeName: resume.fileName,
      createdAt: analysis.createdAt
    });
  } catch (error) {
    console.error('Analysis error:', error);
    if (error.status === 429) {
      return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' });
    }
    res.status(500).json({ error: 'Error analyzing resume. Please try again.' });
  }
};

const getAnalysisHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id })
      .populate('resume', 'fileName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analysis history' });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user.id })
      .populate('resume', 'fileName uploadedAt');

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analysis' });
  }
};

module.exports = { analyzeResume, getAnalysisHistory, getAnalysisById };
