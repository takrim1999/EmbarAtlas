import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Flame, User, Sparkles, RotateCcw, ExternalLink, Info } from 'lucide-react';
import { api } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const SUGGESTED = [
  'Which experiments are most relevant to lunar habitat fire safety?',
  'How do SAME and SAME-R differ in their approach to smoke detection?',
  'What do we know about flame behavior at elevated oxygen concentrations (≥30%)?',
  'Compare BASS-II and Saffire experiments for solid material flammability',
  'What are cool flames and why do they pose a hidden risk in space?',
  'What fire suppression methods were tested in the FLEX experiments?',
  'How does low ventilation airflow affect flame spread in microgravity?',
  'What terrestrial firefighting technology was derived from this NASA research?',
];

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  
  const contextId = searchParams.get('context');

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    try {
      const investigationIds = contextId ? [contextId] : undefined;
      const data = await api.chat(userMsg, sessionId, investigationIds);
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        citations: data.citedInvestigations || [],
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I couldn't reach the SI service directly (${err.message || 'Check GEMINI_API_KEY in .env'}).

**Knowledge Baseline for your query:**
In microgravity, buoyancy is absent, eliminating natural convection. Flames form diffusion-controlled spherical envelopes. Solid combustion investigations like **BASS-II [PSI-25]** and large-scale **Saffire [PSI-98]** show that slow ventilation (forced flow) drives sustained flame spread, while elevated oxygen concentrations (≥30% expected in lunar habitats) drastically lower ignition energy and raise burning rates. For smoke detection, **SAME [PSI-102]** and **SAME-R [PSI-101]** show larger particle agglomeration in microgravity.`,
        citations: contextId ? [contextId] : ['PSI-25', 'PSI-98', 'PSI-102'],
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function resetChat() {
    setMessages([]);
    setSessionId(null);
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-170px)] max-h-[850px]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-0.5 uppercase">SI RESEARCH ASSISTANT</p>
          <h1 className="text-2xl font-medium tracking-tight">
            Consult the Microgravity Fire Evidence
          </h1>
          {contextId && (
            <p className="text-xs text-[#126959] font-medium mt-0.5">
              Active Focus: <strong>{contextId}</strong> (grounding queries in this study)
            </p>
          )}
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={resetChat}
            className="text-xs text-[#6c7c7d] hover:text-[#183235] flex items-center gap-1.5 bg-white border border-[#dce2db] px-3 py-1.5 rounded"
          >
            <RotateCcw size={12} /> New conversation
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-2 rounded-lg bg-[#fafbf8] border border-[#dce2db] p-4 lg:p-6 shadow-inner">
        {messages.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <div className="w-14 h-14 bg-[#eaf0e6] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Flame size={26} className="text-[#df8656]" />
            </div>
            <h2 className="text-lg font-semibold mb-1 text-[#183235]">Ember Atlas Super Intelligence</h2>
            <p className="text-xs text-[#6c7c7d] max-w-md mx-auto leading-relaxed mb-6">
              Ask deep questions about flame diffusion, smoke detection instruments, elevated oxygen risks, and suppression in space. Grounded strictly in NASA PSI investigations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {SUGGESTED.slice(0, 6).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="text-left bg-white border border-[#dce2db] rounded-lg px-3.5 py-2.5 text-xs text-[#51675b] hover:border-[#126959]/50 hover:shadow-xs transition-all leading-relaxed"
                >
                  <Sparkles size={13} className="inline text-[#126959] mr-1.5 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#eaf0e6] rounded-lg flex items-center justify-center shrink-0 mt-1">
                <Flame size={16} className="text-[#df8656]" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-lg p-4 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#126959] text-white'
                : 'bg-white border border-[#dce2db] shadow-2xs text-[#183235]'
            }`}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}
              
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#e4e9df]">
                  <span className="text-[9px] text-[#8c9a90] font-semibold uppercase tracking-wider">CITED EVIDENCE:</span>
                  {msg.citations.map(id => (
                    <Link
                      key={id}
                      to={`/explore?selected=${id}`}
                      className="text-[9px] bg-[#edf0df] text-[#126959] px-2 py-0.5 rounded font-mono font-medium hover:bg-[#dbe6d4] no-underline flex items-center gap-1"
                    >
                      {id} ↗
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-[#126959]/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <User size={16} className="text-[#126959]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 bg-[#eaf0e6] rounded-lg flex items-center justify-center shrink-0">
              <Flame size={16} className="text-[#df8656] animate-pulse" />
            </div>
            <div className="bg-white border border-[#dce2db] rounded-lg px-4 py-3 flex items-center gap-2 text-xs text-[#6c7c7d]">
              <span className="w-2 h-2 rounded-full bg-[#126959] animate-ping" />
              <span>Analyzing NASA PSI evidence and synthesizing response…</span>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 bg-white border border-[#dce2db] rounded-lg p-2 shadow-2xs shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a scientific research question (e.g. How does oxygen concentration alter flammability limits in microgravity?)..."
          className="flex-1 border-none bg-transparent outline-none text-xs px-3 py-2 text-[#183235] placeholder:text-[#85918b]"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-[#126959] text-white rounded-md px-4 py-2 hover:bg-[#126959]/90 transition-colors disabled:opacity-40 flex items-center gap-1.5 text-xs font-medium"
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
