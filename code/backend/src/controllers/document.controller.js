import path from 'path';
import fs from 'fs';
import { ExifTool } from 'exiftool-vendored';
import Document from '../models/document.model.js';
import Project from '../models/Project.model.js';
import mongoose from 'mongoose';

const exiftool = new ExifTool();

export const uploadDocument = async (req, res, next) => {
  let tmpPath;
  try {
    const { project, task, kpiUpdate } = req.body;
    if (!project) {
      return res.status(400).json({ success: false, message: 'Missing project ID' });
    }

    tmpPath = req.file.path;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    const metadata = await exiftool.read(tmpPath);

    const doc = new Document({
      project,
      task: task || undefined,
      kpiUpdate: kpiUpdate || undefined,
      mimeType,
      metadata,
    });
    await doc.save();  

    const ext = path.extname(originalName);
    const destFilename = `${doc._id}${ext}`;
    const destDir = path.join(process.cwd(), 'uploads/docs');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, destFilename);

    fs.renameSync(tmpPath, destPath);

    doc.filename = destFilename;
    await doc.save();

    res.status(200).json({
      success: true,
      document: {
        id: doc._id,
        metadata,
      },
    });
  } catch (err) {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    next(err);
  }
};

export const getDocumentsByProject = async (req, res, next) => {
    try {
      const { projectId } = req.params;

      
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Missing project ID parameter' });
      }
  
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid project ID' });
      }
  
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
  
      const documents = await Document.find({ project: projectId }).sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        documents: {
          documents,
        },
      });
    } catch (err) {
      next(err);
    }
  };