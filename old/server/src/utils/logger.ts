import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../../logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const IMPORT_LOG = path.join(LOG_DIR, 'file-import.log');

export function logImportStep(step: string) {
  const line = `[${new Date().toISOString()}] ${step}\n`;
  fs.appendFileSync(IMPORT_LOG, line);
}
