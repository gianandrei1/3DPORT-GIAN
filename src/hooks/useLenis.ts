import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * useLenis - Initializes Lenis smooth scrolling on desktop only.
 * On mobile, native momentum scrolling is used for best performance.
 */
export default function useLenis() {
  useEffect(() => {
    // On mobile, native scroll is smoother than JS-driven smooth scroll.
    // Lenis adds ~1 frame of JS overhead per tick; on constrained GPUs
    // (mobile) this compounds with the 3D render loop and causes jank.
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

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
