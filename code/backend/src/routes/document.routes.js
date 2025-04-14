// routes/documents.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocument } from '../controllers/document.controller.js';

const documentRouter = express.Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads/tmp'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});


documentRouter.post('/', upload.single('file'), uploadDocument);

export default documentRouter;
