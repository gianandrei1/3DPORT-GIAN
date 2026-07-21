import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import papicholosImg0 from '../assets/papicholos/PAPICHOLOS - 0.png';
import papicholosImg1 from '../assets/papicholos/PAPICHOLOS - 1.png';
import papicholosImg2 from '../assets/papicholos/PAPICHOLOS - 2.png';
import papicholosImg3 from '../assets/papicholos/PAPICHOLOS - 3.png';
import papicholosImg4 from '../assets/papicholos/PAPICHOLOS - 4.png';
import papicholosImg5 from '../assets/papicholos/PAPICHOLOS - 5.png';
import dtlImg1 from '../assets/DTL/DTL-1.png';
import dtlImg2 from '../assets/DTL/DTL - 2.png';
import dtlImg3 from '../assets/DTL/DTL-3.png';
import dtlImg4 from '../assets/DTL/DTL - 4.png';
import dtlImg5 from '../assets/DTL/DTL-5.png';
import dtlImg6 from '../assets/DTL/DTL-6.png';
import invImg1 from '../assets/INV/INV 1.png';
import invImg2 from '../assets/INV/INV 2.png';
import invImg3 from '../assets/INV/INV 3.png';
import invImg4 from '../assets/INV/INV 4.png';
import invImg5 from '../assets/INV/INV 5.png';
import invImg6 from '../assets/INV/INV 6.png';
import invImg7 from '../assets/INV/INV 7.png';
import invImg8 from '../assets/INV/INV 8.png';
import invImg9 from '../assets/INV/INV 9.png';
import GalleryOverlay from './GalleryOverlay';

// ─── Shared scroll-reveal primitives (identical physics to SecondScroll) ────

