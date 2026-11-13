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
        ['01 / SOURCE CORPUS','Metadata and measurements are different','The catalog contains 19 discovery entries across prevention, detection, and suppression. The numerical explorer contains 37 source-checked experimental run measurements across 10 core NASA PSI investigations (including BASS-II, BASS, FLEX, FLEX-2, SAME, Saffire, CFI, and ACME).'],
        ['02 / EDITORIAL ORDER','Navigation scores, not safety ratings','The team assigns 8/10 to prevention, detection and suppression topics, and 6/10 to fundamental combustion topics. These coarse editorial scores help browsing. They are not NASA ratings, experimental results, or validated rankings of safety.'],
        ['03 / SI ASSISTANCE','Evidence on every turn','Every SI request includes current source records. Citation IDs are checked against those records, but this does not prove that a claim follows from a source. Inspect the original study. If generation fails, the app labels its deterministic source brief and makes no new scientific conclusions.'],
        ['04 / SCIENTIFIC LIMITS','Keep inference within the evidence','Objectives and hypotheses are not findings. Individual tests cannot establish absolute flammability limits for all space environments. This curated microgravity sample from PSI does not validate partial-gravity behavior or certify flight safety without operational margin testing.'],
      ].map(([step,title,text])=><article className="bg-white border border-[#dce2db] rounded-lg p-6" key={step}><p className="text-[10px] text-[#6c7c7d] mb-3">{step}</p><h2 className="text-base font-semibold mb-2">{title}</h2><p className="text-xs text-[#677d6d] leading-relaxed">{text}</p></article>)}
    </div>
    <div className="bg-white border border-[#dce2db] rounded-lg p-6 mb-6 shadow-2xs">
      <h2 className="text-base font-semibold mb-3 text-[#183235]">ISS Research Hardware Architecture</h2>
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

    {/* NASA Challenge Resources, Historical Precedents & Terrestrial Spinoffs */}
    <div className="bg-white border border-[#dce2db] rounded-lg p-6 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#183235]">NASA Challenge Resources & Lineage</h2>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#eaf0e6] text-[#41604e] font-semibold">
          Challenge Verified
        </span>
      </div>
      <p className="text-xs text-[#6c7c7d] mb-4 leading-relaxed">
        Ember Atlas grounds its synthesis and catalog in official NASA combustion science repositories, historical flight incident lessons, and validated terrestrial spinoffs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Core Repositories */}
        <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df] flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-[#126959] uppercase block mb-1">Foundational Archives</span>
            <h3 className="font-semibold text-[#183235] mb-2">NASA PSI & Combustion Science</h3>
            <ul className="space-y-1.5 text-[11px] text-[#51675b]">
              <li>
                <a href="https://psi.nasa.gov/physci/repo/search?q=combustion" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  PSI Data Repository: Combustion <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Primary physical sciences experimental data repository.</span>
              </li>
              <li>
                <a href="https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  NASA Glenn Combustion Science <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Overview of ISS combustion facilities and science teams.</span>
              </li>
              <li>
                <a href="https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  A Researcher's Guide to ISS Combustion <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">50+ page review of ISS combustion experiments.</span>
              </li>
              <li>
                <a href="https://www.youtube.com/watch?v=W1oXykoz9zg" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  NASA ScienceCasts: Combustion on ISS <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Visual guide to microgravity spherical flames.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Historical Precedents */}
        <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df] flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-[#b45309] uppercase block mb-1">Safety Precedents</span>
            <h3 className="font-semibold text-[#183235] mb-2">Historical Spaceflight Lessons</h3>
            <ul className="space-y-1.5 text-[11px] text-[#51675b]">
              <li>
                <a href="https://sma.nasa.gov/sma-disciplines/accllp/apollo-1" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Apollo 1 Crew Mission (1967) <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">100% O₂ cabin flash fire; sparked modern flammability testing.</span>
              </li>
              <li>
                <a href="https://sma.nasa.gov/sma-disciplines/accllp/apollo-13" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Apollo 13 Oxygen Tank Investigation <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">High-pressure supercritical oxygen wire insulation failure.</span>
              </li>
              <li>
                <a href="https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Mir Space Station Fire (1997) <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Solid oxygen generator fire; demonstrated microgravity smoke trapping.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Terrestrial Spinoffs */}
        <div className="bg-[#fafbf8] p-4 rounded border border-[#e4e9df] flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-wider text-[#0e7490] uppercase block mb-1">Earth Applications</span>
            <h3 className="font-semibold text-[#183235] mb-2">NASA Fire Safety Spinoffs</h3>
            <ul className="space-y-1.5 text-[11px] text-[#51675b]">
              <li>
                <a href="https://spinoff.nasa.gov/node/9582" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Fireman's Air Tanks (#9582) <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Spacesuit life-support composite tanks adapted for firefighters.</span>
              </li>
              <li>
                <a href="https://spinoff.nasa.gov/node/9918" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Advanced Fire Attire (#9918) <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">High-temperature PBI fabrics transferred to turnout suits.</span>
              </li>
              <li>
                <a href="https://spinoff.nasa.gov/node/9407" target="_blank" rel="noopener noreferrer" className="text-[#126959] hover:underline flex items-center gap-1 font-medium">
                  Smoke vs Dust Detector (#9407) <ExternalLink size={10} />
                </a>
                <span className="text-[10px] text-[#6c7c7d] block">Shuttle particulate sizing adapted to eliminate mining false alarms.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
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
    <div className="bg-[#edf0df] border border-[#dbe2c8] rounded-lg px-5 py-4 text-xs text-[#69734f] leading-relaxed">
      <strong>NASA Space Apps Challenge 2026:</strong> Flame in Freefall. Built as an evidence exploration, ranking, and synthesis tool for aerospace researchers, students, and life support engineers.
    </div>
  </div>;
}
