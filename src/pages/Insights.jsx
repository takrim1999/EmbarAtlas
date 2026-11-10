import { useState } from 'react';
import { Brain, Sparkles, Moon, Rocket, Home, Globe, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../lib/api';

const FOCUSES = [
  { 
    key: 'lunar', 
    label: 'Lunar Habitat & Rovers', 
    icon: Moon, 
    badge: '30%+ O₂ / 10.2 psi',
    desc: 'Fire safety implications for Artemis Moon Base and pressurized rovers with elevated oxygen atmospheres.' 
  },
  { 
    key: 'spacecraft', 
    label: 'Orbital Spacecraft & Stations', 
    icon: Home, 
    badge: 'Ventilation & Scale',
    desc: 'Flame spread across solids in forced airflows, Saffire large-scale spacecraft burns, and ISS ventilation.' 
  },
  { 
    key: 'mars', 
    label: 'Mars Mission & Surface', 
    icon: Rocket, 
    badge: 'Extended Duration',
    desc: 'Long-duration transit fire suppression, aerosol sensor longevity, and Martian partial-gravity considerations.' 
  },
  { 
    key: 'general', 
    label: 'Earth & Terrestrial Spin-offs', 
    icon: Globe, 
    badge: 'Cross-Domain Impact',
    desc: 'NASA microgravity discoveries applied on Earth: fine water-mist suppressants, firefighter breathing gear, smoke detectors.' 
  },
];

// Curated fallbacks in case the live API call is pending key configuration
const CURATED_INSIGHTS = {
  lunar: `### 1. Critical Findings for Lunar Habitats (Artemis Moon Base & Rovers)
- **Elevated Oxygen Hazard:** To enable frequent spacesuit EVAs without hours of decompression pre-breathing, lunar habitats will operate at ~10.2 psi with **30% to 34% O₂**. Evidence from ACME CFI-G [ACME-CFI-G] and BASS-II [PSI-25] shows that materials considered self-extinguishing in standard 21% air burn vigorously at ≥30% O₂.
- **Diffusive vs Quenched Flames:** In low gravity, the absence of buoyant convective cooling can actually sustain flames at lower forced velocities because hot combustion products remain localized, preheating adjacent solid material [PSI-24, PSI-25].
- **No Buoyancy Trap:** Without buoyancy, fire alarms reliant on thermal updrafts fail completely. Airflow circulation loops within rovers govern smoke trajectory directly [PSI-102].

### 2. Scientific Knowledge Gaps
- **Partial Gravity Absence:** There is currently **zero partial-gravity (1/6g) combustion data** in the NASA PSI archive. Research relies on electric-field analogies [ACME-EFF] or bounding between 0g and 1g.
- **Mixed Material Interactions:** Flammability limits for composite fabrics in pressurized rovers at 32% O₂ require full-scale validation [PSI-98].

### 3. Engineering Recommendations
- Implement multi-criteria smoke detection combining ionization and optical particle sizing [PSI-101, PSI-102] calibrated for larger spherical agglomerates formed in low flow.
- Ensure ventilation shut-off protocols are automated upon detection to remove forced oxidizer flow [PSI-25].`,

  spacecraft: `### 1. Critical Findings for Orbital Spacecraft & Stations
- **Ventilation Is Fuel:** In true microgravity, flames in perfectly stagnant air often self-extinguish due to oxygen starvation and spherical soot cloud accumulation [ACME-BRE, PSI-69]. Slow forced ventilation (e.g. standard ISS cabin air loops at 5–20 cm/s) dramatically increases flame spread and burning rate [PSI-25, PSI-98].
- **Large-Scale Behavior Differs:** The Saffire series [PSI-98, PSI-99, PSI-100] proved that small-scale flammability tests in ground chambers severely underestimate flame spread rates on large spacecraft fabrics inside real spacecraft enclosures.
- **Cool Flames Phenomenon:** ACME CFI [CFI] and CFI-G [ACME-CFI-G] demonstrated that droplet and gaseous fuels can sustain low-temperature "cool flame" burning undetectable to conventional infrared sensors long after the primary visible flame extinguished.

### 2. Knowledge Gaps
- Detection of low-temperature cool flame oxidation before catastrophic reignition in cabin atmosphere.
- Suppression agent transport dynamics across complex ISS rack geometries.

### 3. Engineering Recommendations
- Rapid atmosphere venting or localized CO₂/He displacement [PSI-69].
- Strict airflow isolation zones for electronic and storage bays.`,

  mars: `### 1. Critical Findings for Long-Duration Mars Exploration
- **Sensor Drift & Aerosol Aging:** Over 3-year missions, smoke detector optics suffer from dust contamination and particle deposition. Studies in DAFT [DAFT] and SAME-R [PSI-101] highlight the necessity of cleanable particle spectrometers and differential sensors.
- **Suppression Logistics:** Gaseous halon replacements like He and CO₂ studied in FLEX [PSI-69] require pressurized bottle reserves. Water-mist systems minimize payload mass while preventing toxic residue.

### 2. Knowledge Gaps
- Long-term storage of chemical suppressants in deep space thermal environments.
- Martian 0.38g flame propagation dynamics across regolith-contaminated habitat surfaces.

### 3. Engineering Recommendations
- Dual-mode aerosol monitoring capable of distinguishing habitat dust from material pyrolysis smoke [DAFT, PSI-102].`,

  general: `### 1. Terrestrial Fire Safety Spin-Offs from NASA Research
- **Fine Water-Mist Extinguishers:** Droplet extinction physics developed in FLEX [PSI-69, PSI-70] directly informed terrestrial fine-water-mist fire extinguishers used in data centers, historical archives, and aircraft, replacing ozone-depleting halons.
- **Advanced Firefighter SCBA Gear:** Lightweight pressure vessels and heat-resistant polymers developed for Saffire and BASS [PSI-25, PSI-98] are now standard in structural firefighting suits and breathing equipment.
- **Terrestrial Industrial Dust & Aerosol Detection:** Diagnostic instruments designed for SAME [PSI-102] and DAFT [DAFT] have transferred to commercial cleanroom air quality and coal-mine dust monitoring.

### 2. Cross-Disciplinary Value
- Microgravity provides a clean 1D or spherical spherical diffusion boundary without buoyant turbulence, validating fundamental chemical kinetics equations used worldwide in building fire code simulations.`
};

export default function Insights() {
  const [focus, setFocus] = useState('lunar');
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSiGenerated, setIsSiGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setInsights('');
    try {
      const data = await api.getInsights(focus);
      setInsights(data.insights);
      setIsSiGenerated(true);
    } catch (err) {
      console.warn('SI insight service fallback triggered:', err);
      // Fallback to curated research insight
      setInsights(CURATED_INSIGHTS[focus]);
      setIsSiGenerated(false);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load curated insight if none present
  const currentText = insights || CURATED_INSIGHTS[focus];

  return (
    <div className="animate-fade-in">
      <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">SUPER INTELLIGENCE (SI) ENGINE</p>
      <h1 className="text-3xl font-medium tracking-tight mb-2">Fire Safety Synthesis & Insights</h1>
      <p className="text-xs text-[#6c7c7d] leading-relaxed max-w-2xl mb-8">
        Extract foundational fire safety guidance for next-generation exploration vehicles, Artemis lunar outposts, and terrestrial applications.
      </p>

      {/* Focus selection cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {FOCUSES.map(f => {
          const Icon = f.icon;
          const isSelected = focus === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFocus(f.key);
                setInsights('');
                setIsSiGenerated(false);
              }}
              className={`text-left p-5 rounded-lg border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#183b3d] text-white border-[#183b3d] shadow-md'
                  : 'bg-white border-[#dce2db] text-[#183235] hover:border-[#126959]/40 hover:bg-[#fafbf8]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Icon size={22} className={isSelected ? 'text-[#b5d6b7]' : 'text-[#126959]'} />
                  <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded ${
                    isSelected ? 'bg-white/15 text-[#d9e8c9]' : 'bg-[#eaf0e6] text-[#41604e]'
                  }`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.label}</h3>
                <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-[#b1c6bf]' : 'text-[#6c7c7d]'}`}>
                  {f.desc}
                </p>
              </div>
              <div className={`mt-3 text-[10px] font-medium ${isSelected ? 'text-[#d9e8c9]' : 'text-[#126959]'}`}>
                {isSelected ? '● Active Scenario' : 'Select scenario →'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg border border-[#dce2db] shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-[#526b59]">
          <Brain size={18} className="text-[#126959]" />
          <span>Synthesizing evidence across 22 NASA investigations for <strong>{FOCUSES.find(f => f.key === focus)?.label}</strong></span>
        </div>
        
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="bg-[#126959] text-white rounded px-5 py-2 text-xs font-medium hover:bg-[#126959]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          <Sparkles size={14} />
          {loading ? 'Synthesizing with SI Cascade…' : 'Regenerate Live with SI'}
        </button>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white border border-[#dce2db] rounded-lg p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e4e9df] pb-4 mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-[#eaf0e6] flex items-center justify-center text-[#126959]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#183235]">
                {FOCUSES.find(f => f.key === focus)?.label} — Fire Safety Synthesis
              </h2>
              <p className="text-[10px] text-[#6c7c7d] font-mono">
                {isSiGenerated ? 'Live Super Intelligence (SI) Multi-Model Synthesis' : 'Curated Expert Baseline + Source Citations'}
              </p>
            </div>
          </div>
          <span className={`text-[9px] uppercase tracking-wider px-2.5 py-1 rounded font-medium ${
            isSiGenerated ? 'bg-[#e5edf3] text-[#4e768c]' : 'bg-[#edf0df] text-[#69734f]'
          }`}>
            {isSiGenerated ? 'LIVE SI SYNTHESIS' : 'CURATED EVIDENCE BRIEF'}
          </span>
        </div>

        <div
          className="ai-response text-xs text-[#51675b] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: currentText.replace(/\n/g, '<br />') }}
        />

        <div className="mt-8 pt-4 border-t border-[#e4e9df] flex items-start gap-2.5 bg-[#fdfefc] p-4 rounded-md">
          <AlertTriangle size={16} className="text-[#df8656] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#83907e] leading-relaxed">
            <strong>Scientific Guardrail:</strong> Findings are grounded in NASA PSI data. Microgravity observations do not constitute operational safety certification. Partial-gravity behavior on the Moon (0.166g) and Mars (0.376g) represents an active research boundary awaiting planned experiments (LUCI, FM2).
          </p>
        </div>
      </div>
    </div>
  );
}
