import express from 'express';
import { uploadController } from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/upload', uploadController);

export default router;
