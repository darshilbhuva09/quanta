const mongoose = require('mongoose');
const shortid = require('shortid');

const FileSchema = new mongoose.Schema({
  fileID: { //  Use 'id' as a String to store Google Drive ID
    type: String,
    required: true,
    unique: true, //  Ensure uniqueness
    index: true    //  For efficient querying
   },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    default: shortid.generate,
    unique: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  sharedVia: [{
    method: {
      type: String,
      enum: ['link', 'qrcode', 'email'],
      required: true
    },
    recipient: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  webViewLink: { // Add webViewLink
      type: String,
      required: true  //  or adjust as needed
  },
  webContentLink: { // Add webContentLink
      type: String,
      required: true // or adjust as needed
  }
});

module.exports = mongoose.model('File', FileSchema);