import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Flame, Search, BarChart3, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';

const navItems = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/explore', icon: Search, label: 'Explore' },
];

function PlaceholderExplore() {
  return (
    <div className="p-8 text-center bg-white rounded-lg border border-[#dce2db]">
      <h2 className="text-xl font-bold mb-2">Investigation Explorer</h2>
      <p className="text-sm text-[#6c7c7d]">Browse NASA microgravity fire safety studies...</p>
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-[#f5f6f2] text-[#183235]">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-[230px] bg-[#14292d] text-white
        flex flex-col z-50 transition-transform lg:translate-x-0 shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 pt-8">
          <NavLink to="/" className="flex items-center gap-2.5 no-underline text-white mb-10">
            <Flame className="w-8 h-10 text-[#df8656] shrink-0" />
            <span className="text-2xl font-bold tracking-tight">
              ember<span className="font-normal text-[#bacfca]">atlas</span>
              <small className="block text-[7px] tracking-[1.8px] mt-1 text-[#99b0ad] font-mono">
                MICROGRAVITY RESEARCH
              </small>
            </span>
          </NavLink>
          
          <div className="text-[9px] text-[#88a3a0] tracking-[2px] px-3 mb-3 font-semibold">WORKSPACE</div>
          
          <nav className="grid gap-1.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 text-xs rounded-md no-underline transition-colors
                  ${isActive ? 'bg-[#2b4747] text-[#ecf6eb] font-semibold' : 'text-[#b2c5c1] hover:bg-[#244040]'}
                `}
              >
                <Icon size={17} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-5 pt-4 border-t border-white/10">
          <p className="text-sm leading-snug text-[#c5d6cb] tracking-tight mb-2">
            Small flames.<br />Important questions.
          </p>
          <a
            href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] no-underline text-[#e8af7e] hover:underline inline-block mb-3"
          >
            Flame in Freefall ↗
          </a>
          <small className="block text-[8px] leading-relaxed text-[#90aaa5]">
            NASA Space Apps Challenge.<br />Physical Science Informatics.
          </small>
        </div>
      </aside>
      
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="h-[60px] border-b border-[#dce2db] px-4 lg:px-8 flex items-center justify-between bg-[#fafbf8] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded text-[#183235] hover:bg-black/5"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-xs text-[#6c7c7d]">
              Research workspace <span className="mx-2 text-[#b8c1b9]">/</span>
              <strong className="text-[#36514c] font-medium">Ember Atlas</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6c7c7d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#749e78]" />
            Dashboard
            <span className="border border-[#dce2db] bg-white rounded px-1.5 py-0.5 ml-1 text-[9px] font-mono">v1.0</span>
          </div>
        </header>
        
        <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explore" element={<PlaceholderExplore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-[#dce2db] mx-4 lg:mx-8 py-4 text-[9px] text-[#899583] tracking-wide">
          <span>EMBER ATLAS <span className="mx-2">/</span> Evidence before inference.</span>
          <span>NASA PSI sources · Research prototype · 2026</span>
        </footer>
      </div>
    </div>
  );
}
