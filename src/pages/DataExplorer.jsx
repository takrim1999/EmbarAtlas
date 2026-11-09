import { useState, useEffect } from 'react';
import { Download, Table, BarChart3, AlertCircle, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../lib/api';

const METRIC_LABELS = {
  burn_time_s: { label: 'Burn Duration', unit: 's' },
  initial_diameter_mm: { label: 'Initial Droplet Diameter', unit: 'mm' },
  extinction_diameter_mm: { label: 'Extinction Diameter', unit: 'mm' },
  pressure_mmhg: { label: 'Ambient Pressure', unit: 'mmHg' },
  oxygen_mole_fraction: { label: 'Oxygen Mole Fraction', unit: 'fraction' },
  flame_spread_rate: { label: 'Flame Spread Rate', unit: 'mm/s' },
  flow_velocity: { label: 'Forced Flow Velocity', unit: 'cm/s' },
  temperature_c: { label: 'Peak Temperature', unit: '°C' },
};

export default function DataExplorer() {
  const [investigations, setInvestigations] = useState([]);
  const [selectedId, setSelectedId] = useState('PSI-69');
  const [investigation, setInvestigation] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('burn_time_s');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    api.getInvestigations().then(res => {
      const list = res.investigations || [];
      setInvestigations(list);
      // Preselect PSI-69 (FLEX) if present, else first
      const hasFlex = list.find(i => i.id === 'PSI-69');
      if (hasFlex) {
        setSelectedId('PSI-69');
      } else if (list.length > 0) {
        setSelectedId(list[0].id);
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.getInvestigation(selectedId).then(inv => {
      setInvestigation(inv);
      const rows = inv.experimentalData || [];
      setData(rows);
      
      // Select appropriate metric for this dataset
      if (rows.length > 0) {
        const availableMetrics = Object.keys(rows[0]).filter(k => 
          typeof rows[0][k] === 'number' && k !== 'id' && rows.some(r => r[k] !== null)
        );
        if (availableMetrics.length > 0 && !availableMetrics.includes(metric)) {
          setMetric(availableMetrics[0]);
        }
      }
    }).catch(console.error);
  }, [selectedId]);

  const numericCols = data.length > 0
    ? Object.keys(data[0]).filter(k =>
        typeof data[0][k] === 'number' && k !== 'id'
      )
    : [];

  const sortedData = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function toggleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  const chartData = data
    .filter(row => row[metric] !== null && row[metric] !== undefined)
    .map(row => ({
      name: row.test_id || `#${row.id}`,
      value: row[metric],
      end: row.test_end || 'Completed',
    }));

  const colLabels = {
    test_id: 'Test ID',
    fuel: 'Fuel',
    pressure_mmhg: 'Pressure (mmHg)',
    oxygen_mole_fraction: 'O₂ Fraction',
    initial_diameter_mm: 'Init. Diam. (mm)',
    extinction_diameter_mm: 'Ext. Diam. (mm)',
    burn_time_s: 'Burn Time (s)',
    flame_spread_rate: 'Spread Rate (mm/s)',
    flow_velocity: 'Flow Velocity (cm/s)',
    sample_material: 'Material',
    sample_geometry: 'Geometry',
    temperature_c: 'Temp (°C)',
    test_end: 'Test Ending',
    notes: 'Observations',
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-[#6c7c7d]">Loading experimental data explorer…</div>;
  }

  return (
    <div className="animate-fade-in">
      <p className="text-[9px] tracking-[1.8px] font-bold text-[#6c7c7d] mb-1 uppercase">NASA PSI EXPERIMENTAL LOGS</p>
      <h1 className="text-3xl font-medium tracking-tight mb-2">Experimental Data Explorer</h1>
      <p className="text-xs text-[#6c7c7d] leading-relaxed max-w-xl mb-6">
        Inspect recorded test measurements from NASA Physical Science Informatics tables. Examine burn durations, extinction diameters, ambient pressures, and test endings.
      </p>

      {/* Investigation Selector */}
      <div className="bg-white border border-[#dce2db] rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
        <label className="text-xs font-medium text-[#677c71] flex items-center gap-3">
          <span>Select Investigation:</span>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="bg-[#f5f6f2] border border-[#d8e0d6] rounded px-3 py-1.5 text-xs text-[#183235] font-medium"
          >
            {investigations.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.name} ({inv.id}) — {inv.fuel_type}
              </option>
            ))}
          </select>
        </label>
        
        {data.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6c7c7d] font-mono mr-2">{data.length} records in database</span>
            <a
              href={api.exportCsv(selectedId)}
              download
              className="bg-white text-[#41604e] border border-[#d4ded1] rounded px-3 py-1.5 text-xs no-underline flex items-center gap-1.5 hover:bg-[#f3f5ed] font-medium shadow-2xs"
            >
              <Download size={13} /> Export CSV
            </a>
            <a
              href={api.exportJson(selectedId)}
              download
              className="bg-white text-[#41604e] border border-[#d4ded1] rounded px-3 py-1.5 text-xs no-underline flex items-center gap-1.5 hover:bg-[#f3f5ed] font-medium shadow-2xs"
            >
              <Download size={13} /> Export JSON
            </a>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="border border-dashed border-[#c9d6c6] rounded-lg p-12 text-center text-[#70866f] bg-white">
          <Table size={36} className="mx-auto mb-3 text-[#a0b898]" />
          <p className="font-semibold text-sm mb-1">No raw tabular records loaded for {investigation?.name || selectedId}</p>
          <p className="text-xs text-[#6c7c7d] max-w-md mx-auto">
            This investigation is currently cataloged with objectives and metadata. Switch to <strong>FLEX (PSI-69)</strong>, <strong>FLEX-2 (PSI-70)</strong>, <strong>BASS-II (PSI-25)</strong>, or <strong>Saffire-I (PSI-98)</strong> to view experimental rows.
          </p>
        </div>
      ) : (
        <>
          {/* Top Row: Chart + Context */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 mb-6 items-start">
            {/* Chart */}
            <div className="bg-white border border-[#dce2db] rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold uppercase mb-0.5">PLOT MEASUREMENTS</p>
                  <h2 className="text-base font-semibold text-[#183235]">
                    {METRIC_LABELS[metric]?.label || metric} {METRIC_LABELS[metric]?.unit ? `(${METRIC_LABELS[metric]?.unit})` : ''}
                  </h2>
                </div>
                <label className="text-[10px] text-[#6c7c7d] flex items-center gap-1.5">
                  Metric:
                  <select
                    value={metric}
                    onChange={e => setMetric(e.target.value)}
                    className="bg-[#f5f6f2] border border-[#d8e0d6] rounded px-2.5 py-1 text-xs text-[#435d51]"
                  >
                    {numericCols.map(col => (
                      <option key={col} value={col}>
                        {METRIC_LABELS[col]?.label || colLabels[col] || col}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 25, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e9df" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9, fill: '#6c7c7d' }} 
                      angle={-20} 
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tick={{ fontSize: 9, fill: '#6c7c7d' }} />
                    <Tooltip
                      contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #dce2db', backgroundColor: '#fff' }}
                      formatter={(value) => [`${value} ${METRIC_LABELS[metric]?.unit || ''}`, METRIC_LABELS[metric]?.label || metric]}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {chartData.map((entry, index) => {
                        let fill = '#a0b898'; // default
                        if (entry.end === 'Disruption') fill = '#df8656';
                        else if (entry.end === 'Extinction' || entry.end === 'Quenched') fill = '#126959';
                        else if (entry.end === 'Self-Extinguished') fill = '#4e768c';
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-[#83907e] mt-3 pt-3 border-t border-[#f0f3ee]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#126959] rounded-2xs inline-block" /> Extinction/Quenched</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#df8656] rounded-2xs inline-block" /> Disruption</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#4e768c] rounded-2xs inline-block" /> Self-Extinguished</span>
                </div>
                <span>Bars start at zero</span>
              </div>
            </div>

            {/* Context Card */}
            {investigation && (
              <div className="bg-white border border-[#dce2db] rounded-lg p-6 shadow-sm">
                <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold uppercase mb-1">DATA CONTEXT</p>
                <h2 className="text-xl font-semibold leading-snug mb-1 text-[#183235]">
                  {investigation.name}
                </h2>
                <p className="text-xs text-[#526b59] mb-4">{investigation.title}</p>
                
                <dl className="text-xs space-y-2.5 border-t border-b border-[#f0f3ee] py-3 my-3">
                  <div>
                    <dt className="text-[10px] font-semibold text-[#839080] uppercase">Fuel & Material</dt>
                    <dd className="text-[#183235] font-medium">{investigation.fuel_type}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold text-[#839080] uppercase">Hardware Setup</dt>
                    <dd className="text-[#183235]">{investigation.hardware || 'Not specified'} — {investigation.facility || 'ISS'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold text-[#839080] uppercase">Test Conditions Extracted</dt>
                    <dd className="text-[#50684e] leading-relaxed">{investigation.conditions || 'Microgravity test environment'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold text-[#839080] uppercase">Data Provenance</dt>
                    <dd className="text-[#6c7c7d] leading-relaxed text-[11px]">
                      Transcribed directly from the NASA Physical Science Informatics database table ({investigation.id}).
                    </dd>
                  </div>
                </dl>
                
                <a
                  href={investigation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#126959] font-medium no-underline hover:underline flex items-center gap-1 mt-2"
                >
                  Inspect primary source on NASA PSI ↗
                </a>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-[#dce2db] rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-[#e4e9df] flex items-center justify-between bg-[#fafbf8]">
              <div>
                <h3 className="text-sm font-semibold text-[#183235]">Experimental Run Matrix</h3>
                <p className="text-[10px] text-[#6c7c7d]">Click column headers to sort values</p>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-[#f3f6f0] z-10">
                  <tr>
                    {Object.keys(data[0]).filter(k => k !== 'id' && k !== 'investigation_id').map(col => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="text-left p-3.5 text-[#607663] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-[#e8ede3] select-none border-b border-[#dce2db]"
                      >
                        {colLabels[col] || col.replace(/_/g, ' ')}
                        {sortCol === col && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e9df]">
                  {sortedData.map((row, i) => (
                    <tr key={i} className="hover:bg-[#fbfcf9] transition-colors">
                      {Object.entries(row).filter(([k]) => k !== 'id' && k !== 'investigation_id').map(([k, v]) => (
                        <td key={k} className="p-3 text-[#526b59] whitespace-nowrap font-mono text-[11px]">
                          {v !== null && v !== undefined ? String(v) : <span className="text-[#b8c1b9]">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3.5 bg-[#fafbf8] border-t border-[#e4e9df] text-[10px] text-[#83907e] flex items-center justify-between">
              <span>— indicates missing or not-measured field in source table</span>
              <span>Units: pressure (mmHg), oxygen (mole fraction), diameter (mm), time (seconds)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
