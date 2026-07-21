import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  SiReact, 
  SiTypescript, 
  SiPython, 
  SiNodedotjs, 
  SiSupabase, 
  SiPostgresql, 
  SiTailwindcss, 
  SiFramer, 
  SiNextdotjs, 
  SiExpress, 
  SiVercel 
} from 'react-icons/si';
import cvPdf from '../assets/GIAN-ANDREI-B-GELAY-Full-Stack-Developer.pdf';


// Local scroll reveal item - tracks its own intersection with the viewport
function RevealItem({ children, className = '', offset = ['start 100%', 'start 50%'] }: { children: React.ReactNode; className?: string; offset?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  const y = useTransform(scrollYProgress, [0, 1], ['120px', '0px']);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(24px)', 'blur(0px)']);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <motion.div ref={ref} style={{ y, opacity, filter: blur, scale }} className={`pointer-events-auto ${className}`}>
      {children}
    </motion.div>
  );
}

// Letter-by-letter reveal components
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
  const start = (index / total) * 0.6;
  const end = start + 0.15;

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
  scrollYProgress: externalScrollYProgress,
}: {
  text: string;
  className?: string;
  offset?: any;
  scrollYProgress?: any;
}) {
  const localRef = useRef<HTMLHeadingElement>(null);
  const localScrollInfo = useScroll({ target: localRef, offset });
  const scrollYProgress = externalScrollYProgress || localScrollInfo.scrollYProgress;

  const totalChars = text.replace(/\s/g, '').length;
  let charCount = 0;

  return (
    <div ref={externalScrollYProgress ? null : localRef} className={`flex flex-wrap justify-center ${className}`}>
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

function ScrollRevealButton({ children, href, className = '', offset = ['start 60%', 'start 30%'], ...props }: any) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const blurValue = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ opacity, filter, y, display: 'inline-block' }}
      {...props}
    >
      {children}
    </motion.a>
  );
}

const techStack = [
  { name: 'React', Icon: SiReact },
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'Node.js', Icon: SiNodedotjs },
  { name: 'Express.js', Icon: SiExpress },
  { name: 'Python', Icon: SiPython },
  { name: 'PostgreSQL', Icon: SiPostgresql },
  { name: 'Supabase', Icon: SiSupabase },
  { name: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'Framer Motion', Icon: SiFramer },
  { name: 'Vercel', Icon: SiVercel },
];

function TechIconStaggered({
  Icon,
  index,
  total,
  scrollYProgress,
}: {
  Icon: any;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const start = (index / total) * 0.6;
  const end = start + 0.15;

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const blurValue = useTransform(scrollYProgress, [start, end], [12, 0]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);
  const y = useTransform(scrollYProgress, [start, end], [10, 0]);

  return (
    <motion.div 
      style={{ opacity, filter, y }} 
      className="flex flex-col items-center justify-center relative group"
    >
      <Icon className="w-[18px] h-[18px] sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#FFFFFF] transition-all duration-300 group-hover:scale-110 group-hover:text-white" />
    </motion.div>
  );
}

function TechStackReveal({
  className = '',
  scrollYProgress,
}: {
  className?: string;
  scrollYProgress: any;
}) {
  return (
    <div 
      className={`flex flex-row justify-between items-center w-full max-w-4xl px-4 sm:px-8 mb-10 sm:mb-14 md:mb-16 pointer-events-auto ${className}`}
    >
      {techStack.map((tech, index) => (
        <TechIconStaggered
          key={tech.name}
          Icon={tech.Icon}
          index={index}
          total={techStack.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

export default function SecondScroll() {
  const combinedRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: combinedScrollYProgress } = useScroll({
    target: combinedRef,
    offset: ['start 80%', 'start 30%']
  });

  return (
    <div className="relative w-full flex flex-col items-center pointer-events-none pt-[130vh] pb-[10vh] z-20">
      {/* Cinematic Reveal Sequence */}
      <div className="w-full flex flex-col items-center mb-[2vh]">
        
        {/* Tech Stack & Text Combined Section */}
        <div ref={combinedRef} className="w-full flex flex-col items-center mix-blend-difference mt-[2vh] mb-2 md:mb-4">
          <TechStackReveal scrollYProgress={combinedScrollYProgress} />
          
          <div className="max-w-5xl w-full text-center px-4 sm:px-6 pointer-events-auto">
            <ScrollRevealText
              text="I specialize in developing modern web applications, user interfaces, and digital experiences that are both visually engaging and highly functional."
              className="text-xl sm:text-2xl md:text-3xl font-bold uppercase leading-tight tracking-tight text-white/90 hover:text-white transition-colors duration-300 cursor-default"
              scrollYProgress={combinedScrollYProgress}
            />
          </div>
        </div>

        {/* Final Description and CTA */}
        <div className="max-w-2xl w-full text-center px-6 mb-[1vh]">
          <RevealItem
            className="text-sm sm:text-base md:text-lg text-white/60 font-light leading-relaxed mb-[1vh]"
            offset={['start 95%', 'start 70%']} // Synchronized: Triggers after top text finishes
          >
            <p>Open to junior developer roles, freelance, and collaborative projects focused on creating meaningful digital experiences.</p>
          </RevealItem>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-2 md:mt-4 pointer-events-none w-full max-w-xs sm:max-w-none mx-auto">
            <ScrollRevealButton
              href={cvPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-white text-[10px] sm:text-xs uppercase tracking-widest font-mono px-6 py-4 hover:bg-white hover:border-white hover:text-black transition-all duration-300 pointer-events-auto w-full sm:w-auto text-center"
              offset={['start 100%', 'start 80%']} // Synchronized: Triggers exact same time as paragraph
            >
              View CV
            </ScrollRevealButton>
          </div>
        </div>
      </div>
    </div>
  );
}
