/**
 * @module middleware/upload
 * File upload middleware using Multer.
 */

import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { generateId } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { IMAGE_CONFIG } from '@milkboy/shared';

// Ensure upload directory exists
const uploadDir = path.resolve(config.storage.localPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dateDir = new Date().toISOString().split('T')[0];
    const destDir = path.join(uploadDir, dateDir!);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${generateId()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = IMAGE_CONFIG.ALLOWED_MIME_TYPES as readonly string[];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`));
  }
};

/**
 * Multer upload configuration for image files.
 */
export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: IMAGE_CONFIG.MAX_FILE_SIZE,
    files: IMAGE_CONFIG.MAX_FILES_PER_SCAN,
  },
});
