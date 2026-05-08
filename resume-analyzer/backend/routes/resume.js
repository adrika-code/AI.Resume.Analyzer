const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const User = require('../models/User');

// Multer config - memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, TXT files are allowed'));
  }
});

// Extract text from file buffer
const extractText = async (buffer, mimetype, originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  
  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (ext === '.txt') {
    return buffer.toString('utf-8');
  }
  throw new Error('Unsupported file format');
};

// @route   POST /api/resume/upload
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const extractedText = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract sufficient text from the file' });
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: `resume_${Date.now()}${path.extname(req.file.originalname)}`,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase().slice(1),
      extractedText: extractedText.trim(),
      targetJobTitle: req.body.jobTitle || '',
      targetJobDescription: req.body.jobDescription || '',
      status: 'pending'
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });

    res.status(201).json({ success: true, message: 'Resume uploaded successfully', resume: { id: resume._id, originalName: resume.originalName, status: resume.status, uploadedAt: resume.uploadedAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/resume/all
router.get('/all', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ user: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resume.countDocuments({ user: req.user._id });

    res.json({ success: true, resumes, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/resume/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/resume/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
