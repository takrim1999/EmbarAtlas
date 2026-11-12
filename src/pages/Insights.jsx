import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, Moon, Home, Rocket, Globe } from 'lucide-react';
import { api } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const FOCUSES = [
  {key:'lunar',label:'Lunar habitats',icon:Moon,question:'Which microgravity studies are useful starting points, and what still needs partial-gravity validation?'},
  {key:'spacecraft',label:'Orbital spacecraft',icon:Home,question:'How do material-burning, smoke-detection, and droplet-extinction studies differ in scale and methods?'},
  {key:'mars',label:'Mars missions',icon:Rocket,question:'Which questions about detection and suppression remain unanswered by this microgravity sample?'},
  {key:'general',label:'Research overview',icon:Globe,question:'What was studied, what was measured, and what conclusions are outside the imported evidence?'},
];
export default function Insights() {
  const [focus,setFocus]=useState('lunar');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const generation=useRef(0);
  const current=FOCUSES.find(f=>f.key===focus);
  async function generate() {
    const requestId=++generation.current;
    setLoading(true);setResult(null);setError('');
    try {
      const data=await api.getInsights(focus);
      if(requestId===generation.current)setResult(data);
    } catch {if(requestId===generation.current)setError('The assistant could not complete this request. Please retry or inspect the source register. No answer was generated.');}
    finally {if(requestId===generation.current)setLoading(false);}
  }
  return <div className="animate-fade-in max-w-6xl">
    <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">SOURCE-LINKED RESEARCH ASSISTANCE</p>
    <h1 className="text-3xl font-medium tracking-tight mb-2">Fire Research Insights</h1>
    <p className="text-xs text-[#6c7c7d] leading-relaxed mb-6 max-w-2xl">Explore research questions using five detailed NASA PSI metadata briefs and a five-row FLEX sample. AI interpretations need human review; this tool does not recommend operational fire-response procedures.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {FOCUSES.map(({key,label,icon:Icon,question})=><button key={key} type="button" onClick={()=>{generation.current++;setFocus(key);setResult(null);setLoading(false);setError('');}}
        className={`text-left p-5 rounded-lg border ${focus===key?'bg-[#183b3d] text-white':'bg-white border-[#dce2db] text-[#183235]'}`}>
        <Icon size={22} className="mb-3"/><h2 className="text-sm font-semibold mb-2">{label}</h2><p className="text-xs leading-relaxed">{question}</p>
      </button>)}
    </div>
    <div className="bg-white border border-[#dce2db] rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-3 flex gap-2 items-center"><Brain size={18}/>{current.label}</h2>
      <p className="text-sm mb-4">{current.question}</p>
      <button type="button" disabled={loading} onClick={generate} className="bg-[#126959] text-white rounded px-5 py-2 text-xs font-medium disabled:opacity-50 flex gap-2 items-center">
        <Sparkles size={14}/>{loading?'Reviewing source evidence…':'Generate research brief'}
      </button>
      <p className="text-xs text-[#6c7c7d] mt-3">If live AI is unavailable, the service returns a labeled source brief. It does not substitute generated conclusions.</p>
    </div>
    {error&&<p role="alert" className="bg-[#edf0df] p-4 rounded text-sm mb-4">{error}</p>}
    {result&&<article className="bg-white border border-[#dce2db] rounded-lg p-6 mb-6">
      <p role="status" className="text-xs text-[#69734f] bg-[#edf0df] p-3 rounded mb-4">{result.notice}</p>
      <MarkdownRenderer content={result.insights}/>
      <div className="flex flex-wrap gap-3 mt-5 text-xs">{result.citedInvestigations?.map(id=><Link className="text-[#126959] underline" key={id} to={`/explore?selected=${id}`}>{id} — inspect evidence</Link>)}</div>
    </article>}
    <div className="bg-[#edf0df] p-5 rounded-lg text-xs leading-relaxed text-[#69734f]">
      <strong>Evidence boundary:</strong> An objective is not an observed result. This catalog does not establish safe oxygen levels, certify equipment, or validate lunar/Martian fire behavior. <Link className="underline" to="/method">Inspect methods and sources.</Link>
    </div>
  </div>;
}
