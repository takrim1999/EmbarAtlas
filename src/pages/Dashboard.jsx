import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Search, GitCompareArrows, Brain, Database, ArrowRight, AlertTriangle, Shield, Eye, Beaker } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../lib/api';

const TOPIC_COLORS = {
  prevention: '#126959',
  detection: '#4e768c',
  suppression: '#9d7440',
  combustion_science: '#7c5e8a',
};

const TOPIC_ICONS = {
  prevention: Shield,
  detection: Eye,
  suppression: AlertTriangle,
  combustion_science: Beaker,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getInvestigations({ sort: 'relevance' }),
    ]).then(([statsData, invData]) => {
      setStats(statsData);
      setInvestigations(invData.investigations?.slice(0, 6) || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Flame className="w-12 h-12 text-[#df8656] mx-auto animate-pulse" />
          <p className="mt-4 text-sm text-[#6c7c7d]">Loading the evidence catalog…</p>
        </div>
      </div>
    );
  }

  const topicData = stats?.byTopic?.map(t => ({
    name: t.topic.replace(/_/g, ' '),
    value: t.count,
    color: TOPIC_COLORS[t.topic] || '#888',
  })) || [];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-[#183b3d] text-white rounded-xl overflow-hidden mb-8 shadow-sm">
        <div className="p-8 lg:p-10 pb-20">
          <p className="text-[9px] tracking-[1.8px] font-bold text-[#a2c1ae] mb-3 uppercase">
            FIRE SAFETY · BEYOND EARTH
          </p>
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight leading-tight mb-4">
            Find the evidence.<br />
            <em className="not-italic text-[#b5d6b7]">Understand the fire.</em>
          </h1>
          <p className="text-xs text-[#b1c6bf] leading-relaxed max-w-md">
            Explore NASA's microgravity combustion research with source-linked research assistance.
            Compare what was studied, why it matters, and what's still unknown.
          </p>
        </div>
        
        {/* Hero mark */}
        <div className="absolute right-8 lg:right-12 top-6 w-44 h-44 flex flex-col items-center justify-center text-[#b6d6bd] opacity-40 lg:opacity-100 pointer-events-none">
          <div className="absolute inset-2 border border-[#42615a] rounded-full" />
          <span className="text-5xl italic font-serif z-10">μg</span>
          <small className="text-[7px] tracking-[2.5px] text-center leading-relaxed z-10 text-[#8cae9d] mt-2">
            PHYSICS WITHOUT<br />THE FAMILIAR
          </small>
        </div>
        
        {/* Hero stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#123032]/70 border-t border-white/10 flex flex-wrap gap-6 lg:gap-8 px-8 lg:px-10 py-3.5">
          <div className="flex gap-2 items-center">
            <strong className="text-xs font-semibold text-[#d9e8c9]">{stats?.total || 0}</strong>
            <span className="text-[10px] text-[#a9c0b7]">investigations</span>
          </div>
          <div className="flex gap-2 items-center">
            <strong className="text-xs font-semibold text-[#d9e8c9]">{stats?.dataPoints || 0}</strong>
            <span className="text-[10px] text-[#a9c0b7]">source-checked rows</span>
          </div>
          <div className="flex gap-2 items-center">
            <strong className="text-xs font-semibold text-[#d9e8c9]">{stats?.byTopic?.length || 0}</strong>
            <span className="text-[10px] text-[#a9c0b7]">research themes</span>
          </div>
          <div className="flex gap-2 items-center">
            <strong className="text-xs font-semibold text-[#d9e8c9]">NASA PSI</strong>
            <span className="text-[10px] text-[#a9c0b7]">primary source</span>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/explore', icon: Search, label: 'Explore Evidence', desc: 'Search and filter investigations', color: 'bg-[#126959]' },
          { to: '/compare', icon: GitCompareArrows, label: 'Compare Studies', desc: 'Side-by-side analysis', color: 'bg-[#4e768c]' },
          { to: '/insights', icon: Brain, label: 'Research Insights', desc: 'Source-linked research briefs', color: 'bg-[#9d7440]' },
          { to: '/chat', icon: Flame, label: 'Ask AI', desc: 'Chat with research assistant', color: 'bg-[#df8656]' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white border border-[#dce2db] rounded-lg p-5 no-underline text-[#183235] hover:border-[#126959]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 text-white`}>
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-semibold mb-1">{label}</h3>
              <p className="text-[11px] text-[#6c7c7d] leading-relaxed">{desc}</p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] text-[#126959] font-medium group-hover:translate-x-1 transition-transform">
              Open <ArrowRight size={13} />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Topic distribution */}
        <div className="bg-white border border-[#dce2db] rounded-lg p-6 flex flex-col">
          <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold mb-1 uppercase">RESEARCH THEMES</p>
          <h2 className="text-base font-semibold mb-2">Topic Distribution</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {topicData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #dce2db' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-2 justify-center">
            {topicData.map(t => (
              <span key={t.name} className="flex items-center gap-1.5 text-[10px] text-[#6c7c7d] bg-[#f5f6f2] px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                <span className="capitalize">{t.name}</span> ({t.value})
              </span>
            ))}
          </div>
        </div>

        {/* Hardware platforms */}
        <div className="bg-white border border-[#dce2db] rounded-lg p-6 flex flex-col">
          <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold mb-1 uppercase">HARDWARE</p>
          <h2 className="text-base font-semibold mb-3">Research Platforms</h2>
          <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
            {(stats?.byHardware || []).map(hw => (
              <div key={hw.hardware} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#51675b] truncate max-w-[200px]" title={hw.hardware}>{hw.hardware}</span>
                  <span className="text-[10px] text-[#6c7c7d] font-mono">{hw.count}</span>
                </div>
                <div className="w-full h-1.5 bg-[#f3f5ed] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#126959] rounded-full"
                    style={{ width: `${Math.max(5, (hw.count / (stats?.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oxygen & Safety context */}
        <div className="bg-white border border-[#dce2db] rounded-lg p-6">
          <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold mb-1 uppercase">SAFETY CONTEXT</p>
          <h2 className="text-base font-semibold mb-3">Key Fire Safety Factors</h2>
          <div className="space-y-3">
            <div className="border-l-2 border-[#df8656] pl-3">
              <p className="text-xs font-semibold text-[#183235]">Oxygen Concentration</p>
              <p className="text-[11px] text-[#6c7c7d] leading-relaxed mt-0.5">
                Compare oxygen concentration together with pressure, fuel, and apparatus. This catalog does not prescribe a habitat atmosphere.
              </p>
            </div>
            <div className="border-l-2 border-[#4e768c] pl-3">
              <p className="text-xs font-semibold text-[#183235]">Microgravity Effects</p>
              <p className="text-[11px] text-[#6c7c7d] leading-relaxed mt-0.5">
                Reduced buoyancy changes transport. Flame shape and behavior still depend on fuel, forced flow, and experimental geometry.
              </p>
            </div>
            <div className="border-l-2 border-[#126959] pl-3">
              <p className="text-xs font-semibold text-[#183235]">Partial Gravity Gap</p>
              <p className="text-[11px] text-[#6c7c7d] leading-relaxed mt-0.5">
                This curated sample contains microgravity studies. It cannot validate lunar or Martian fire behavior; consult dedicated partial-gravity research.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured investigations */}
      <div className="bg-white border border-[#dce2db] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] tracking-[1.5px] text-[#6c7c7d] font-bold mb-0.5 uppercase">PRIORITY INVESTIGATIONS</p>
            <h2 className="text-base font-semibold">Editorial Research Priorities</h2>
          </div>
          <Link to="/explore" className="text-xs text-[#126959] font-medium no-underline flex items-center gap-1 hover:underline">
            View all ({stats?.total || 0}) <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investigations.map(inv => {
            const Icon = TOPIC_ICONS[inv.topic] || Beaker;
            return (
              <Link
                key={inv.id}
                to={`/explore?selected=${inv.id}`}
                className="group border border-[#dce2db] rounded-lg p-4 no-underline text-[#183235] hover:border-[#126959]/40 hover:bg-[#fafbf8] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold group-hover:text-[#126959] transition-colors">{inv.name}</h3>
                      <p className="text-[9px] text-[#8c9a90] mt-0.5 font-mono">{inv.id} · NASA source</p>
                    </div>
                    <span className={`text-[8px] uppercase tracking-wider rounded px-2 py-0.5 shrink-0 font-medium ${
                      inv.topic === 'prevention' ? 'bg-[#e9f0e2] text-[#59774d]' :
                      inv.topic === 'detection' ? 'bg-[#e5edf3] text-[#4e768c]' :
                      inv.topic === 'suppression' ? 'bg-[#f9eddd] text-[#9d7440]' :
                      'bg-[#ede5f3] text-[#7c5e8a]'
                    }`}>
                      {inv.topic.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#51675b] leading-relaxed line-clamp-2">{inv.summary}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0f3ee] text-[10px] text-[#6c7c7d]">
                  <div className="flex items-center gap-1 truncate max-w-[150px]">
                    <Icon size={12} className="shrink-0 text-[#126959]" />
                    <span className="truncate">{inv.fuel_type}</span>
                  </div>
                  {inv.safety_relevance_score > 0 && (
                    <span className="text-[#126959] font-medium shrink-0 font-mono">
                      Editorial {inv.safety_relevance_score}/10
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
