import express from 'express';
import { uploadDocument, getDocumentsByProject,deleteDocument } from '../controllers/document.controller.js';

const documentRouter = express.Router();

// Use express.json middleware in your main app with a payload limit if needed.
// For example: app.use(express.json({ limit: '50mb' }));

documentRouter.post('/upload', uploadDocument);
documentRouter.get('/getDocuments/:projectId', getDocumentsByProject);
documentRouter.delete('/delete/:documentId', deleteDocument);

export default documentRouter;
