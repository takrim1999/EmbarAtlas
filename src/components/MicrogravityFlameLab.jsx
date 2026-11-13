import { useEffect, useRef, useState } from 'react';
import { Wind, Play, Pause } from 'lucide-react';

// Recorded endpoints of FLEX test 30CAL03 (NASA PSI-69 v5, Experimental Table row 5).
export const REFERENCE_TEST = { id: '30CAL03', d0: 1.92, dExt: 0.81, burnTime: 6.34, pressure: 760, oxygen: 0.21 };

// d²-law rate fitted to the two recorded endpoints (mm²/s). Display interpolation only.
const BURN_RATE = (REFERENCE_TEST.d0 ** 2 - REFERENCE_TEST.dExt ** 2) / REFERENCE_TEST.burnTime;
const DARK_S = 1.6;
const CYCLE_S = REFERENCE_TEST.burnTime + DARK_S;
const TAU = Math.PI * 2;

const BLUE = [124, 196, 255];
const DEEP_BLUE = [79, 141, 255];
const AMBER = [255, 176, 103];

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function dropletAt(time) {
  const phase = time % CYCLE_S;
  const burning = phase < REFERENCE_TEST.burnTime;
  const d = burning ? Math.sqrt(REFERENCE_TEST.d0 ** 2 - BURN_RATE * phase) : REFERENCE_TEST.dExt;
  const intensity = burning ? Math.min(1, phase / 0.35, (REFERENCE_TEST.burnTime - phase) / 0.45) : 0;
  const dark = phase - REFERENCE_TEST.burnTime;
  const dropletAlpha = burning ? Math.min(1, 0.35 + phase / 0.25) : Math.max(0, 1 - Math.max(0, dark - DARK_S * 0.5) / (DARK_S * 0.4));
  return { phase, burning, d, intensity, dropletAlpha };
}

// Flame sheet in units of the flame radius. g: 0 = microgravity, 1 = Earth. f: slow airflow (left → right).
function flamePoint(theta, g, f, time) {
  const cx = Math.cos(theta);
  const cy = Math.sin(theta);
  const up = Math.max(0, -cy);
  const down = Math.max(0, cy);
  const breathe = 1 + (1 - g) * 0.012 * Math.sin(time * 2.2);
  let x = cx * breathe;
  let y = cy * breathe;
  // Buoyancy stretches the flame upward into a narrowing plume and tucks in its base.
  x *= 1 - g * 0.55 * up * up;
  y -= g * (1.25 * up * up + 0.15 * up + 0.28 * down);
  x += g * 0.06 * up * Math.sin(time * 9 + cy * 5);
  // Airflow compresses the upstream side and drags the flame downstream.
  x *= cx < 0 ? 1 - f * 0.35 : 1 + f * 0.85;
  y *= 1 - f * 0.28 * Math.max(0, cx);
  return [x, y];
}

function flameRadiusAt(px, py, g, f, time) {
  const [fx, fy] = flamePoint(Math.atan2(py, px), g, f, time);
  return Math.hypot(fx, fy);
}

function spawn(p, env, initial = false) {
  const { g, f, time, rdN } = env;
  p.age = initial ? Math.random() * 2 : 0;
  if (p.kind === 'ox') {
    let theta = Math.random() * TAU;
    if (Math.random() < g * 0.7) theta = Math.PI * (0.15 + Math.random() * 0.7);
    if (Math.random() < f * 0.7) theta = Math.PI * (0.6 + Math.random() * 0.8);
    const r = 1.7 + Math.random() * 1.1;
    p.x = Math.cos(theta) * r;
    p.y = Math.sin(theta) * r;
  } else if (p.kind === 'fuel') {
    const theta = Math.random() * TAU;
    const r = rdN * (1.05 + (initial ? Math.random() * 2 : 0));
    p.x = Math.cos(theta) * r;
    p.y = Math.sin(theta) * r;
  } else {
    const theta = Math.random() * TAU;
    const [fx, fy] = flamePoint(theta, g, f, time);
    const r = initial ? 1 + Math.random() * 1.6 : 1.02;
    p.x = fx * r;
    p.y = fy * r;
  }
}

function makeParticles(env) {
  const list = [];
  const add = (kind, n) => { for (let i = 0; i < n; i++) { const p = { kind }; spawn(p, env, true); list.push(p); } };
  add('ox', 72);
  add('fuel', 26);
  add('prod', 40);
  return list;
}

