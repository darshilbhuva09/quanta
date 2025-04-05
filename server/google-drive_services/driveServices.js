const stream = require("stream");
const express = require("express");
const multer = require("multer");
const path = require("path");
const { google } = require("googleapis");
const app = express();
const upload = multer();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const KEYFILEPATH = path.join(__dirname, "cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});


const drive = google.drive({ version: "v3", auth });
 

exports.getFileById = async(fileId) => {
  // console.log("fileId : ", fileId)
    try {
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
      });
      const file = response.data;
      // console.log(file)
      return  response.data;
    } catch (error) {
        console.log(error);
      return { error: error.message };
    }
}

exports.getFiles = async (folderId) => {
    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: "files(id, name, size, mimeType, createdTime, webViewLink, webContentLink)",
      });
    //  console.log("response.data.files",response.data.files)

      
      return response.data.files;
    } catch (error) {
        // console.log(error);
      return  ({ error: error.message });
    }
  };

  exports.deleteFile = async (id) => {
    try {
      await drive.files.delete({ fileId: id });
      return ({ message: "File deleted!" });
    } catch (error) {
      return ({ error: error.message });
    }
  };


  //create folder

  exports.createFolder =  async (username) => {
    try {
        console.log("create folder : ", username)
        const folderName =  username;
        const parentFolderId = process.env.PARENT_FOLDER_ID; // Replace with actual Drive folder ID

       
        const response = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
                parents: [parentFolderId],
            },
            fields: "id, name",
        });
        console.log(response.data.id)
        return({ message: "Folder created successfully", folderId: response.data.id });

    } catch (error) {
        return({ error: error.message });
    }
};


// upload file 

 exports.uploadFileToDrive = async(fileObject, folderId) => {
  try{
    console.log("name : ",fileObject.originalname)
    // console.log(fileObject.name)
    // console.log(folderId)
    // console.log("type-of-object : ",typeof(fileObject))
    // console.log("fiiiiiiileeeee : ", fileObject)

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    const { data } = await drive.files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: [folderId],
        },
        fields: "id,name,size, webViewLink, webContentLink",
    });
  //  console.log("dddddata : ", data )
    console.log(`Uploaded file ${data.name} : id : ${data.id} :  size : ${data.size}`);
    return data;
} catch (error) {
    console.error("Error uploading file:", error);
    throw error;
}
};

exports.uploadFiles =  async (folderId, file) => {
    try {
        if (!folderId) {
            return res.status(400).json({ error: "Folder ID is required" });
        }
        // console.log("fileeeeeyyy : ", file)
        const uploadData =  await uploadFileToDrive(file, folderId);
        // console.log("Files uploaded successfully!")
        // console.log(uploadData.webContentLink)
        // console.log(uploadData.webViewLink)
        
         return (uploadData);
    } catch (error) {
          return ({ error: error.message });
    }
};
