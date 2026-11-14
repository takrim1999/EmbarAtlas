import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Search, GitCompareArrows, MessageCircle, Database, ArrowRight, X, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import MicrogravityFlameLab from './MicrogravityFlameLab';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const rise = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };

export default function SplashScreen({ onClose }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const primaryRef = useRef(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    primaryRef.current?.focus({ preventScroll: true });
    const onKey = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const go = to => {
    onClose();
    navigate(to);
  };

  const total = stats?.total ?? '—';
  const rows = stats?.dataPoints ?? '—';
  const steps = [
    { n: '01', icon: Search, title: 'Discover', to: '/explore', text: `${total} NASA combustion investigations, filtered by prevention, detection and suppression.` },
    { n: '02', icon: GitCompareArrows, title: 'Compare', to: '/compare?ids=PSI-102,PSI-101', text: 'Line up the SAME and SAME-R smoke studies: hardware, conditions and limitations.' },
    { n: '03', icon: MessageCircle, title: 'Ask', to: '/chat', text: 'SI answers built only from supplied NASA records, with every citation ID checked.' },
    { n: '04', icon: Database, title: 'Inspect', to: '/data', text: `${rows} FLEX droplet tests, checked against NASA's PSI-69 experimental table.` },
  ];

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#081416] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.35, ease: 'easeIn' } }}
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(79,141,255,0.16),transparent_60%)]" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(223,134,86,0.12),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(185,224,205,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(185,224,205,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="relative min-h-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-6 flex flex-col">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-7 h-9 text-[#df8656]" />
            <span className="text-xl font-bold tracking-tight">
              ember<span className="font-normal text-[#bacfca]">atlas</span>
            </span>
            <span className="hidden md:inline-block ml-3 text-[9px] tracking-[1.8px] font-semibold text-[#e8af7e] border border-[#e8af7e]/30 rounded-full px-3 py-1">
              NASA SPACE APPS 2026 · FLAME IN FREEFALL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/takrim1999/EmbarAtlas"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#bacfca] hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-colors"
              title="Inspect source code on GitHub"
            >
              <Github size={13} />
              <span>GitHub</span>
              <ExternalLink size={10} className="text-[#8ca39f]" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 text-[11px] font-semibold text-white bg-gradient-to-r from-[#df8656] to-[#d66a3d] hover:from-[#e89467] hover:to-[#df8656] px-3 py-1.5 rounded-lg border border-[#ffb288]/30 shadow-[0_2px_12px_rgba(223,134,86,0.35)] transition-all cursor-pointer"
            >
              <span>Skip intro</span>
              <kbd className="hidden sm:inline-block font-mono text-[9px] font-medium bg-black/30 text-white/90 border border-white/20 rounded px-1.5 py-0.5">
                Esc
              </kbd>
              <X size={14} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center py-10 lg:py-6">
          <m.div variants={stagger} initial="hidden" animate="show">
            <m.p variants={rise} className="text-[10px] tracking-[2.2px] font-bold text-[#a2c1ae] mb-4">
              FIRE SAFETY · BEYOND EARTH
            </m.p>
            <m.h1 variants={rise} id="splash-title" className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.05]">
              In freefall, hot air doesn't rise.{' '}
              <span className="block mt-2 bg-gradient-to-r from-[#8fd0ff] via-[#b9e0cd] to-[#e8af7e] bg-clip-text text-transparent">
                Fire plays by different rules.
              </span>
            </m.h1>
            <m.p variants={rise} className="mt-6 text-sm sm:text-[15px] leading-relaxed text-[#b1c6bf] max-w-xl">
              <strong className="text-white font-semibold">Ember Atlas</strong> is a research dashboard for NASA's microgravity
              combustion experiments. Start from a fire-safety question, find the investigations that address it, compare their
              conditions side by side, and trace every claim back to its NASA source.
            </m.p>

            <m.div variants={rise} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map(({ n, icon: Icon, title, to, text }) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => go(to)}
                  className="group text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#df8656]/40 p-4 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon size={16} className="text-[#df8656]" /> {title}
                    </span>
                    <span className="font-mono text-[10px] text-[#7f9a96]">{n}</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-[#9fb6b1]">{text}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#e8af7e] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                    Open <ArrowRight size={11} />
                  </span>
                </button>
              ))}
            </m.div>

            <m.div variants={rise} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                ref={primaryRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-[#df8656] hover:bg-[#e99a6e] text-[#14292d] font-semibold text-sm px-6 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8af7e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081416]"
              >
                Enter the research workspace <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => go('/method')}
                className="inline-flex items-center gap-1.5 text-xs text-[#b9e0cd] hover:text-white"
              >
                <ShieldCheck size={14} /> How sources are verified
              </button>
            </m.div>
          </m.div>

          <m.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <MicrogravityFlameLab />
          </m.div>
        </div>

        <footer className="flex flex-col sm:flex-row justify-between gap-2 border-t border-white/10 pt-4 text-[9px] tracking-wide text-[#7f9a96]">
          <span>EMBER ATLAS <span className="mx-2">/</span> Evidence before inference.</span>
          <span>Sources: NASA Physical Sciences Informatics · Independent team project, not a NASA product</span>
        </footer>
      </div>
    </m.div>
  );
}
