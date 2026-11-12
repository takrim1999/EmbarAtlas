import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
export default function Method() {
  const [investigations,setInvestigations]=useState([]);
  const [error,setError]=useState('');
  useEffect(()=>{api.getInvestigations().then(data=>setInvestigations(data.investigations)).catch(()=>setError('Source register could not load. Please reload.'));},[]);
  return <div className="animate-fade-in max-w-5xl">
    <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">TRANSPARENCY BY DESIGN</p>
    <h1 className="text-3xl font-medium tracking-tight mb-2">Evidence You Can Inspect</h1>
    <p className="text-xs text-[#6c7c7d] leading-relaxed mb-8">Curated NASA sources, explicit evidence levels, and a reproducible numerical sample. Reviewed November 13, 2026.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {[
        ['01 / SOURCE CORPUS','Metadata and measurements are different','The catalog contains 19 discovery entries. Five have detailed PSI metadata briefs; the remaining entries summarize NASA overviews or registry listings. The numerical explorer contains only five FLEX rows checked against PSI-69 version 5, Experimental Table rows 1–5.'],
        ['02 / EDITORIAL ORDER','Navigation scores, not safety ratings','The team assigns 8/10 to prevention, detection and suppression topics, and 6/10 to fundamental combustion topics. These coarse editorial scores help browsing. They are not NASA ratings, experimental results, or validated rankings of safety.'],
        ['03 / AI ASSISTANCE','Evidence on every turn','Every AI request includes current source records. Citation IDs are checked against those records, but this does not prove that a claim follows from a source. Inspect the original study. If generation fails, the app labels its deterministic source brief and makes no new scientific conclusions.'],
        ['04 / SCIENTIFIC LIMITS','Keep inference within the evidence','Objectives and hypotheses are not findings. Five FLEX tests cannot isolate causal effects or establish limits for solid materials. This curated microgravity sample does not validate lunar/Martian behavior or certify flight safety. No claim is made about the absence of other partial-gravity research.'],
      ].map(([step,title,text])=><article className="bg-white border border-[#dce2db] rounded-lg p-6" key={step}><p className="text-[10px] text-[#6c7c7d] mb-3">{step}</p><h2 className="text-base font-semibold mb-2">{title}</h2><p className="text-xs text-[#677d6d] leading-relaxed">{text}</p></article>)}
    </div>
    <section className="bg-white border border-[#dce2db] rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2">Primary source register</h2>
      <p className="text-xs text-[#6c7c7d] mb-4">{investigations.length} entries. App identifiers beginning ACME, CFI, DAFT, SPICE or SLICE are navigation identifiers, not NASA-issued PSI IDs.</p>
      {error&&<p role="alert">{error}</p>}
      <div className="divide-y divide-[#e8ece3]">{investigations.map(inv=><article key={inv.id} className="py-4 flex justify-between items-start gap-4">
        <div><h3 className="text-sm font-semibold">{inv.name} <span className="text-xs text-[#6c7c7d]">({inv.id})</span></h3><p className="text-xs mt-1">{inv.title}</p>
          <p className="text-[11px] text-[#6c7c7d] mt-2">{inv.evidence_status.replace(/_/g,' ')} · {inv.source_section}</p>
          {inv.doi&&<a className="text-xs text-[#126959] underline" href={`https://doi.org/${inv.doi}`} target="_blank" rel="noopener noreferrer">DOI: {inv.doi}</a>}
          <p className="text-[10px] text-[#6c7c7d] mt-1">Source license: {inv.license}</p>
        </div><a className="shrink-0 text-xs text-[#126959] flex items-center gap-1" href={inv.url} target="_blank" rel="noopener noreferrer">NASA source <ExternalLink size={12}/></a>
      </article>)}</div>
    </section>
    <p className="text-xs text-[#69734f] bg-[#edf0df] p-5 rounded-lg">Legacy records without traceable numerical provenance are excluded from charts, exports and AI context. No automatic ingestion of the full PSI archive or validation of operational fire-safety decisions is claimed.</p>
  </div>;
}
