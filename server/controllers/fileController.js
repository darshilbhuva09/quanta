const File = require('../models/File');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const driveServices = require('../google-drive_services/driveServices')
const stream = require("stream");
const { google } = require("googleapis");
const axios = require('axios');



const KEYFILEPATH = path.join(__dirname, "cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});


const drive = google.drive({ version: "v3", auth });


// @desc    Upload a file
// @route   POST /api/files/upload
exports.uploadFile = async (req, res) => {
  try {

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Invalid file or empty buffer" });
    }else{
      // console.log(req.file)
    }
  
    
    // console.log('File upload initiated');

    const userid = req.user.id;
    const user = await User.findById(userid)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const folderId = user.folderId;
    //  console.log("folderid : ", folderId)


    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
      // Upload file to Google Drive
      // console.log("Uploading file to Google Drive...");
      // console.log(req.file)
      const file = req.file;

      // Upload files if folder exists
      const uploadData =  await driveServices.uploadFileToDrive(file, folderId);

      // console.log("Files uploaded successfully!")
      console.log("UploadData : ",uploadData)
      // console.log(uploadData.webContentLink)
      // console.log(uploadData.webViewLink)
              

          
    const newFile = new File({
      fileID : uploadData.id,
      userId: req.user.id,
      filename: uploadData.name,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: uploadData.webViewLink,  
      webViewLink : uploadData.webViewLink,
      webContentLink : uploadData.webContentLink,
      createdAt : uploadData.createdTime
    });

    // console.log('Saving file to database');
    await newFile.save();

     return res.status(200).json({ message: "File uploaded successfully", fileData : uploadData });

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
    const userid = req.user.id
    // console.log(`Fetching files for user ID: ${req.user.id}`);

    const user = await User.findById(userid)
    const folderId = user.folderId;
    // console.log("folderid : ", folderId)
    
    const files = await driveServices.getFiles(folderId)
    if(!files){
      return res.status(500).json({message : "error while file fetching"})
    } 

    for(let i=0; i<files.length; i++){
        let id = files[i].id;
        let dc = await File.findOne({fileID : id});
        files[i].downloadCount = dc.downloadCount;
    }
    // console.log(`Found ${files.length} files for user`);   
    // console.log("files", files) 
    // files.forEach((file)=>{console.log(file.name, ":", )})
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
    // console.log("req : ", req)
    const fileid = req.params.fileId;
    // console.log(`Download request for fileId: ${fileid}`);

    const file = await File.findOne({fileID : fileid});

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    // console.log("file from db : ", file);

   file.downloadCount = file.downloadCount + 1;
   await file.save();

    return res.status(200).json({ downloadLink: file.webContentLink });
    
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).send('Server error during download');
  }
};


const transporter = nodemailer.createTransport({
  service: "gmail", // Or your SMTP provider
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});


const tmp = require('tmp'); 
exports.shareFileViaEmail = async(req, res) => {

    const { from, to, text , fileLink, fileType, fileName} = req.body;
  
    // console.log("file : ",fileLink)
    // console.log("from : ", from)
    // console.log("to : ", to)
    // console.log("text : ", text)
    // console.log("type : ", fileType)
    // console.log("name : ", fileName)

  try {
    const response = await axios.get(fileLink, { responseType: 'stream' });

    // console.log("Status Code:", response.status);
    // console.log("Content-Type:", response.headers['content-type']);
    // console.log("Content-Length:", response.headers['content-length']);
    
    // Save to a temporary file
    const ext = path.extname(fileName) 
    // console.log("ext : ", ext)

    const tempFile = tmp.fileSync({ postfix: ext });
    const writeStream = fs.createWriteStream(tempFile.name);
    response.data.pipe(writeStream);

    writeStream.on('finish', async () => {
      const mailOptions = {
        from,
        to,
        subject: "File from Quanta share",
        text,
        attachments: [
          {
            filename: fileName,
            path: tempFile.name,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      tempFile.removeCallback(); // Clean up temp file
      res.json({ success: true, message: 'Email sent!' });
    });

  } catch (error) {
    console.error("Error downloading or sending file:", error.message);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
  
}