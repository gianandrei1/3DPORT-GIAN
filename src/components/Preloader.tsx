import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
  /** Called the moment the glitch animation starts (before onComplete) */
  onGlitchStart?: () => void;
}

// 3-phase digital power-loss glitch animation
function DigitalGlitch({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const doneFiredRef = useRef(false);

  const TOTAL_MS = 1500;
  // Phase 3 starts here — onDone() fires at this point to sync with website fade-in
  const PHASE3_T = 0.55;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ri = (max: number) => (Math.random() * max) | 0;

    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / TOTAL_MS, 1);

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      /* ── Phase 1 (0–22%): Minimal power surge — faint white strobe ── */
      if (t < 0.22) {
        if (Math.random() < 0.4) {
          ctx.fillStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.15})`;
          ctx.fillRect(0, 0, w, h);
        }
        for (let i = 0; i < 2; i++) {
          const v = ri(60) + 180;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.globalAlpha = 0.08 + Math.random() * 0.12;
          ctx.fillRect(0, ri(h), w, 1);
          ctx.globalAlpha = 1;
        }
      }

      /* ── Phase 2 (22–55%): Very minimal flickering lines ── */
      if (t >= 0.22 && t < PHASE3_T) {
        const numTears = ri(3) + 1;
        for (let i = 0; i < numTears; i++) {
          const v = ri(80) + 160;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.globalAlpha = 0.06 + Math.random() * 0.10;
          ctx.fillRect(0, ri(h), w, ri(3) + 1);
          ctx.globalAlpha = 1;
        }
        if (Math.random() < 0.15) {
          const v = ri(100) + 140;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.globalAlpha = 0.05 + Math.random() * 0.08;
          ctx.fillRect(ri(w), ri(h), ri(w * 0.2) + 20, ri(6) + 2);
          ctx.globalAlpha = 1;
        }
      }

      /* ── Phase 3 (55–100%): Canvas goes transparent — website reveals ── */
      if (t >= PHASE3_T && !doneFiredRef.current) {
        doneFiredRef.current = true;
        onDone();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[101] w-full h-full"
    />
  );
}

// How long (seconds) the glitch Phase 3 / crossfade lasts — shared with App.tsx
export const GLITCH_FADE_S = ((1 - 0.55) * 800) / 1000; // 0.36s

const ICONS = [
  // 0. React — atomic orbit logo
  <g key="react" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>
    <ellipse cx="12" cy="12" rx="10" ry="3.8"/>
    <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(120 12 12)"/>
  </g>,
  // 1. TypeScript — TS box
  <g key="typescript" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3"/>
    <path d="M7 9h4.5M9.25 9v7"/>
    <path d="M13.5 14.5c0 .9.9 1.5 2 1.5s2-.6 2-1.5c0-.9-.9-1.2-2-1.5s-2-.6-2-1.5c0-.9.9-1.5 2-1.5s2 .6 2 1.5"/>
  </g>,
  // 2. Python — two snakes / pill shape
  <g key="python" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5c-2.5 0-4.5 1-4.5 3.5V9h4.5"/>
    <path d="M12 21.5c2.5 0 4.5-1 4.5-3.5V15H12"/>
    <path d="M7.5 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3.5"/>
    <path d="M16.5 15H20a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3.5"/>
    <circle cx="9.8" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14.2" cy="17.5" r="1" fill="currentColor" stroke="none"/>
  </g>,
  // 3. Tailwind CSS — double wave
  <g key="tailwind" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9c0-3 1.5-4.5 4.5-4.5C11 4.5 11 9 14.5 9S18 7.5 18 7.5"/>
    <path d="M3 15c0-3 1.5-4.5 4.5-4.5C11 10.5 11 15 14.5 15S18 13.5 18 13.5"/>
  </g>,
  // 4. Supabase — lightning bolt
  <path key="supabase" d="M13.5 2L4 14h8.5L10.5 22 20 10H11.5L13.5 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  // 5. Vercel — upward triangle
  <path key="vercel" d="M12 3L22 21H2L12 3z" fill="currentColor" stroke="none"/>,
];

function SlotIcon({ finalIndex, duration, isExiting }: { finalIndex: number, duration: number, isExiting: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        setLocked(true);
        setCurrentIndex(finalIndex);
        clearInterval(interval);
      } else {
        setCurrentIndex(prev => {
          let next = Math.floor(Math.random() * ICONS.length);
          if (next === prev) next = (next + 1) % ICONS.length;
          return next;
        });
      }
    }, 60);

    return () => clearInterval(interval);
  }, [finalIndex, duration]);

  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 transition-colors duration-300 ${locked ? 'text-white' : 'text-white/20'}`}
      animate={isExiting ? { opacity: 0, scale: 0.8, filter: 'blur(10px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
    >
      {ICONS[currentIndex]}
    </motion.svg>
  );
}

const Preloader = ({ onComplete, onGlitchStart }: PreloaderProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsExiting(true);
      onGlitchStart?.();
    }, 4000);

    const images = Array.from(document.images);
    images.forEach((img) => {
      if (!img.complete) {
        img.onload = () => {};
        img.onerror = () => {};
      }
    });

    return () => {
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      exit={{ opacity: 0, transition: { duration: GLITCH_FADE_S, ease: 'easeInOut' } }}
    >
      {/* ── Solid black background during counting ── */}
      {!isExiting && (
        <div className="absolute inset-0 bg-background" />
      )}

      {/* ── Glassmorphism backdrop during glitch only ── */}
      {isExiting && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-md" />
      )}

      {/* Digital glitch canvas — mounts when exit sequence starts */}
      {isExiting && <DigitalGlitch onDone={onComplete} />}

      {/* Slot Machine UI — solid background, fades out when glitch starts */}
      <motion.div
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={isExiting ? { duration: 0.15 } : {}}
        className="fixed inset-0 flex flex-col items-center justify-center text-primary"
      >
        <div className="flex flex-col items-center gap-12">
          {/* LDR Style Icons */}
          <div className="flex items-center justify-center gap-6 md:gap-12">
            <SlotIcon finalIndex={0} duration={2000} isExiting={isExiting} />
            <SlotIcon finalIndex={1} duration={2700} isExiting={isExiting} />
            <SlotIcon finalIndex={2} duration={3400} isExiting={isExiting} />
          </div>

          {/* Loading Label */}
          <motion.div
            className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Initializing environment
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
