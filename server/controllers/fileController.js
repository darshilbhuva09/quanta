const File = require('../models/File');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// @desc    Upload a file
// @route   POST /api/files/upload
exports.uploadFile = async (req, res) => {
  try {
    console.log('File upload initiated');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('File details:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    // Create new file document
    const newFile = new File({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path.replace(/\\/g, '/')
    });

    console.log('Saving file to database');
    await newFile.save();
    
    console.log('File saved successfully, id:', newFile._id, 'shortId:', newFile.shortId);
    
    res.status(201).json(newFile);
  } catch (err) {
    console.error('Error uploading file:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get all files for a user
// @route   GET /api/files
exports.getUserFiles = async (req, res) => {
  try {
    console.log(`Fetching files for user ID: ${req.user.id}`);
    
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    console.log(`Found ${files.length} files for user`);
    
    // Log a sample of the first file if available
    if (files.length > 0) {
      const sample = files[0];
      console.log('Sample file:', {
        id: sample._id,
        shortId: sample.shortId,
        name: sample.originalName,
        size: sample.size,
        downloadCount: sample.downloadCount
      });
    }
    
    res.json(files);
  } catch (err) {
    console.error('Error fetching user files:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get file by ID
// @route   GET /api/files/:id
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(file);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Share a file via link, QR code, or email
// @route   POST /api/files/:id/share
exports.shareFile = async (req, res) => {
  try {
    const { method, recipient } = req.body;
    
    if (!['link', 'qrcode', 'email'].includes(method)) {
      return res.status(400).json({ message: 'Invalid sharing method' });
    }

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/files/download/${file.shortId}`;

    // Record sharing method
    const shareRecord = {
      method,
      recipient: recipient || null,
      sharedAt: Date.now()
    };

    file.sharedVia.push(shareRecord);
    await file.save();

    // Handle different sharing methods
    if (method === 'qrcode') {
      const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);
      return res.json({ 
        message: 'QR code generated successfully',
        qrCode: qrCodeDataUrl,
        downloadUrl
      });
    } 
    else if (method === 'email' && recipient) {
      // Set up email transporter (configure with your SMTP details in production)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: process.env.SMTP_PORT || 2525,
        auth: {
          user: process.env.SMTP_USER || 'your_mailtrap_user',
          pass: process.env.SMTP_PASS || 'your_mailtrap_password'
        }
      });

      const user = await User.findById(req.user.id);

      // Send email
      await transporter.sendMail({
        from: `"Quanta Share" <noreply@quantashare.com>`,
        to: recipient,
        subject: `${user.username} shared a file with you`,
        html: `
          <h2>File Shared with You</h2>
          <p>${user.username} has shared a file with you: <strong>${file.originalName}</strong></p>
          <p>Click the link below to download:</p>
          <a href="${downloadUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Download File</a>
          <p>This link will allow you to download the file directly.</p>
        `
      });

      return res.json({ 
        message: 'File shared via email successfully',
        downloadUrl
      });
    } 
    else if (method === 'link') {
      return res.json({ 
        message: 'File link generated successfully',
        downloadUrl
      });
    }

    res.status(400).json({ message: 'Invalid sharing method or missing recipient' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Download a file by short ID
// @route   GET /api/files/download/:shortId
exports.downloadFile = async (req, res) => {
  try {
    console.log(`Download request for shortId: ${req.params.shortId}`);
    const file = await File.findOne({ shortId: req.params.shortId });

    if (!file) {
      console.error('File not found for shortId:', req.params.shortId);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('File found:', file.originalName, 'Path:', file.path);
    
    // Validate the file path
    const filePath = file.path;
    
    if (!fs.existsSync(filePath)) {
      console.error('Physical file not found at path:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    console.log(`Sending file: ${file.originalName}, Download count: ${file.downloadCount}`);
    
    // Send file with proper headers
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    
    // Send file
    res.download(filePath, file.originalName, (err) => {
      if (err) {
        console.error('Error during file download:', err);
        
        // If headers already sent, we can't send a new response
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).send('Server error during download');
  }
};