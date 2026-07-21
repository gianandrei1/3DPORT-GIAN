import { useEffect, useRef } from 'react';

interface TVStaticBackgroundProps {
  /** 0 = invisible, 1 = full intensity. Recommended: 0.03 – 0.12 */
  opacity?: number;
  absolute?: boolean;
}

export default function TVStaticBackground({ opacity = 0.06, absolute = false }: TVStaticBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      // Use parent container dimensions if absolute, otherwise window
      const parent = canvas.parentElement;
      if (absolute && parent) {
        canvas.width = Math.floor(parent.clientWidth / 2);
        canvas.height = Math.floor(parent.clientHeight / 2);
      } else {
        canvas.width = Math.floor(window.innerWidth / 2);
        canvas.height = Math.floor(window.innerHeight / 2);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width: w, height: h } = canvas;
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);

      // Occasional faint scanline tear
      if (Math.random() < 0.08) {
        const y = (Math.random() * h) | 0;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx.fillRect(0, y, w, 1);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: absolute ? 'absolute' : 'fixed',
        inset: 0,
        width: absolute ? '100%' : '100vw',
        height: absolute ? '100%' : '100vh',
        // ↓ Adjust this to change the static intensity
        opacity,
        zIndex: 1,
        pointerEvents: 'none',
        imageRendering: 'pixelated', // keeps the chunky pixel look at half-res
      }}
    />
  );
}