function step(particles, env, dt) {
  const { g, f, time, rdN } = env;
  for (const p of particles) {
    p.age += dt;
    const r = Math.hypot(p.x, p.y) || 1e-6;
    const ux = p.x / r;
    const uy = p.y / r;
    let vx;
    let vy;
    if (p.kind === 'ox') {
      vx = -ux * 0.22 + f * 0.6;
      vy = -uy * 0.22 - g * 0.55;
      p.x += vx * dt; p.y += vy * dt;
      if (Math.hypot(p.x, p.y) < flameRadiusAt(p.x, p.y, g, f, time) * 1.02 || r > 3.3) spawn(p, env);
    } else if (p.kind === 'fuel') {
      vx = ux * 0.35 + f * 0.25;
      vy = uy * 0.35 - g * 0.25;
      p.x += vx * dt; p.y += vy * dt;
      if (Math.hypot(p.x, p.y) >= flameRadiusAt(p.x, p.y, g, f, time) * 0.96 || r < rdN * 0.5) spawn(p, env);
    } else {
      vx = ux * 0.2 + f * 0.75;
      vy = uy * 0.2 - g * 0.85;
      p.x += vx * dt; p.y += vy * dt;
      if (r > 3.3 || p.age > 5) spawn(p, env);
    }
  }
}

