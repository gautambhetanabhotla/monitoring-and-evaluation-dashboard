// controllers/documentController.js
import path from 'path';
import fs from 'fs';
import { ExifTool } from 'exiftool-vendored';
import Document from '../models/document.model.js';

const exiftool = new ExifTool();

export const uploadDocument = async (req, res, next) => {
  let tmpPath;
  try {
    const { project, task, kpiUpdate } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'Missing project ID' });
    }

    // 1. Get the temp file info from multer
    tmpPath = req.file.path;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // 2. Extract metadata
    const metadata = await exiftool.read(tmpPath);

    const doc = new Document({
      project,
      task: task || undefined,
      kpiUpdate: kpiUpdate || undefined,
      mimeType,
      metadata,
      // filename will be set below
    });
    await doc.save();  // Now doc._id exists

    // 4. Compute destination paths
    const ext = path.extname(originalName);
    const destFilename = `${doc._id}${ext}`;
    const destDir = path.join(process.cwd(), 'uploads/docs');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, destFilename);

    // 5. Move the file from tmp → permanent
    fs.renameSync(tmpPath, destPath);

    // 6. Update the document with the filename
    doc.filename = destFilename;
    await doc.save();

    // 7. Send response
    res.json({
      id: doc._id,
      metadata,
    });
  } catch (err) {
    // Clean up tmp file if something went wrong
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    next(err);
  }
};
