import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import baybayin from '../assets/baybayin.svg';

function RevealBlock({
  children,
  className = '',
  offset = ['start 95%', 'end 100%'],
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
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, filter, y }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Footer() {
  const [isLatin, setIsLatin] = useState(false);

  return (
    <footer className="relative w-full overflow-hidden pointer-events-auto m-0 p-0">
      {/* Main name block */}
      <div className="relative z-20 w-full m-0 p-0 overflow-hidden">
        <RevealBlock>
          <div
            className="w-full cursor-pointer flex justify-center"
            onClick={() => setIsLatin(!isLatin)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLatin ? (
                <motion.h2
                  key="latin"
                  initial={{ opacity: 0, filter: 'blur(12px) brightness(2)', scale: 1.02, skewX: 5 }}
                  animate={{
                    opacity: [0, 0.8, 0.4, 1],
                    filter: [
                      'blur(12px) brightness(2)',
                      'blur(4px) brightness(1.5)',
                      'blur(6px) brightness(1.2)',
                      'blur(0px) brightness(1)',
                    ],
                    scale: 1,
                    skewX: 0,
                  }}
                  exit={{
                    opacity: [1, 0.4, 0.8, 0],
                    filter: [
                      'blur(0px) brightness(1)',
                      'blur(6px) brightness(1.2)',
                      'blur(4px) brightness(1.5)',
                      'blur(12px) brightness(2)',
                    ],
                    scale: 0.98,
                    skewX: -5,
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}
                  className="select-none leading-none font-black uppercase text-center whitespace-nowrap text-white hover:text-[var(--theme-color)] transition-colors duration-300 w-full block"
                  style={{
                    fontFamily: "'Inter', 'Arial Black', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(2.5rem, 11vw, 18rem)',
                    letterSpacing: '0.05em',
                    lineHeight: 0.9,
                    WebkitMaskImage:
                      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0) 100%)',
                    maskImage:
                      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0) 100%)',
                  }}
                >
                  GIANANDREI
                </motion.h2>
              ) : (
                <motion.div
                  key="baybayin"
                  initial={{ opacity: 0, filter: 'blur(12px) brightness(2)', scale: 1.02, skewX: 5 }}
                  animate={{
                    opacity: [0, 0.8, 0.4, 1],
                    filter: [
                      'blur(12px) brightness(2)',
                      'blur(4px) brightness(1.5)',
                      'blur(6px) brightness(1.2)',
                      'blur(0px) brightness(1)',
                    ],
                    scale: 1,
                    skewX: 0,
                  }}
                  exit={{
                    opacity: [1, 0.4, 0.8, 0],
                    filter: [
                      'blur(0px) brightness(1)',
                      'blur(6px) brightness(1.2)',
                      'blur(4px) brightness(1.5)',
                      'blur(12px) brightness(2)',
                    ],
                    scale: 0.98,
                    skewX: -5,
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}
                  className="w-full flex justify-center select-none"
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0) 100%)',
                    maskImage:
                      'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0) 100%)',
                  }}
                >
                  <img
                    src={baybayin}
                    alt="ᜄᜒᜌᜈ᜕ ᜀᜈ᜕ᜇ᜕ᜍᜒᜁ"
                    draggable={false}
                    className="w-full max-w-none pointer-events-none"
                    style={{
                      height: 'clamp(2.5rem, 11vw, 18rem)',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      filter: 'brightness(0) invert(1)',
                      display: 'block',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </RevealBlock>
      </div>
    </footer>
  );
}