function drawLabel(ctx, w, side, ty, ax, ay, text) {
  ctx.font = '500 11px "DM Sans", sans-serif';
  ctx.textBaseline = 'middle';
  const width = ctx.measureText(text).width;
  const tx = side === 'left' ? 14 : w - 14;
  const lineStart = side === 'left' ? tx + width + 6 : tx - width - 6;
  const hasRoom = side === 'left' ? lineStart < ax - 8 : lineStart > ax + 8;
  if (hasRoom) {
    ctx.strokeStyle = 'rgba(185,224,205,0.32)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lineStart, ty);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.fillStyle = 'rgba(185,224,205,0.9)';
    ctx.beginPath();
    ctx.arc(ax, ay, 2, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(222,236,230,0.86)';
  ctx.textAlign = side === 'left' ? 'left' : 'right';
  ctx.fillText(text, tx, ty);
}

function render(ctx, w, h, particles, env, drop) {
  const { g, f, time } = env;
  const base = Math.min(w * 0.2, h * 0.2);
  const R = base * (0.62 + 0.38 * (drop.d / REFERENCE_TEST.d0));
  const rd = base * 0.16 * (drop.d / REFERENCE_TEST.d0);
  const cx0 = w * (0.5 - 0.09 * f);
  const cy0 = h * (0.5 + 0.08 * g);
  const toPx = (x, y) => [cx0 + x * R, cy0 + y * R];

  ctx.clearRect(0, 0, w, h);

  // Instrument reticle.
  ctx.save();
  ctx.strokeStyle = 'rgba(150,190,180,0.10)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 6]);
  for (const k of [1.45, 2.25]) { ctx.beginPath(); ctx.arc(cx0, h * 0.5, base * k, 0, TAU); ctx.stroke(); }
  ctx.setLineDash([]);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU;
    const len = i % 4 === 0 ? 7 : 3;
    const r0 = base * 2.25;
    ctx.beginPath();
    ctx.moveTo(cx0 + Math.cos(a) * r0, h * 0.5 + Math.sin(a) * r0);
    ctx.lineTo(cx0 + Math.cos(a) * (r0 + len), h * 0.5 + Math.sin(a) * (r0 + len));
    ctx.stroke();
  }
  ctx.restore();

  // Airflow streaks.
  if (f > 0.02) {
    ctx.save();
    ctx.strokeStyle = `rgba(160,210,200,${0.28 * f})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = h * (0.2 + i * 0.12);
      const x = ((time * 60 + i * 47) % (w * 0.35)) + 8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26, y); ctx.lineTo(x + 21, y - 3); ctx.moveTo(x + 26, y); ctx.lineTo(x + 21, y + 3); ctx.stroke();
    }
    ctx.restore();
  }

  // Flame sheet path.
  const trace = () => {
    ctx.beginPath();
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const [x, y] = flamePoint((i / N) * TAU, g, f, time);
      const [px, py] = toPx(x, y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  const I = drop.intensity;
  if (I > 0.01) {
    // Fuel-vapour region between droplet and flame sheet.
    const vapour = ctx.createRadialGradient(cx0, cy0, rd, cx0, cy0, R * (1 + g));
    vapour.addColorStop(0, `rgba(255,190,120,${0.11 * I})`);
    vapour.addColorStop(1, `rgba(110,170,255,${0.05 * I})`);
    trace();
    ctx.fillStyle = vapour;
    ctx.fill();

    const grad = ctx.createLinearGradient(0, cy0 - 2.6 * R, 0, cy0 + R);
    grad.addColorStop(0, rgb(mix(BLUE, AMBER, g * 0.92)));
    grad.addColorStop(0.55, rgb(mix(BLUE, AMBER, g * 0.35)));
    grad.addColorStop(1, rgb(DEEP_BLUE));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = grad;
    ctx.lineJoin = 'round';
    for (const [width, alpha] of [[R * 0.42, 0.05], [R * 0.24, 0.08], [R * 0.12, 0.16], [R * 0.05, 0.4], [1.6, 0.9]]) {
      ctx.globalAlpha = alpha * I;
      ctx.lineWidth = width;
      trace();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ignition flash.
  if (drop.burning && drop.phase < 0.35) {
    const k = 1 - drop.phase / 0.35;
    const flash = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, R * 1.6);
    flash.addColorStop(0, `rgba(200,230,255,${0.45 * k})`);
    flash.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, w, h);
  }

  // Particles.
  for (const p of particles) {
    const [px, py] = toPx(p.x, p.y);
    const fadeIn = Math.min(1, p.age / 0.4);
    let a;
    let color;
    let size;
    if (p.kind === 'ox') { a = 0.55 * fadeIn; color = '126,232,200'; size = 1.3; }
    else if (p.kind === 'fuel') { a = 0.7 * fadeIn * I; color = '255,179,103'; size = 1.2; }
    else { a = 0.4 * fadeIn * Math.max(0, 1 - Math.hypot(p.x, p.y) / 3.3) * Math.max(I, 0.25); color = '220,228,235'; size = 1.5; }
    if (a < 0.02) continue;
    ctx.fillStyle = `rgba(${color},${a})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fill();
  }

  // Droplet.
  if (drop.dropletAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = drop.dropletAlpha;
    const body = ctx.createRadialGradient(cx0 - rd * 0.35, cy0 - rd * 0.35, rd * 0.1, cx0, cy0, rd);
    body.addColorStop(0, 'rgba(255,255,255,0.95)');
    body.addColorStop(0.5, 'rgba(191,227,255,0.85)');
    body.addColorStop(1, 'rgba(93,143,184,0.9)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx0, cy0, rd, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  if (!drop.burning && g < 0.5) {
    ctx.font = '600 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(232,175,126,${0.9 * Math.min(1, drop.dropletAlpha + 0.3)})`;
    ctx.fillText(`Extinction at d = ${REFERENCE_TEST.dExt.toFixed(2)} mm`, cx0, cy0 - base * 0.6);
  }

  // Annotations.
  if (w >= 440) {
    const earth = g > 0.5;
    const [sx, sy] = toPx(...flamePoint(earth ? -0.18 * Math.PI : -0.25 * Math.PI, g, f, time));
    drawLabel(ctx, w, 'right', earth ? sy - 24 : sy - 18, sx, sy, 'Flame sheet: fuel vapour meets O₂');
    drawLabel(ctx, w, 'left', cy0 + R * 1.6, cx0 - rd * 0.7, cy0 + rd * 0.7, 'Liquid methanol droplet');
    if (earth) {
      drawLabel(ctx, w, 'left', cy0 + R * 0.9, cx0 - R * 0.95, cy0 + R * 1.3, 'Buoyant inflow draws O₂ from below');
      drawLabel(ctx, w, 'right', Math.max(14, cy0 - R * 2.1), cx0 + R * 0.35, Math.max(10, cy0 - R * 2.55), 'Hot products rise');
    } else {
      drawLabel(ctx, w, 'left', cy0 + R * 0.15, cx0 - R * 1.3, cy0 + R * 0.15, 'O₂ diffuses inward');
      drawLabel(ctx, w, 'right', cy0 + R * 1.35, cx0 + R * 1.55, cy0 + R * 0.9, 'Products diffuse outward');
    }
    if (f > 0.5) {
      ctx.font = '600 10px "DM Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(160,210,200,0.8)';
      ctx.fillText('SLOW AIRFLOW →', 14, 18);
    }
  }
}

export default function MicrogravityFlameLab() {
  const [gravity, setGravity] = useState('micro');
  const [airflow, setAirflow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [telemetry, setTelemetry] = useState({ d: REFERENCE_TEST.d0, phase: 0, burning: true });
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const target = useRef({ g: 0, f: 0 });
  const isPlayingRef = useRef(true);

  useEffect(() => {
    target.current = { g: gravity === 'earth' ? 1 : 0, f: airflow ? 1 : 0 };
  }, [gravity, airflow]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const state = { g: target.current.g, f: target.current.f };
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let time = 0.6;
    let lastTelemetry = 0;

    const envFor = drop => ({ g: state.g, f: state.f, time, rdN: 0.16 * (drop.d / REFERENCE_TEST.d0) / (0.62 + 0.38 * (drop.d / REFERENCE_TEST.d0)) });
    const particles = makeParticles(envFor(dropletAt(time)));

    const resize = () => {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (isPlayingRef.current) {
        time += dt;
      }
      const ease = Math.min(1, dt * 3);
      state.g += (target.current.g - state.g) * ease;
      state.f += (target.current.f - state.f) * ease;
      const drop = dropletAt(time);
      const env = envFor(drop);
      if (isPlayingRef.current) {
        step(particles, env, dt);
      }
      if (w > 0 && h > 0) {
        render(ctx, w, h, particles, env, drop);
      }
      if (now - lastTelemetry > 100) {
        lastTelemetry = now;
        setTelemetry({ d: drop.d, phase: drop.phase, burning: drop.burning });
      }
      raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const earth = gravity === 'earth';
  const elapsed = Math.min(telemetry.phase, REFERENCE_TEST.burnTime);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1d20]/80 backdrop-blur-sm overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div className="flex rounded-lg bg-white/5 p-1 text-[11px]" role="group" aria-label="Gravity regime">
          {[['micro', 'Microgravity · 0g'], ['earth', 'Earth · 1g']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={gravity === key}
              onClick={() => setGravity(key)}
              className={`px-3 py-1.5 rounded-md transition-colors ${gravity === key ? 'bg-[#df8656] text-[#14292d] font-semibold' : 'text-[#b2c5c1] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border border-white/10 hover:border-white/25 text-[#b2c5c1] hover:text-white transition-colors"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="text-[#df8656]" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={airflow}
            onClick={() => setAirflow(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] border transition-colors ${airflow ? 'border-[#7ee8c8]/50 text-[#7ee8c8] bg-[#7ee8c8]/10' : 'border-white/10 text-[#b2c5c1] hover:text-white'}`}
          >
            <Wind size={14} /> Slow airflow
          </button>
        </div>
      </div>

      <div ref={wrapRef} className="relative h-[300px] sm:h-[360px] lg:h-[400px]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={earth
            ? 'Schematic of a methanol droplet flame under Earth gravity: buoyancy stretches the flame upward and hot products rise.'
            : 'Schematic of a methanol droplet flame in microgravity: a spherical flame sheet surrounds the shrinking droplet while oxygen diffuses inward.'}
        />
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-4 border-t border-white/10 text-[10px] transition-opacity ${earth ? 'opacity-40' : ''}`}>
        {[
          ['Reference test', `FLEX ${REFERENCE_TEST.id}`],
          ['Droplet diameter', `${telemetry.d.toFixed(2)} mm`],
          ['Elapsed', `${elapsed.toFixed(1)} / ${REFERENCE_TEST.burnTime} s`],
          ['Status', telemetry.burning ? 'Burning' : 'Extinguished'],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-2.5 border-r border-white/5 last:border-r-0">
            <p className="uppercase tracking-[1.4px] text-[#7f9a96]">{label}</p>
            <p className={`mt-0.5 font-mono text-xs ${label === 'Status' && !telemetry.burning ? 'text-[#e8af7e]' : 'text-[#e5efe9]'}`}>{value}</p>
          </div>
        ))}
      </div>

      <p className="px-4 py-3 border-t border-white/10 text-[10px] leading-relaxed text-[#8fa9a4]">
        {earth
          ? 'The 1g view is a qualitative comparison; the telemetry above describes the microgravity reference test. '
          : airflow
            ? 'In orbit, fans rather than buoyancy deliver oxygen. BASS-II studied solid-fuel flames in slow forced flow (PSI-25). '
            : ''}
        Schematic, not to scale, and not a combustion simulation. Droplet size follows a d²-law interpolated between the recorded
        initial ({REFERENCE_TEST.d0} mm) and extinction ({REFERENCE_TEST.dExt} mm) diameters of FLEX test {REFERENCE_TEST.id} over its {REFERENCE_TEST.burnTime} s
        burn at {REFERENCE_TEST.pressure} mmHg and O₂ mole fraction {REFERENCE_TEST.oxygen} (NASA PSI-69).
      </p>
    </div>
  );
}
