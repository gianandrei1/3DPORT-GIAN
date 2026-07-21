import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import useLenis from './hooks/useLenis';
import Header from './components/Header';
import Hero from './components/Hero';
import Preloader, { GLITCH_FADE_S } from './components/Preloader';
import TVStaticBackground from './components/TVStaticBackground';
import Footer from './components/Footer';

function App() {
  useLenis();
  const [isLoading, setIsLoading] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Prevent browser from restoring scroll position on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      {/* ↓ Permanent static grain — change opacity here (0 = off, 1 = full) */}
      <TVStaticBackground opacity={0.06} />
      {/* mode sync (default) = exit and enter run simultaneously — that's the crossfade */}
      <AnimatePresence>
        {isLoading && (
          <Preloader 
            key="preloader" 
            onComplete={() => setIsLoading(false)} 
            onGlitchStart={() => setIsGlitching(true)}
          />
        )}
      </AnimatePresence>

      {/* Always mounted so Three.js/WebGL warms up during the preloader countdown.
          Invisible until loading finishes to prevent flash. */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: isLoading ? (isGlitching ? 0.12 : 0) : 1, 
          pointerEvents: isLoading ? 'none' : 'auto' 
        }}
        transition={{ duration: GLITCH_FADE_S, ease: 'easeInOut' }}
      >
          <Header />
          <main className="w-full bg-background relative selection:bg-white/20">
            <Hero />
            <Footer />
          </main>
      </motion.div>
    </>
  );
}

export default App;
