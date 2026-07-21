import { useEffect, useRef } from 'react';

export default function Header() {
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  
  const nameRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<HTMLDivElement>(null);

  // Refs for labels to scramble
  const lblCursorX = useRef<HTMLSpanElement>(null);
  const lblCursorY = useRef<HTMLSpanElement>(null);
  const lblScroll = useRef<HTMLSpanElement>(null);
  const lblTime = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = performance.now();
    let frame: number;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const chars = '01';
    const nameStr = 'Gian Andrei';
    const portStr = 'Portfolio';
    const lblCursorXStr = 'Cursor X:';
    const lblCursorYStr = 'Cursor Y:';
    const lblScrollStr = 'Scroll:';
    const lblTimeStr = 'Time:';

    const scrambleText = (str: string) => {
      return str.split('').map(char => {
        if (char === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
    };

    const updateMouse = (e: MouseEvent) => {
      if (xRef.current) xRef.current.textContent = Math.floor(e.clientX).toString();
      if (yRef.current) yRef.current.textContent = Math.floor(e.clientY).toString();
    };

    const updateScroll = () => {
      if (scrollRef.current) scrollRef.current.textContent = Math.floor(window.scrollY).toString();
      
      // Scramble header text and labels on active scroll
      if (nameRef.current) nameRef.current.textContent = scrambleText(nameStr);
      if (portRef.current) portRef.current.textContent = scrambleText(portStr);
      
      if (lblCursorX.current) lblCursorX.current.textContent = scrambleText(lblCursorXStr);
      if (lblCursorY.current) lblCursorY.current.textContent = scrambleText(lblCursorYStr);
      if (lblScroll.current) lblScroll.current.textContent = scrambleText(lblScrollStr);
      if (lblTime.current) lblTime.current.textContent = scrambleText(lblTimeStr);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (nameRef.current) nameRef.current.textContent = nameStr;
        if (portRef.current) portRef.current.textContent = portStr;
        
        if (lblCursorX.current) lblCursorX.current.textContent = lblCursorXStr;
        if (lblCursorY.current) lblCursorY.current.textContent = lblCursorYStr;
        if (lblScroll.current) lblScroll.current.textContent = lblScrollStr;
        if (lblTime.current) lblTime.current.textContent = lblTimeStr;
      }, 50); // Snap back quickly after scroll stops
    };

    const updateTime = (time: number) => {
      const elapsed = ((time - start) / 1000).toFixed(1);
      if (timeRef.current) timeRef.current.textContent = elapsed + 's';
      frame = requestAnimationFrame(updateTime);
    };

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('scroll', updateScroll, { passive: true });
    frame = requestAnimationFrame(updateTime);

    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('scroll', updateScroll);
      cancelAnimationFrame(frame);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      
      {/* Base Header styling - background tint is optional if the blur is strong enough */}
      <div className="absolute inset-0 w-full h-full bg-background/20 pointer-events-none border-b border-white/[0.08] backdrop-blur-md" />

      {/* Header Content */}
      <div className="relative p-6 flex justify-between items-start mix-blend-difference text-secondary text-xs uppercase font-mono tracking-widest">
        
        {/* Left Section - Name */}
        <div className="flex flex-col gap-1">
          <div ref={nameRef} className="pointer-events-auto hover:text-primary transition-colors cursor-pointer text-white font-bold tracking-tight w-max">Gian Andrei</div>
          <div ref={portRef} className="text-[10px] opacity-50 tracking-[0.2em] w-max">Portfolio</div>
        </div>

        {/* Right Section - Diagnostics */}
        <div className="hidden md:flex justify-end gap-12 text-[10px]">
          <div className="flex flex-col gap-1 w-[120px]">
            <div className="flex justify-between w-full">
              <span ref={lblCursorX}>Cursor X:</span> 
              <span ref={xRef} className="text-primary font-bold inline-block w-8 text-right">0</span>
            </div>
            <div className="flex justify-between w-full">
              <span ref={lblCursorY}>Cursor Y:</span> 
              <span ref={yRef} className="text-primary font-bold inline-block w-8 text-right">0</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-[120px]">
            <div className="flex justify-between w-full">
              <span ref={lblScroll}>Scroll:</span> 
              <span ref={scrollRef} className="text-primary font-bold inline-block w-12 text-right">0</span>
            </div>
            <div className="flex justify-between w-full">
              <span ref={lblTime}>Time:</span> 
              <span ref={timeRef} className="text-primary font-bold inline-block w-12 text-right">0.0s</span>
            </div>
          </div>
        </div>
      </div>
      
    </header>
  );
}