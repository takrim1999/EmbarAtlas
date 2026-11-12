import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { catalog, investigations, measurements, findInvestigation } from '../server/catalog.js';
import { renderMarkdown } from '../src/lib/markdown.js';
import { generate, buildContents, selectEvidence, validateCitations } from '../server/ai-service.js';

const temp=mkdtempSync(join(tmpdir(),'ember-test-'));
process.env.DATABASE_PATH=join(temp,'test.db');
process.env.GEMINI_API_KEY='';process.env.AI_STUDIO_API='';
const {initDb,getDb}=await import('../server/db.js');
initDb();
const {default:app}=await import('../server/app.js');
const server=app.listen(0,'127.0.0.1');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}/api`;
test.after(async()=>{await new Promise(resolve=>server.close(resolve));getDb().close?.();rmSync(temp,{recursive:true,force:true});});
const post=(path,body)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

// Source-boundary regressions, including deployments with an existing legacy DB.
test('all active numerical rows carry test-level provenance and the missing source cell stays null',()=>{
  assert.equal(investigations.length,19);assert.equal(measurements.length,37);
  assert.deepEqual(measurements.filter(r=>r.investigation_id==='PSI-69').map(r=>r.test_id),['20CAL08','20CAL10','20CAL12','30CAL02','30CAL03']);
  assert.equal(measurements.find(r=>r.test_id==='30CAL02').extinction_diameter_mm,null);
  for(const row of measurements){assert.equal(row.evidence_status,'source_checked');assert.match(row.source_location,new RegExp(row.test_id));assert.ok(row.source_url.startsWith('https://'));assert.ok(row.source_doi);}
  assert.equal(findInvestigation('DAFT').title,'Dust and Aerosol Measurement Feasibility Test');
  assert.equal(findInvestigation('DAFT').topic,'detection');
  assert.match(findInvestigation('ACME-BRE').summary,/gaseous/);
  assert.equal(findInvestigation('ACME-SFLAME').title,'Structure and Response of Spherical Diffusion Flames');
  assert.equal(findInvestigation('ACME-COFLOW'),undefined);
});
test('catalog routes exclude legacy measurements and metadata without destroying them',async()=>{
  const db=getDb();
  db.prepare('UPDATE investigations SET title = ? WHERE id = ?').run('Wrong old DAFT title','DAFT');
  db.prepare('INSERT INTO experimental_data (investigation_id, test_id, burn_time_s) VALUES (?, ?, ?)').run('DAFT','UNVERIFIED-LEGACY',999);
  const daft=await (await fetch(base+'/investigations/DAFT')).json();
  assert.equal(daft.title,'Dust and Aerosol Measurement Feasibility Test');assert.equal(daft.experimentalData.length,2);
  const stats=await (await fetch(base+'/investigations/stats')).json();assert.equal(stats.dataPoints,37);assert.equal(stats.catalogVersion,catalog.version);
});
test('combined filters and multiword hardware search work identically without SQL parsing',async()=>{
  const result=await (await fetch(base+'/investigations?topic=detection&search=smoke%20particle')).json();
  assert.ok(result.investigations.some(i=>i.id==='PSI-102'));assert.ok(result.investigations.every(i=>i.topic==='detection'));
  const hardware=await (await fetch(base+'/investigations?search=CIR%20ACME')).json();assert.ok(hardware.total>0);assert.ok(hardware.investigations.every(i=>i.id.startsWith('ACME-')));
});
test('public imports cannot mutate the reviewed corpus',async()=>{
  const response=await post('/data/import',{investigationId:'PSI-69',csvText:'test_id,burn_time_s\nBAD,999'});assert.equal(response.status,403);
  const data=await (await fetch(base+'/investigations/PSI-69/data')).json();assert.equal(data.total,5);
});
test('CSV and JSON preserve provenance and missing measurements',async()=>{
  const csv=await (await fetch(base+'/data/export/PSI-69')).text();assert.match(csv,/source_location/);assert.match(csv,/20CAL08/);assert.doesNotMatch(csv,/UNVERIFIED-LEGACY/);
  const json=await (await fetch(base+'/data/export/PSI-69/json')).json();assert.equal(json.data.length,5);assert.equal(json.data[3].extinction_diameter_mm,null);
  const daftCsv=await (await fetch(base+'/data/export/DAFT')).text();assert.match(daftCsv,/DAFT-DH-001/);assert.doesNotMatch(daftCsv,/UNVERIFIED-LEGACY/);
  assert.equal((await fetch(base+'/data/export/SPICE')).status,404);
});
test('invalid selections and malformed bodies produce bounded API errors',async()=>{
  assert.equal((await post('/ai/summarize',{investigationIds:['UNKNOWN']})).status,400);
  assert.equal((await post('/ai/chat',{message:{bad:true}})).status,400);
  assert.equal((await post('/ai/chat',{message:'x'.repeat(3001)})).status,400);
  assert.equal((await fetch(base+'/investigations/compare?ids=PSI-69,UNKNOWN')).status,404);
  assert.equal((await fetch(base+'/investigations?search=x&search=y')).status,400);
  assert.equal((await fetch(base+'/not-a-route')).status,404);
});
test('Markdown strips executable markup and unsafe links while keeping scientific tables',()=>{
  const html=renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(2)><svg onload=alert(3)></svg>\n\n[bad](javascript:alert%281%29)\n\n[encoded](jav&#x61;script:alert)\n\n[relative](//evil.example)\n\n[good](https://www.nasa.gov/)\n\n| Test | Value |\n|---|---|\n| FLEX | 4.3 |');
  assert.doesNotMatch(html,/<script|<img|<svg|onerror|onload|href="javascript|href="\/\//i);assert.match(html,/<table>/);assert.match(html,/href="https:\/\/www.nasa.gov/);
});
test('follow-up turns and changed scopes receive fresh evidence',()=>{
  const history=[{role:'user',content:'Compare SAME and SAME-R'},{role:'assistant',content:'Earlier interpretation [PSI-102]'}];
  const selected=selectEvidence('What are its limitations?',['PSI-102','PSI-101']);assert.ok(selected.some(i=>i.id==='PSI-101'));
  const contents=buildContents(history,'What are its limitations?',selected);const last=contents.at(-1).parts[0].text;
  assert.match(last,/EVIDENCE/);assert.match(last,/contamination/);assert.match(last,/10.60555/);
  const changed=selectEvidence('Now examine FLEX',[],['PSI-69']);const revised=buildContents(history,'Now examine FLEX',changed).at(-1).parts[0].text;
  assert.match(revised,/20CAL08/);assert.doesNotMatch(revised,/"id":"PSI-102"/);
});
test('citation checks reject absent or out-of-context IDs',()=>{
  const selected=[findInvestigation('PSI-69')];
  assert.equal(validateCitations('Claim [PSI-69]',selected).valid,true);
  assert.equal(validateCitations('Claim [PSI-25]',selected).valid,false);
  assert.equal(validateCitations('Claim [PSI-69, PSI-25]',selected).valid,false);
  assert.equal(validateCitations('Uncited claim',selected).valid,false);
});
test('SI provider output is labeled, and invalid citations fall back without claiming generation',async()=>{
  const selected=[findInvestigation('PSI-69')];let sent;
  const mock=text=>async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]})};};
  const good=await generate({selected,message:'What did FLEX study?',apiKey:'test-not-real',models:['test-model'],fetchImpl:mock('FLEX studies droplets [PSI-69].')});
  assert.equal(good.mode,'ai');assert.match(sent.contents.at(-1).parts[0].text,/20CAL08/);
  const bad=await generate({selected,message:'Question',apiKey:'test-not-real',models:['test-model'],fetchImpl:mock('Claim [PSI-25].')});
  assert.equal(bad.mode,'source_brief');assert.equal(bad.modelUsed,null);assert.match(bad.text,/not a generated SI answer/);
});
test('provider timeouts abort and return a labeled source brief',async()=>{
  const started=Date.now();
  const result=await generate({selected:[findInvestigation('PSI-69')],message:'Question',apiKey:'test',models:['test-model'],timeoutMs:30,
    fetchImpl:(_url,{signal})=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('should abort earlier')),1000);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(signal.reason);},{once:true});})});
  assert.equal(result.mode,'source_brief');assert.ok(Date.now()-started<900);
});
test('chat sessions preserve evidence scope, allow follow-ups, and use unguessable IDs',async()=>{
  const first=await (await post('/ai/chat',{message:'Compare smoke studies',investigationIds:['PSI-102','PSI-101']})).json();
  assert.match(first.sessionId,/^[0-9a-f-]{36}$/);assert.equal(first.mode,'source_brief');
  const second=await (await post('/ai/chat',{message:'What are the limitations?',sessionId:first.sessionId})).json();
  assert.ok(second.citedInvestigations.includes('PSI-101'));assert.match(second.response,/contamination/);
  assert.equal((await post('/ai/chat',{message:'Hello',sessionId:'session-123'})).status,400);
});
