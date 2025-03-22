const mongoose = require('mongoose');
const shortid = require('shortid');

const FileSchema = new mongoose.Schema({
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
  }
});

module.exports = mongoose.model('File', FileSchema);