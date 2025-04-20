import path from 'path';
import fs from 'fs';
import { ExifTool } from 'exiftool-vendored';
import Document from '../models/document.model.js';
import mongoose from 'mongoose';

const exiftool = new ExifTool();

export const uploadDocument = async (req, res, next) => {
  console.log("Upload request received");
  console.log({
    ...req.body,
    data: "..."
  })
  try {
    const { projectId, taskId, kpiUpdateId, data, createdBy, meta } = req.body;
    
    if (!projectId || !data || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields: projectId and binaryData' });
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success : false , message: "Invalid project ID" });
    }

    if( taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success : false , message: "Invalid task ID" });
    }

    if( kpiUpdateId && !mongoose.Types.ObjectId.isValid(kpiUpdateId)) {
      return res.status(400).json({ success : false , message: "Invalid KPI update ID" });
    }

    if(!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ success : false , message: "Invalid user ID" });
    }

    const buffer = atob(data);
    // console.log(buffer);
    
    // const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
    // if (!fs.existsSync(tmpDir)) {
    //   fs.mkdirSync(tmpDir, { recursive: true });
    // }
    // const tmpFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    // const tmpFilePath = path.join(tmpDir, tmpFileName);
    
    // fs.writeFileSync(tmpFilePath, buffer);
    
    // const metadata = await exiftool.read(tmpFilePath);
    
    // fs.unlinkSync(tmpFilePath);
    let md;
    exiftool.read(buffer).then((metadata) => {
      console.dir(metadata);
      md = metadata;
    }).catch(err => {
      console.error(err);
    })
    
    const doc = new Document({
      projectId,
      taskId: taskId || undefined,
      kpiUpdateId: kpiUpdateId || undefined,
      metadata: {
        ...md,
        ...meta
      },
      binaryData: data,
      createdBy
    });
    await doc.save();
    
    res.status(200).json({
      id: doc._id,
      metadata: {
        ...md,
        ...meta
      },
    });

    console.dir({...md, ...meta});
  } catch (err) {
    next(err);
  }
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

  