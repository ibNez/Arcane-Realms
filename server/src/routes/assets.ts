import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { logImportStep } from '../utils/logger.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = process.env.ASSET_DIR
  ? path.resolve(process.env.ASSET_DIR)
  : path.resolve(__dirname, '../../../assets/components');
fs.mkdirSync(path.join(ASSET_DIR, 'tmp'), { recursive: true });
const IMG_DIR = path.join(ASSET_DIR, 'images');
const META_FILE = path.join(ASSET_DIR, 'assets.json');

const upload = multer({ dest: path.join(ASSET_DIR, 'tmp') });

router.get('/', (_req, res) => {
  try {
    const raw = fs.readFileSync(META_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json([]);
  }
});

router.post('/', upload.single('image'), (req, res) => {
  logImportStep('Received asset upload request');

  const file = req.file;
  const name = req.body.name as string;
  if (!file || !name) {
    logImportStep('Missing file or name');
    return res.status(400).json({ error: 'Missing file or name' });
  }

  logImportStep(`Processing file "${file.originalname}" for asset "${name}"`);

  fs.mkdirSync(IMG_DIR, { recursive: true });
  logImportStep('Ensured image directory exists');

  const ext = path.extname(file.originalname) || '.png';
  const safeName = name.replace(/\W+/g, '_').toLowerCase();
  const filename = safeName + ext;
  const target = path.join(IMG_DIR, filename);
  fs.renameSync(file.path, target);
  logImportStep(`Stored image as ${target}`);

  let meta: any[] = [];
  try {
    meta = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
  } catch {
    logImportStep('Meta file missing, creating new one');
  }
  meta.push({ name: safeName, file: filename });
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  logImportStep(`Updated metadata at ${META_FILE}`);

  res.json({ name: safeName, file: filename });
  logImportStep(`Completed import for ${name}`);
});

export default router;
