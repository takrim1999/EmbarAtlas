import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db.js';
import { findInvestigation } from '../catalog.js';
import { generate, selectEvidence } from '../ai-service.js';
const router = Router();
let active = 0;
// Bound concurrent provider work; client retries stay explicit.
router.use((req, res, next) => {
  if (active >= 4) return res.status(429).json({error:'The research assistant is busy. Please retry shortly.'});
  active++;
  let released=false;
  const release=()=>{if(!released){active--;released=true;}};
  res.once('finish',release);res.once('close',release);next();
});
function validIds(ids, max=6) {
  return ids === undefined || (Array.isArray(ids) && ids.length <= max && ids.every(id=>typeof id === 'string' && findInvestigation(id)) && new Set(ids).size === ids.length);
}
router.post('/chat', async (req,res) => {
  const {message,sessionId,investigationIds} = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 3000 || !validIds(investigationIds) ||
    (sessionId !== undefined && sessionId !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)))
    return res.status(400).json({error:'Provide a question up to 3000 characters, valid investigation IDs, and a valid session ID.'});
  try {
    const db=getDb();
    const history = sessionId ? db.prepare('SELECT role, content, sources FROM ai_conversations WHERE session_id = ? ORDER BY id DESC LIMIT 12').all(sessionId).reverse() : [];
    let previous=[];
    try { previous=JSON.parse(history.filter(m=>m.role==='user').at(-1)?.sources || '[]'); } catch {}
    const selected=selectEvidence(message,previous,investigationIds);
    const result=await generate({selected,message,history});
    const sid=sessionId || randomUUID();
    const insert=db.prepare('INSERT INTO ai_conversations (session_id, role, content, sources) VALUES (?, ?, ?, ?)');
    insert.run(sid,'user',message,JSON.stringify(selected.map(inv=>inv.id)));
    insert.run(sid,'assistant',result.text,JSON.stringify(result.citedInvestigations));
    res.json({...result,response:result.text,sessionId:sid});
  } catch { res.status(500).json({error:'The research assistant is unavailable. You can still browse and export source briefs.'}); }
});
router.post('/summarize', async (req,res) => {
  const ids=req.body?.investigationIds;
  if (!Array.isArray(ids) || !ids.length || !validIds(ids,3)) return res.status(400).json({error:'Choose 1 to 3 valid investigations.'});
  try {
    const result=await generate({selected:ids.map(findInvestigation),message:'Compare the supplied investigations: objectives, methods, conditions, measurements, limitations. Do not turn objectives into findings. Keep under 600 words.'});
    res.json({...result,summary:result.text,investigationIds:ids});
  } catch {res.status(500).json({error:'Comparison is unavailable. The source comparison table remains accessible.'});}
});
router.post('/insights', async (req,res) => {
  const focus=req.body?.focus || 'general';
  if (!['lunar','mars','spacecraft','general'].includes(focus)) return res.status(400).json({error:'Unknown research focus.'});
  const ids=['PSI-25','PSI-98','PSI-102','PSI-101','PSI-69'];
  try {
    const result=await generate({selected:ids.map(findInvestigation),message:`For ${focus} research, identify relevant investigations, evidence limits, and questions requiring further work. Do not prescribe fire response protocols, assert habitat specifications, or claim demonstrated technology transfers. Keep under 600 words.`});
    res.json({...result,insights:result.text,focus});
  } catch {res.status(500).json({error:'Insights are unavailable. Explore the source register instead.'});}
});
export default router;
