import fs from 'node:fs';
import path from 'node:path';
function cosine(a:number[], b:number[]){
  const dot = a.reduce((s,v,i)=>s+v*(b[i]||0),0);
  const na = Math.sqrt(a.reduce((s,v)=>s+v*v,0))||1;
  const nb = Math.sqrt(b.reduce((s,v)=>s+v*v,0))||1;
  return dot/(na*nb);
}
export class FileMemory{
  baseDir: string;
  constructor(baseDir=path.join(process.cwd(),'data','memory')){
    this.baseDir = baseDir;
    fs.mkdirSync(this.baseDir,{recursive:true});
  }
  private pathFor(c:string){ return path.join(this.baseDir, c+'.json'); }
  upsert(c:string, rows:any[]){
    const p=this.pathFor(c);
    let cur:any[]=[];
    if (fs.existsSync(p)) cur = JSON.parse(fs.readFileSync(p,'utf8'));
    const map = new Map<string,any>();
    for (const r of cur) map.set(r.id||r._id||JSON.stringify(r), r);
    for (const r of rows) map.set(r.id||r._id||JSON.stringify(r), r);
    fs.mkdirSync(path.dirname(p), {recursive:true});
    fs.writeFileSync(p, JSON.stringify([...map.values()], null, 2));
    return { ok: true };
  }
  search(c:string, vector:number[], topK=5){
    const p=this.pathFor(c);
    if (!fs.existsSync(p)) return { hits: [] };
    const cur:any[] = JSON.parse(fs.readFileSync(p,'utf8'));
    const scored = cur.filter(r=>Array.isArray(r.embedding))
      .map(r=>({ r, score: cosine(vector, r.embedding) }))
      .sort((a,b)=>b.score-a.score).slice(0, topK);
    return { hits: scored.map(s=>({ doc: s.r, score: s.score })) };
  }
}