function CharReveal({
  char,
  index,
  total,
  scrollYProgress,
}: {
  char: string;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const start = (index / total) * 0.8;
  const end = start + 0.2;

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const blurValue = useTransform(scrollYProgress, [start, end], [12, 0]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);
  const y = useTransform(scrollYProgress, [start, end], [10, 0]);

  return (
    <motion.span style={{ opacity, filter, y }} className="inline-block">
      {char}
    </motion.span>
  );
}

function ScrollRevealText({
  text,
  className = '',
  offset = ['start 80%', 'start 30%'],
}: {
  text: string;
  className?: string;
  offset?: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });

  const totalChars = text.replace(/\s/g, '').length;
  let charCount = 0;

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {text.split(' ').map((word, wIdx) => (
        <span key={wIdx} className="inline-flex mr-[0.3em] mb-[0.1em]">
          {word.split('').map((char, cIdx) => {
            const currentIdx = charCount++;
            return (
              <CharReveal
                key={cIdx}
                char={char}
                index={currentIdx}
                total={totalChars}
                scrollYProgress={scrollYProgress}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

function RevealBlock({
  children,
  className = '',
  offset = ['start 95%', 'start 65%'],
}: {
  children: React.ReactNode;
  className?: string;
  offset?: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const blurValue = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, filter, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating UI card visuals ────────────────────────────────────────────────

function FloatingCardStack() {
  return (
    <div className="relative w-full h-[260px] sm:h-[340px] md:h-[520px] flex items-center justify-center select-none scale-75 sm:scale-90 md:scale-100 origin-center">

      {/* Card 3 — backmost, tilted */}
      <div
        className="absolute w-[220px] md:w-[260px] rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-md shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
        style={{
          transform: 'rotate(-8deg) translate(-60px, 20px)',
          height: '148px',
        }}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Analytics</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-white/10 w-3/4" />
            <div className="h-1.5 rounded-full bg-white/10 w-1/2" />
            <div className="h-1.5 rounded-full bg-white/10 w-2/3" />
          </div>
        </div>
      </div>

      {/* Card 2 — mid layer, slight rotate */}
      <div
        className="absolute w-[240px] md:w-[280px] rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
        style={{
          transform: 'rotate(4deg) translate(50px, -15px)',
          height: '170px',
        }}
      >
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Portfolio</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accentUp/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-10">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-white/30 to-white/10"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-white/40 to-white/10" />
          </div>
        </div>
      </div>

      {/* Card 1 — front, hero card */}
      <div
        className="absolute w-[260px] md:w-[300px] rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl shadow-[0_48px_96px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]"
        style={{ transform: 'rotate(-1.5deg) translate(-10px, 10px)', height: '190px' }}
      >
        <div className="p-5 h-full flex flex-col justify-between">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">Project</p>
              <p className="text-sm font-bold text-white/80 uppercase tracking-tight">UI System</p>
            </div>
            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="rgba(255,255,255,0.2)" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="rgba(255,255,255,0.2)" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="rgba(255,255,255,0.35)" />
              </svg>
            </div>
          </div>

          {/* Progress ring placeholder + stat */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" strokeWidth="2.5" stroke="rgba(255,255,255,0.06)" fill="none" />
                <circle
                  cx="18" cy="18" r="15"
                  strokeWidth="2.5"
                  stroke="rgba(255,255,255,0.5)"
                  fill="none"
                  strokeDasharray="94.25"
                  strokeDashoffset="28"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/60">70%</span>
            </div>
            <div>
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Completion</p>
              <p className="text-xs font-semibold text-white/70">In Progress</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {['React', 'TypeScript', 'Three.js'].map((tag) => (
              <span key={tag} className="text-[9px] font-mono text-white/40 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.02] blur-3xl" />
      </div>
    </div>
  );
}

// ─── Project data ─────────────────────────────────────────────────────────────

interface Project {
  tag: string;
  title: string;
  description: string;
  href: string;
  stack: string[];
  year: string;
  flip: boolean;
  image?: string;
  gallery?: string[];
}

const PROJECTS: Project[] = [
  {
    tag: ' WEB APP',
    title: 'PAPICHOLOS\nCDO',
    description:
      'A modern, dark-mode web application designed for efficient restaurant operations, real-time updates, and table-side notifications.',
    href: '#',
    stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    year: '2026',
    flip: false,
    image: papicholosImg0,
    gallery: [
      papicholosImg1,
      papicholosImg2,
      papicholosImg3,
      papicholosImg4,
      papicholosImg5,
    ],
  },
  {
    tag: 'WEB APP',
    title: 'DTL\nCDO',
    description:
      'A modern, immersive nightclub landing page designed to showcase upcoming events and streamline table reservations.',
    href: '#',
    stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS'],
    year: '2025',
    flip: true,
    image: dtlImg1,
    gallery: [
      dtlImg2,
      dtlImg3,
      dtlImg4,
      dtlImg5,
      dtlImg6,
    ],
  },
  {
    tag: 'WEB APP',
    title: 'INVENTORY MANAGEMENT\nSYSTEM',
    description:
      'A modern, intuitive inventory management system designed to track and monitor inventory movements in real time.',
    href: '#',
    stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    year: '2025',
    flip: false,
    image: invImg1,
    gallery: [
      invImg2,
      invImg3,
      invImg4,
      invImg5,
      invImg6,
      invImg7,
      invImg8,
      invImg9,
    ],
  },
];

// ─── Single project row ───────────────────────────────────────────────────────

function ProjectRow({
  tag,
  title,
  description,
  href,
  stack,
  year,
  flip,
  image,
  gallery,
  onViewGallery,
}: Project & { onViewGallery?: () => void }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const titleLines = title.split('\n');

  return (
    <div
      className={`
        w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20
        flex flex-col gap-6 md:gap-0
        ${flip ? 'md:flex-row-reverse' : 'md:flex-row'}
        md:items-center
        py-10 md:py-28
        border-t border-white/[0.06]
      `}
    >
      {/* ── Visual side ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <RevealBlock offset={isMobile ? ['start 100%', 'start 65%'] : ['start 90%', 'start 50%']} className="w-full">
          {image ? (
            <div className="relative w-full h-[260px] sm:h-[340px] md:h-[520px] flex items-center justify-center">
              <img src={image} alt={title.replace('\n', ' ')} className="w-full h-full object-cover rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/10" />
            </div>
          ) : (
            <FloatingCardStack />
          )}
        </RevealBlock>
      </div>

      {/* ── Text side ── */}
      <div className={`w-full md:w-1/2 flex flex-col gap-4 md:gap-6 ${flip ? 'md:pr-16' : 'md:pl-16'}`}>
        {/* Monospace tag */}
        <RevealBlock offset={isMobile ? ['start 100%', 'start 85%'] : ['start 95%', 'start 75%']} className="pointer-events-auto">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
            {tag} <span className="opacity-40 mx-2">·</span> {year}
          </p>
        </RevealBlock>

        {/* Title — letter-by-letter */}
        <div className="pointer-events-auto">
          {titleLines.map((line, i) => (
            <ScrollRevealText
              key={i}
              text={line}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[0.88] text-white uppercase"
              offset={isMobile ? ['start 100%', 'start 75%'] : ['start 90%', 'start 55%']}
            />
          ))}
        </div>

        {/* Description — block reveal */}
        <RevealBlock offset={isMobile ? ['start 100%', 'start 80%'] : ['start 90%', 'start 65%']} className="pointer-events-auto">
          <p className="text-sm md:text-base text-white/50 font-light leading-relaxed max-w-md">
            {description}
          </p>
        </RevealBlock>

        {/* Stack tags */}
        <RevealBlock offset={isMobile ? ['start 100%', 'start 85%'] : ['start 90%', 'start 70%']} className="pointer-events-auto">
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="text-[9px] font-mono text-white/35 border border-white/10 rounded px-2 py-1 uppercase tracking-widest"
              >
                {s}
              </span>
            ))}
          </div>
        </RevealBlock>

        {/* CTA button with corner framing */}
        <RevealBlock offset={isMobile ? ['start 100%', 'start 85%'] : ['start 92%', 'start 72%']} className="pointer-events-auto w-fit">
          {gallery && onViewGallery ? (
            <button
              onClick={onViewGallery}
              className="group relative inline-flex items-center gap-3 pointer-events-auto w-fit mt-2 px-5 py-3 border border-white/20 rounded-sm bg-transparent hover:bg-[var(--theme-color)] hover:border-[var(--theme-color)] transition-all duration-300"
            >
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-[0.3em] transition-colors duration-300 group-hover:text-black">
                View Gallery
              </span>
              <span className="text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-black text-xs">
                →
              </span>
            </button>
          ) : (
            <a
              href={href}
              className="group relative inline-flex items-center gap-3 pointer-events-auto w-fit mt-2 px-5 py-3 border border-white/20 rounded-sm bg-transparent hover:bg-[var(--theme-color)] hover:border-[var(--theme-color)] transition-all duration-300"
            >
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-[0.3em] transition-colors duration-300 group-hover:text-black">
                View Gallery
              </span>
              <span className="text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-black text-xs">
                →
              </span>
            </a>
          )}
        </RevealBlock>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-24 pb-4">
      <RevealBlock offset={['start 95%', 'start 75%']} className="pointer-events-auto w-fit">
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.35em] mb-4">
          Selected Work
        </p>
      </RevealBlock>
      <div className="pointer-events-auto w-fit">
        <ScrollRevealText
          text="Projects"
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white uppercase"
          offset={['start 90%', 'start 50%']}
        />
      </div>
    </div>
  );
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function PersonalProjects() {
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[] | null>(null);

  return (
    <section className="relative w-full pointer-events-none z-20 pt-[5vh] pb-[20vh]">
      <SectionHeader />

      <div className="flex flex-col">
        {PROJECTS.map((project) => (
          <ProjectRow 
            key={project.tag} 
            {...project} 
            onViewGallery={project.gallery ? () => setActiveGalleryImages(project.gallery!) : undefined} 
          />
        ))}
      </div>

      <GalleryOverlay 
        images={activeGalleryImages || []} 
        onClose={() => setActiveGalleryImages(null)} 
      />
    </section>
  );
}
