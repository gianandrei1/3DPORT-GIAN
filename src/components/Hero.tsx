import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import Holoface from './Holoface';
import Glassmorphism from './Glassmorphism';
import SecondScroll from './SecondScroll';
import PersonalProjects from './PersonalProjects';
import ExperienceGrid from './ExperienceGrid';

// Uses the continuous scroll progress to drive the camera Z position
function CameraController({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const get = useThree((state) => state.get);
  const targetZRef = useRef(8);

  const cameraZ = useTransform(scrollProgress, [0, 0.12], [8, -5]);

  useMotionValueEvent(cameraZ, "change", (latest) => {
    targetZRef.current = latest;
  });

  useFrame(() => {
    get().camera.position.z = targetZRef.current;
  });

  return null;
}



export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track the entire scroll progress of the hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // HoloFace — exits exactly as SecondScroll text enters the viewport (~270px / 0.07 progress)
  const modelOpacity = useTransform(scrollYProgress, [0.18, 0.28], [1, 0]);
  const modelBlur = useTransform(scrollYProgress, [0.18, 0.28], ['blur(0px)', 'blur(40px)']);

  // ─── MAIN HEADLINE ANIMATION (MANUAL ADJUSTMENT HERE) ───
  // Controls how fast the "Ui x Ux" text fades, blurs, and scales out.
  // Currently set to finish at 15% (0.15) of the scroll progress.
  // Decrease '0.15' (e.g. to 0.10) to make it exit even faster. Increase to make it slower.
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const blurValue = useTransform(
    scrollYProgress,
    [0, 0.05, 0.10, 0.15], // Intermediate blur steps leading up to the final 0.15
    [0, 5, 20, 80]
  );
  const headlineBlur = useTransform(blurValue, (v) => `blur(${v}px)`);
  const headlineScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.2]);
  const headlineDisplay = useTransform(scrollYProgress, (v) => (v > 0.18 ? 'none' : 'flex'));



  return (
    <div ref={containerRef} className="relative w-full bg-background">
      
      {/* 1. Global Fixed 3D Layer (Detached from document flow to prevent cutting) */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none">
        <motion.div style={{ opacity: modelOpacity, filter: modelBlur }} className="w-full h-full pointer-events-auto">
          <Canvas 
            camera={{ position: [0, 0, 8], fov: 45 }} 
            style={{ width: '100%', height: '100%' }}
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
            eventSource={typeof window !== 'undefined' ? document.getElementById('root')! : undefined}
            eventPrefix="client"
          >
            <CameraController scrollProgress={scrollYProgress} />
            <Suspense fallback={null}>
              <Holoface scale={isMobile ? 1.2 : 2.5} />
            </Suspense>
          </Canvas>
        </motion.div>
      </div>

      {/* 2. Anchored Initial Headline Layer */}
      <div className="fixed top-0 left-0 w-full h-screen z-10 pointer-events-none flex flex-col items-center justify-center px-6">
        <motion.div 
          style={{ 
            opacity: headlineOpacity, 
            scale: headlineScale,
            display: headlineDisplay,
            filter: headlineBlur,
          }}
          className="flex flex-col items-center text-center pointer-events-none"
        >
          <h1 className="group text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6 text-white hover:text-[var(--theme-color)] transition-colors duration-300 uppercase mt-12 cursor-default pointer-events-auto">
            HELLO <span className="font-light mx-2 opacity-50 group-hover:text-[var(--theme-color)] transition-colors duration-300">&#xD7;</span> WORLD! <br />
           
          </h1>
          <a
            href="https://t.me/gianandrei1"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/20 text-white text-xs uppercase tracking-widest font-mono px-6 py-3 hover:bg-[var(--theme-color)] hover:border-[var(--theme-color)] hover:text-black transition-all duration-300 pointer-events-auto inline-block"
          >
            Write to Telegram
          </a>
        </motion.div>
      </div>

      {/* 3. Global Persistent Glassmorphism HUD Panel */}
      <Glassmorphism containerRef={containerRef as React.RefObject<HTMLDivElement>} />

      {/* 4. Foreground Scrolling Content (Original Sharp Layer) */}
      <div className="relative z-10 pointer-events-none">
        <SecondScroll />
        <PersonalProjects />
        <ExperienceGrid />
      </div>

      {/* 5. Duplicated Blur Layer — desktop only (too expensive on mobile)
        Duplicates DOM content, blurs it, and masks it to the top ~200px.
        Skipped on mobile to avoid double-rendering cost.
      */}
      {!isMobile && (
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 [&_*]:!pointer-events-none"
          style={{
            filter: 'blur(16px)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0px, black 80px, transparent 240px)',
            WebkitMaskAttachment: 'fixed',
            maskImage: 'linear-gradient(to bottom, black 0px, black 80px, transparent 240px)',
            maskAttachment: 'fixed'
          } as any}
        >
          <SecondScroll />
          <PersonalProjects />
          <ExperienceGrid />
        </div>
      )}
    </div>
  );
}