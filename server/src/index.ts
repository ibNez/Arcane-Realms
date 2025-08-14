import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import { llm, embed, memorySearch, memoryUpsert, stt, tts, genImage} from './routes/ai.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_, res) => res.json({ ok: true }));
app.post('/llm', llm);
app.post('/embed', embed);
app.post('/memory/search', memorySearch);
app.post('/memory/upsert', memoryUpsert);
app.post('/stt', stt);
app.post('/tts', tts);
app.post('/gen/image', genImage);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

type Client = { id: string; ws: any; x: number; y: number };
const clients = new Map<string, Client>();

function broadcast(obj: any) {
  const msg = JSON.stringify(obj);
  for (const c of clients.values()) {
    try { c.ws.send(msg); } catch {}
  }
}

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).slice(2);
  const c: Client = { id, ws, x: 100 + Math.random()*100, y: 100 + Math.random()*100 };
  clients.set(id, c);
  ws.send(JSON.stringify({ t: 'hello', id }));
  broadcast({ t: 'join', id, x: c.x, y: c.y });

  ws.on('message', (data: any) => {
    try {
      const m = JSON.parse(data.toString());
      if (m.t === 'move') {
        c.x = m.x; c.y = m.y;
        broadcast({ t: 'pos', id, x: c.x, y: c.y });
      }
      if (m.t === 'chat') {
        broadcast({ t: 'chat', id, text: m.text });
      }
    } catch {}
  });

  ws.on('close', () => {
    clients.delete(id);
    broadcast({ t: 'leave', id });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
