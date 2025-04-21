import path from 'path';
import fs from 'fs';
import { ExifTool } from 'exiftool-vendored';
import Document from '../models/document.model.js';
import mongoose from 'mongoose';
import multer from 'multer';
import os from 'os'; // For temporary directory
import { promisify } from 'util'; // For promisified functions
import { writeFile, unlink } from 'fs'; // For file operations

const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

const exiftool = new ExifTool();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
}).single('file'); // Expect a single file with the field name 'data'

export const uploadDocument = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error during file upload:', err);
      return res.status(400).json({ success: false, message: 'File upload failed', error: err.message });
    }
  
    console.log("Upload request received");
    console.log("File received:", req.file); // Debugging log
    console.log("Request body:", req.body); // Debugging log
  
    try {
      const { projectId, taskId, kpiUpdateId, createdBy, meta } = req.body;
  
      // Validate required fields
      if (!projectId || !req.file || !createdBy) {
        return res.status(400).json({ message: 'Missing required fields: projectId, data, or createdBy' });
      }
  
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid project ID' });
      }
      if (taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ success: false, message: 'Invalid task ID' });
      }
      if (kpiUpdateId && !mongoose.Types.ObjectId.isValid(kpiUpdateId)) {
        return res.status(400).json({ success: false, message: 'Invalid KPI update ID' });
      }
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID' });
      }
  
      // Extract file buffer and metadata
      const buffer = req.file.buffer;
      const parsedMeta = meta ? JSON.parse(meta) : {};
  
      // Write buffer to a temporary file
      const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${req.file.originalname}`);
      await writeFileAsync(tempFilePath, buffer);

      // Read metadata using exiftool
      let md = {};
      try {
        md = await exiftool.read(tempFilePath);
        console.log("Extracted metadata:", md);
      } catch (exifError) {
        console.error("Error reading metadata:", exifError);
      } finally {
        // Clean up the temporary file
        await unlinkAsync(tempFilePath);
      }
  
      // Save document to the database
      const doc = new Document({
        projectId,
        taskId: taskId || undefined,
        kpiUpdateId: kpiUpdateId || undefined,
        metadata: {
          ...md,
          ...parsedMeta,
        },
        binaryData: buffer.toString('base64'), // Store binary data as Base64
        createdBy,
      });
  
      const savedDoc = await doc.save();
  
      // console.log("Document saved successfully:", savedDoc);
      res.status(200).json({
        id: savedDoc._id,
        metadata: {
          ...md,
          ...parsedMeta,
        },
      });
    } catch (error) {
      console.error("Error processing upload:", error);
      next(error);
    }
  });
};

export const getDocumentsByProject = async (req, res, next) => {
    try {
      const { projectId } = req.params;
    
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Missing project ID parameter' });
      }
    
      // Validate the format of projectId.
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid project ID' });
      }
    
      const documents = await Document.find({ projectId }).sort({ createdAt: -1 }).populate('createdBy', 'username');

      res.status(200).json({
        success: true,
        documents
      });
    } catch (err) {
      next(err);
    }
};

export const deleteDocument = async (req, res, next) => {
    try {
      const { documentId } = req.params;
    
      if (!documentId) {
        return res.status(400).json({ success: false, message: 'Missing document ID parameter' });
      }
    
      if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ success: false, message: 'Invalid document ID' });
      }
    
      const deletedDocument = await Document.findByIdAndDelete(documentId);

      if(!deletedDocument) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
};

  