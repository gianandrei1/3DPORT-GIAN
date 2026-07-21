import { motion, useScroll, useTransform } from 'framer-motion';

interface GlassmorphismProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function Glassmorphism({ containerRef }: GlassmorphismProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const hudY = useTransform(scrollYProgress, [0, 0.02], ['100%', '0%']);
  const hudOpacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  return (
    <motion.div
      style={{ y: hudY, opacity: hudOpacity }}
      className="fixed bottom-0 left-0 w-full h-3 md:h-6 bg-background/30 backdrop-blur-xl border-t border-white/10 flex items-center shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50 pointer-events-none"
    />
  );
}
