import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryOverlayProps {
  images: string[];
  onClose: () => void;
}

export default function GalleryOverlay({ images, onClose }: GalleryOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Removed scroll lock so the background can still scroll seamlessly
  // But we will inject CSS to hide the scrollbars to keep it clean.

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageNode, setImageNode] = useState<HTMLImageElement | null>(null);

  const handleImageRef = useCallback((node: HTMLImageElement | null) => {
    if (node !== null) {
      setImageNode(node);
    }
  }, []);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    if (!imageNode) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZoomLevel(prev => {
        const newZoom = Math.min(Math.max(prev - Math.sign(e.deltaY) * 0.15, 1), 5);
        if (newZoom !== prev) {
          const container = imageNode.parentElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const cx = e.clientX - (containerRect.left + containerRect.width / 2);
            const cy = e.clientY - (containerRect.top + containerRect.height / 2);
            
            setPan(currentPan => {
              const newX = currentPan.x - cx * (1 / prev - 1 / newZoom);
              const newY = currentPan.y - cy * (1 / prev - 1 / newZoom);
              
              const maxPanX = (containerRect.width  * (newZoom - 1)) / (2 * newZoom);
              const maxPanY = (containerRect.height * (newZoom - 1)) / (2 * newZoom);
              
              return {
                 x: Math.min(maxPanX, Math.max(-maxPanX, newX)),
                 y: Math.min(maxPanY, Math.max(-maxPanY, newY))
              };
            });
          }
        }
        return newZoom;
      });
    };

    imageNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => imageNode.removeEventListener('wheel', handleWheel);
  }, [imageNode]);

  useEffect(() => {
    if (zoomLevel <= 1) setPan({ x: 0, y: 0 });
  }, [zoomLevel]);

  const [isDragging, setIsDragging] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    } else {
      const newZoom = 3; // Zoom in to 3x on double click
      const container = imageNode?.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const cx = e.clientX - (containerRect.left + containerRect.width / 2);
        const cy = e.clientY - (containerRect.top + containerRect.height / 2);

        const newX = -cx * (1 - 1 / newZoom);
        const newY = -cy * (1 - 1 / newZoom);

        const maxPanX = (containerRect.width  * (newZoom - 1)) / (2 * newZoom);
        const maxPanY = (containerRect.height * (newZoom - 1)) / (2 * newZoom);

        setPan({
          x: Math.min(maxPanX, Math.max(-maxPanX, newX)),
          y: Math.min(maxPanY, Math.max(-maxPanY, newY))
        });
      }
      setZoomLevel(newZoom);
    }
  };

  const toggleZoom = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoomLevel(3);
      setPan({ x: 0, y: 0 });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setIsBouncing(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const img = imageNode;
    if (!img) return;

    const maxPanX = (img.offsetWidth  * (zoomLevel - 1)) / (2 * zoomLevel);
    const maxPanY = (img.offsetHeight * (zoomLevel - 1)) / (2 * zoomLevel);

    setPan(prev => {
      const rawX = prev.x + e.movementX / zoomLevel;
      const rawY = prev.y + e.movementY / zoomLevel;

      // Rubber-band resistance: allow over-drag with diminishing returns
      const rubberBand = (value: number, limit: number) => {
        if (Math.abs(value) <= limit) return value;
        const excess = Math.abs(value) - limit;
        const dampened = limit + excess * 0.25; // 25% resistance beyond limit
        return value < 0 ? -dampened : dampened;
      };

      return {
        x: rubberBand(rawX, maxPanX),
        y: rubberBand(rawY, maxPanY),
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Bounce back if pan is outside valid bounds
    const img = imageNode;
    if (!img) return;
    const maxPanX = (img.offsetWidth  * (zoomLevel - 1)) / (2 * zoomLevel);
    const maxPanY = (img.offsetHeight * (zoomLevel - 1)) / (2 * zoomLevel);

    setPan(prev => {
      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, prev.x));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, prev.y));
      if (clampedX !== prev.x || clampedY !== prev.y) {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);
        return { x: clampedX, y: clampedY };
      }
      return prev;
    });
  };

  if (!images || images.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[8px] overflow-hidden font-sans pointer-events-auto"
      >
        <style>{`
          html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
          html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        `}</style>
        {/* Top Header: Counter & Utilities */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-50">
          {/* Counter */}
          <div className="text-white/80 font-mono text-sm tracking-widest bg-black/100 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            {currentIndex + 1} <span className="opacity-40">/</span> {images.length}
          </div>

          {/* Utility Bar */}
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <button onClick={toggleZoom} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors" title={zoomLevel > 1 ? "Zoom Out" : "Zoom In"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                {zoomLevel <= 1 && <path d="M11 8v6" />}
                <path d="M8 11h6" />
              </svg>
            </button>
            <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Fullscreen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {isFullscreen ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                )}
              </svg>
            </button>
            <div className="w-px h-6 bg-white/10 self-center mx-1" />
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Staging */}
        <div className="relative w-full h-full flex items-center justify-center px-20 pt-20 pb-32 perspective-[1200px]">
          {/* Secondary / Next Image (Layered Behind) */}


          {/* Main Active Image */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 max-w-[85vw] max-h-[80vh]"
              style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              {/* overflow:hidden clips the panned image inside the fixed viewport */}
              <div
                className="overflow-hidden rounded-sm"
                style={{ width: 'max-content', height: 'max-content', maxWidth: '85vw', maxHeight: '80vh' }}
              >
                <img
                  ref={handleImageRef}
                  src={images[currentIndex]}
                  alt={`Gallery image ${currentIndex + 1}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onDoubleClick={handleDoubleClick}
                  style={{
                    /* translate is in zoomed-image px; scale expands around center */
                    transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                    transition: isDragging
                      ? 'none'
                      : isBouncing
                        ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' // spring overshoot
                        : 'transform 0.1s ease-out', // faster transition for snappy zooming
                    transformOrigin: 'center',
                    touchAction: 'none',
                    userSelect: 'none', // prevent text selection during double click
                  }}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain block"
                  draggable={false}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side Navigation Arrows */}
        <button 
          onClick={prevImage}
          className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 z-50 group"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="group-hover:-translate-x-1 transition-transform">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button 
          onClick={nextImage}
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 z-50 group"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="group-hover:translate-x-1 transition-transform">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Bottom Thumbnail Strip */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6 z-50">
          <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          <div className="flex gap-3 px-6 overflow-x-auto no-scrollbar">
            {images.map((src, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded overflow-hidden transition-all duration-500 ease-out ${
                    isActive 
                      ? 'ring-2 ring-white scale-110 opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                      : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {!isActive && <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />}
                </button>
              );
            })}
          </div>
        </div>

      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
