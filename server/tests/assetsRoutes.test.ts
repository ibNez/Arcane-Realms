import { describe, it, expect } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// 1x1 transparent png
const PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0BN7V9Wb0AAAAASUVORK5CYII=';

describe('assets routes', () => {
  it('stores uploaded image and metadata', async () => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'ar-assets-'));
    process.env.ASSET_DIR = tmpBase;
    const { default: assetsRouter } = await import('../src/routes/assets.js');

    const app = express();
    app.use('/api/assets', assetsRouter);
    const server = app.listen(0);
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const fd = new FormData();
    fd.append('name', 'test');
    const imgBuf = Buffer.from(PIXEL_PNG_BASE64, 'base64');
    fd.append('image', new Blob([imgBuf], { type: 'image/png' }), 'pixel.png');

    const res = await fetch(url + '/api/assets', { method: 'POST', body: fd as any });
    expect(res.status).toBe(200);
    const out = await res.json();
    expect(out).toEqual({ name: 'test', file: 'test.png', icon: 'test-icon.png' });

    const metaPath = path.join(tmpBase, 'assets.json');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    expect(meta).toEqual([{ name: 'test', file: 'test.png', icon: 'test-icon.png' }]);

    const imgPath = path.join(tmpBase, 'images', 'test.png');
    expect(fs.existsSync(imgPath)).toBe(true);
    const iconPath = path.join(tmpBase, 'images', 'test-icon.png');
    expect(fs.existsSync(iconPath)).toBe(true);

    server.close();
    delete process.env.ASSET_DIR;
  });
});
