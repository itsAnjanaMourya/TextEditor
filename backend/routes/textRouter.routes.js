import express from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { listFilesController } from '../controllers/listFiles.controller.js';
import protect from '../middleware/authMiddleware.js';

const textRouter = express.Router();
textRouter.post('/upload', uploadController);

textRouter.get('/list-files', protect, listFilesController);

textRouter.get('/list-files-oauth', listFilesController);

export default textRouter;
