import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─── RevealBlock — identical physics to PersonalProjects ─────────────────────

function RevealBlock({
  children,
  className = '',
  offset = ['start 95%', 'start 65%'],
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
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, filter, y }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const skills = [
  { id: '01', category: 'Development', desc: 'TypeScript, React, Next.js, Tailwind CSS, REST APIs, Git & GitHub, Responsive Web Design.' },
  { id: '02', category: 'Design', desc: 'UI/UX Design, Wireframing, Design Systems, Adobe Photoshop, Typography, Color Theory.' },
  { id: '03', category: 'Software Engineering', desc: 'Database Design, Inventory Management Systems, CRUD Applications, Authentication & Authorization, Debugging & Testing' },
  { id: '04', category: 'Strategy', desc: 'Business Analysis, Workflow Optimization, Requirements Analysis, User Research, Information Architecture, Problem Solving, Project Planning, Decision Making.' },
  { id: '05', category: 'Professional Skills', desc: 'Critical Thinking, Project Planning, Adaptability, Attention to Detail, Problem Solving' },
];

const contacts = [
  { id: '01', label: 'Email', value: 'gelaygian@gmail.com', href: 'mailto:gelaygian@gmail.com' },
  { id: '02', label: 'GitHub', value: 'github.com/gianandrei', href: 'https://github.com/gianandrei1' },
  { id: '03', label: 'LinkedIn', value: 'linkedin.com/in/gianandrei', href: 'https://www.linkedin.com/in/gian-gelay-983b0a328/' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExperienceGrid() {
  return (
    <section className="w-full text-[#e5e5e5] font-sans pt-24 pb-0 px-6 md:px-12 pointer-events-auto">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

        {/* Column 1: Skills */}
        <div>
          <RevealBlock offset={['start 100%', 'start 90%']}>
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-8 border-b border-white/10 pb-4">Skills</h2>
          </RevealBlock>
          <ul className="flex flex-col">
            {skills.map((skill, idx) => (
              <RevealBlock key={skill.id} className={`relative py-6 ${idx !== skills.length - 1 ? 'border-b border-white/10' : ''}`} offset={['start 100%', 'start 90%']}>
                <span className="absolute top-6 right-0 text-[10px] font-mono text-white/30">{skill.id}</span>
                <div className="font-bold text-base mb-2 text-white">{skill.category}</div>
                <p className="text-sm text-white/40 leading-relaxed pr-8">{skill.desc}</p>
              </RevealBlock>
            ))}
          </ul>
        </div>

        {/* Column 2: Contact */}
        <div>
          <RevealBlock offset={['start 100%', 'start 90%']}>
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-8 border-b border-white/10 pb-4">Contact</h2>
          </RevealBlock>
          <ul className="flex flex-col">
            {contacts.map((item, idx) => (
              <RevealBlock key={item.id} className={`relative py-6 ${idx !== contacts.length - 1 ? 'border-b border-white/10' : ''}`} offset={['start 100%', 'start 90%']}>
                <span className="absolute top-6 right-0 text-[10px] font-mono text-white/30">{item.id}</span>
                <div className="text-xs text-white/40 uppercase tracking-widest font-mono mb-2">{item.label}</div>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="text-base text-white/80 hover:text-white transition-colors pr-8 block pointer-events-auto"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-base text-white/80 pr-8 block">{item.value}</span>
                )}
              </RevealBlock>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
