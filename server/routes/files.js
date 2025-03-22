const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, '../uploads', req.user.id.toString());
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit (increased from 10MB)
});

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', auth, upload.single('file'), fileController.uploadFile);

// @route   GET api/files
// @desc    Get all files for a user
// @access  Private
router.get('/', auth, fileController.getUserFiles);

// IMPORTANT: The download route must come before the :id route to avoid conflicts
// @route   GET api/files/download/:shortId
// @desc    Download a file by short ID (public access)
// @access  Public
router.get('/download/:shortId', fileController.downloadFile);

// @route   GET api/files/:id
// @desc    Get file by ID
// @access  Private
router.get('/:id', auth, fileController.getFileById);

// @route   POST api/files/:id/share
// @desc    Share a file via link, QR code, or email
// @access  Private
router.post('/:id/share', auth, fileController.shareFile);

// Add delete route
// @route   DELETE api/files/:id
// @desc    Delete a file by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this file' });
    }

    // Remove the file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Remove from database using findByIdAndDelete instead of the deprecated remove() method
    await File.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;