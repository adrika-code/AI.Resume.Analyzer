const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Only PDF and TXT files are supported' });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from the file. Please check the file.' });
    }

    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      originalText: extractedText.trim(),
      fileSize: req.file.size,
    });

    res.status(201).json({
      id: resume._id,
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      uploadedAt: resume.uploadedAt,
      textLength: extractedText.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error processing resume file' });
  }
};

const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('-originalText')
      .sort({ uploadedAt: -1 })
      .populate('analyses', 'result.overallScore createdAt');

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching resumes' });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await Analysis.deleteMany({ resume: resume._id });
    await resume.deleteOne();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting resume' });
  }
};

module.exports = { uploadResume, getUserResumes, deleteResume };
