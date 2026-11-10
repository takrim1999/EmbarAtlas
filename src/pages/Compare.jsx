import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GitCompareArrows, Plus, Sparkles, X, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allInvestigations, setAllInvestigations] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      setSelectedIds(idsParam.split(',').filter(Boolean).slice(0, 3));
    } else {
      // Default comparison if empty
      setSelectedIds(['PSI-25', 'PSI-98']);
    }
    
    api.getInvestigations().then(data => {
      setAllInvestigations(data.investigations || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      api.compareInvestigations(selectedIds)
        .then(data => setComparison(data))
        .catch(console.error);
      setSearchParams({ ids: selectedIds.join(',') });
    } else {
      setComparison(null);
      if (selectedIds.length > 0) {
        setSearchParams({ ids: selectedIds.join(',') });
      } else {
        setSearchParams({});
      }
    }
  }, [selectedIds]);

  function addId(id) {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function removeId(id) {
    setSelectedIds(selectedIds.filter(i => i !== id));
    setAiSummary('');
  }

  async function generateAiComparison() {
    if (selectedIds.length < 2) return;
    setLoadingAi(true);
    setAiSummary('');
    try {
      const data = await api.summarize(selectedIds);
      setAiSummary(data.summary || 'No summary returned.');
    } catch (err) {
      setAiSummary('Failed to generate SI comparison. Check GEMINI_API_KEY configuration.');
    } finally {
      setLoadingAi(false);
    }
  }

  const available = allInvestigations.filter(inv => !selectedIds.includes(inv.id));

  return (
    <div className="animate-fade-in">
      <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">SIDE-BY-SIDE EVALUATION</p>
      <h1 className="text-3xl font-medium tracking-tight mb-2">Compare Investigations</h1>
      <p className="text-xs text-[#6c7c7d] leading-relaxed max-w-xl mb-6">
        Contrast up to three studies across hardware facilities, oxygen concentrations, test conditions, and scientific boundary limits.
      </p>

      {/* Selected chips bar */}
      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        {selectedIds.map(id => {
          const inv = allInvestigations.find(i => i.id === id);
          return (
            <span key={id} className="flex items-center gap-2 bg-white border border-[#dce2db] rounded-full px-3.5 py-1.5 text-xs shadow-2xs">
              <strong className="text-[#183235]">{inv?.name || id}</strong>
              <span className="text-[#8c9a90] text-[10px] font-mono">{id}</span>
              <button
                type="button"
                onClick={() => removeId(id)}
                className="text-[#8c9a90] hover:text-red-500 transition-colors ml-1"
                aria-label={`Remove ${id}`}
              >
                <X size={13} />
              </button>
            </span>
          );
        })}
        
        {selectedIds.length < 3 && (
          <div className="relative group">
            <button className="flex items-center gap-1.5 border border-dashed border-[#a0b898] rounded-full px-3.5 py-1.5 text-xs text-[#126959] hover:bg-[#eaf0e6] transition-colors font-medium">
              <Plus size={14} /> Add study ({selectedIds.length}/3)
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#dce2db] rounded-lg shadow-lg z-20 w-72 max-h-64 overflow-y-auto hidden group-hover:block">
              {available.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => addId(inv.id)}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#f3f5ed] border-b border-[#f0f3ee] last:border-0 flex items-center justify-between"
                >
                  <span className="font-medium text-[#183235]">{inv.name}</span>
                  <span className="text-[10px] text-[#8c9a90] font-mono">{inv.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {selectedIds.length > 0 && (
          <button
            onClick={() => { setSelectedIds([]); setAiSummary(''); }}
            className="text-xs text-[#6c7c7d] hover:text-[#183235] ml-2"
          >
            Clear all
          </button>
        )}
      </div>

      {!comparison && (
        <div className="border border-dashed border-[#c9d6c6] rounded-lg p-10 text-center text-[#70866f] bg-white">
          <GitCompareArrows size={36} className="mx-auto mb-3 text-[#a0b898]" />
          <p className="font-semibold text-sm mb-1">
            {selectedIds.length === 0 ? 'Select investigations to compare' : 'Select at least one more investigation'}
          </p>
          <p className="text-xs text-[#6c7c7d] max-w-sm mx-auto">
            Choose from the dropdown above or go to the <Link to="/explore" className="text-[#126959] underline">evidence catalog</Link> to check boxes.
          </p>
        </div>
      )}

      {comparison && (
        <>
          {/* Comparison table */}
          <div className="bg-white border border-[#dce2db] rounded-lg overflow-hidden mb-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f3f6f0] border-b border-[#dce2db]">
                    <th className="text-left p-4 text-[#607663] font-semibold text-[11px] w-40 uppercase tracking-wide">
                      Parameter
                    </th>
                    {comparison.investigations.map(inv => (
                      <th key={inv.id} className="text-left p-4 min-w-[240px]">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-[#183235]">{inv.name}</h3>
                          <span className={`text-[8px] uppercase tracking-wider rounded px-1.5 py-0.5 ${
                            inv.topic === 'prevention' ? 'bg-[#e9f0e2] text-[#59774d]' :
                            inv.topic === 'detection' ? 'bg-[#e5edf3] text-[#4e768c]' :
                            inv.topic === 'suppression' ? 'bg-[#f9eddd] text-[#9d7440]' :
                            'bg-[#ede5f3] text-[#7c5e8a]'
                          }`}>
                            {inv.topic.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8c9a90] font-mono mt-0.5">{inv.id} · NASA PSI</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e9df]">
                  <tr className="hover:bg-[#fafbf8]">
                    <th className="text-left p-4 text-[11px] font-semibold text-[#607663] align-top bg-[#fafcf9]">
                      Full Title
                    </th>
                    {comparison.investigations.map(inv => (
                      <td key={inv.id} className="p-4 text-[#526b59] align-top font-medium">
                        {inv.title}
                      </td>
                    ))}
                  </tr>
                  
                  {comparison.comparison.map(row => (
                    <tr key={row.field} className="hover:bg-[#fafbf8]">
                      <th className="text-left p-4 text-[11px] font-semibold text-[#607663] align-top bg-[#fafcf9]">
                        {row.label}
                      </th>
                      {row.values.map(v => (
                        <td key={v.id} className={`p-4 text-[#526b59] align-top leading-relaxed ${!row.allSame ? 'bg-[#fffef7]' : ''}`}>
                          {v.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  <tr className="hover:bg-[#fafbf8]">
                    <th className="text-left p-4 text-[11px] font-semibold text-[#607663] align-top bg-[#fafcf9]">
                      Safety Score
                    </th>
                    {comparison.investigations.map(inv => (
                      <td key={inv.id} className="p-4 text-[#126959] font-bold text-xs align-top">
                        ★ {inv.safety_relevance_score || 0} / 10
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-[#fafbf8]">
                    <th className="text-left p-4 text-[11px] font-semibold text-[#607663] align-top bg-[#fafcf9]">
                      Source & DOI
                    </th>
                    {comparison.investigations.map(inv => (
                      <td key={inv.id} className="p-4 align-top">
                        <a
                          href={inv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#126959] no-underline hover:underline flex items-center gap-1 font-medium"
                        >
                          NASA PSI Record ({inv.id}) <ExternalLink size={11} />
                        </a>
                        {inv.doi && <span className="block text-[10px] text-[#8c9a90] font-mono mt-0.5">DOI: {inv.doi}</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#edf0df] border border-[#dbe2c8] rounded-lg px-5 py-3 text-xs text-[#69734f] leading-relaxed mb-6">
            <strong>Evidence Boundary Note:</strong> This compares investigation metadata and objectives. Microgravity results (0g) cannot be directly substituted for Moon (1/6g) or Mars (3/8g) gravitational acceleration without validated partial-gravity testing (e.g. future LUCI, FM2).
          </div>

          {/* SI Comparison Analysis */}
          <div className="bg-white border border-[#dce2db] rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold uppercase mb-0.5">SUPER INTELLIGENCE (SI) ENGINE</p>
                <h2 className="text-lg font-semibold text-[#183235]">SI Synthesis & Contrast Analysis</h2>
              </div>
              <button
                type="button"
                onClick={generateAiComparison}
                disabled={loadingAi}
                className="bg-[#126959] text-white rounded px-4 py-2 text-xs font-medium hover:bg-[#126959]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                <Sparkles size={14} />
                {loadingAi ? 'Synthesizing with SI Cascade…' : 'Generate SI Synthesis'}
              </button>
            </div>
            
            {aiSummary ? (
              <div 
                className="ai-response text-xs text-[#51675b] leading-relaxed bg-[#fbfdfa] p-5 rounded-lg border border-[#e2e7df]"
                dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }}
              />
            ) : (
              <p className="text-xs text-[#6c7c7d] py-3">
                Click <strong>"Generate SI Synthesis"</strong> to instruct the Super Intelligence engine to cross-examine these {selectedIds.length} investigations for complementary findings, opposing limitations, and implications for human spaceflight fire safety.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
