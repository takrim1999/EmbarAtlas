import { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Database, Award, AlertTriangle, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

export default function Method() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInvestigations().then(data => {
      setInvestigations(data.investigations || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in max-w-5xl">
      <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">TRANSPARENCY BY DESIGN</p>
      <h1 className="text-3xl font-medium tracking-tight mb-2">Evidence You Can Inspect</h1>
      <p className="text-xs text-[#6c7c7d] leading-relaxed max-w-xl mb-8">
        Every catalog entry traces to a NASA Physical Science Informatics archive record. Every AI interpretation has explicit scientific boundaries.
      </p>

      {/* 4 Tenets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {[
          {
            step: '01 / SOURCE CORPUS',
            title: 'NASA PSI Database',
            icon: Database,
            text: '22 investigations reviewed from NASA Physical Science Informatics (PSI), encompassing microgravity flight experiments conducted aboard the ISS (in CIR, MSG) and uncrewed Cygnus spacecraft (Saffire). Includes experimental tabular logs, objectives, hardware architectures, and sensor suites.',
          },
          {
            step: '02 / RELEVANCE METRIC',
            title: 'Safety Relevance Scoring',
            icon: Award,
            text: 'Investigations are rated on a 0–10 scale based on direct applicability to human spaceflight fire safety (prevention, detection, suppression). Solid flammability and large-scale burns (BASS-II, Saffire) rank highest due to relevance to cabin materials; droplet and gaseous studies provide foundational transport metrics.',
          },
          {
            step: '03 / INTERPRETATION',
            title: 'Grounded Super Intelligence (SI)',
            icon: ShieldCheck,
            text: 'The AI assistant and synthesis engine (powered by Google Gemini 2.0 Flash) are bound by strict grounding rules. Answers must cite specific investigation IDs (e.g. [PSI-25], [PSI-98]) and explicitly distinguish hypotheses and objectives from verified experimental findings.',
          },
          {
            step: '04 / EVIDENCE BOUNDARY',
            title: 'Know Where Evidence Stops',
            icon: AlertTriangle,
            text: 'This system is a research discovery and decision-support dashboard, not operational flight certification software. Crucially, the PSI database currently contains zero partial-gravity combustion data; microgravity (0g) results cannot be presumed to validate lunar (1/6g) or Martian (3/8g) behavior.',
          },
        ].map(card => {
          const Icon = card.icon;
          return (
            <article key={card.step} className="bg-white border border-[#dce2db] rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] text-[#8c9c80] font-mono tracking-wider">{card.step}</span>
                <Icon size={16} className="text-[#126959]" />
              </div>
              <h2 className="text-base font-semibold mb-2 text-[#183235]">{card.title}</h2>
              <p className="text-xs text-[#677d6d] leading-relaxed">{card.text}</p>
            </article>
          );
        })}
      </div>

      {/* Hardware Lineage Context */}
      <div className="bg-white border border-[#dce2db] rounded-lg p-6 mb-8 shadow-2xs">
        <h2 className="text-base font-semibold mb-3 text-[#183235] flex items-center gap-2">
          <BookOpen size={16} className="text-[#126959]" />
          ISS Research Hardware Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#51675b] leading-relaxed">
          <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df]">
            <h3 className="font-semibold text-[#183235] mb-1">CIR + ACME</h3>
            <p className="text-[11px] text-[#6c7c7d]">
              The Combustion Integrated Rack with the Advanced Combustion via Microgravity Experiments insert hosted 6 gaseous experiments (BRE, CFI-G, E-FIELD, s-Flame, CLD Flame, Coflow) using modular burner heads.
            </p>
          </div>
          <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df]">
            <h3 className="font-semibold text-[#183235] mb-1">CIR + MDCA</h3>
            <p className="text-[11px] text-[#6c7c7d]">
              The Multi-user Droplet Combustion Apparatus studied single droplets of liquid fuels (FLEX, FLEX-2, CFI) suspended on fibers or free-floating, observing radiatively cooled extinction and cool flames.
            </p>
          </div>
          <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df]">
            <h3 className="font-semibold text-[#183235] mb-1">MSG Flow Duct</h3>
            <p className="text-[11px] text-[#6c7c7d]">
              The Microgravity Science Glovebox hosted BASS, BASS-II, SPICE, and SLICE using a modular fan-driven flow duct to simulate low-velocity cabin ventilation over solid and gaseous fuel samples.
            </p>
          </div>
        </div>
      </div>

      {/* Source Register Table */}
      <div className="bg-white border border-[#dce2db] rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#183235]">Primary NASA PSI Source Register</h2>
            <p className="text-[11px] text-[#6c7c7d]">All 22 indexed investigations and primary citations</p>
          </div>
          <span className="text-xs font-mono bg-[#eaf0e6] text-[#126959] px-2.5 py-1 rounded">
            {investigations.length} Investigations
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-[#6c7c7d]">Loading source register…</div>
        ) : (
          <div className="divide-y divide-[#e8ece3] max-h-96 overflow-y-auto pr-1">
            {investigations.map(inv => (
              <div key={inv.id} className="py-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-medium text-[#183235]">{inv.name}</strong>
                    <span className="text-[10px] text-[#8c9a90] font-mono">({inv.id})</span>
                    <span className="text-[9px] bg-[#f5f6f2] text-[#6c7c7d] px-1.5 py-0.5 rounded">
                      {inv.topic?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#526b59] mt-0.5">{inv.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#8c9a90] mt-1 font-mono">
                    {inv.doi && <span>DOI: {inv.doi}</span>}
                    <span>Hardware: {inv.hardware || 'N/A'}</span>
                    <span>License: {inv.license || 'CC0-1.0'}</span>
                  </div>
                </div>
                <a
                  href={inv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#126959] font-medium no-underline hover:underline whitespace-nowrap flex items-center gap-1 shrink-0"
                >
                  NASA PSI <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#edf0df] border border-[#dbe2c8] rounded-lg px-5 py-4 text-xs text-[#69734f] leading-relaxed">
        <strong>NASA Space Apps Challenge 2026:</strong> Flame in Freefall. Built as an evidence exploration, ranking, and synthesis tool for aerospace researchers, students, and life support engineers.
      </div>
    </div>
  );
}
