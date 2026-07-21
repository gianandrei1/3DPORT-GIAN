import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * useLenis - Initializes Lenis smooth scrolling and updates on each animation frame.
 * Call this hook once at the root of your app (inside StrictMode).
 */
export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}
