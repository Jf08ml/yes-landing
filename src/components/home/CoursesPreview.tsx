'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

// ─── Data ────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: 'ingles',
    flag: '🇺🇸',
    lang: 'EN',
    title: 'Inglés',
    sub: 'Niveles A1 – C1',
    desc: 'De principiante a avanzado. Certificación B1 garantizada.',
    accent: '#ED1118',
    glow: 'rgba(237,17,24,0.15)',
    glowStrong: 'rgba(237,17,24,0.25)',
    href: '/cursos',
    delay: 0,
    floatDelay: 0,
  },
  {
    id: 'frances',
    flag: '🇫🇷',
    lang: 'FR',
    title: 'Francés',
    sub: 'Niveles A1 – B2',
    desc: 'Preparación DELF. Profesores especializados.',
    accent: '#4B6BFB',
    glow: 'rgba(75,107,251,0.15)',
    glowStrong: 'rgba(75,107,251,0.25)',
    href: '/cursos',
    delay: 0.12,
    floatDelay: 1.1,
  },
] as const;

// ─── Card component with tilt + mouse glow ────────────────────────────────────

function CourseCard({ course, index }: { course: typeof COURSES[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 30 });

  // Spring-physics tilt
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-5, 5]), { stiffness: 180, damping: 24 });
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [4, -4]), { stiffness: 180, damping: 24 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    rawX.set(relX - 0.5);
    rawY.set(relY - 0.5);
    setGlowPos({ x: relX * 100, y: relY * 100 });
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setGlowPos({ x: 50, y: 30 });
    setHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: course.delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={{ perspective: '1200px' }}
    >
      {/* External ambient glow behind card */}
      <div
        className="absolute inset-4 -z-10 blur-3xl transition-opacity duration-500 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse, ${course.glow}, transparent 70%)`,
          opacity: hovered ? 1 : 0.4,
        }}
      />

      <Link href={course.href}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onHoverStart={() => setHovered(true)}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          whileHover={{ y: -8 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="relative overflow-hidden rounded-3xl cursor-pointer h-[360px]"
        >
          {/* Card base */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Mouse-following glow inside card */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, ${course.glowStrong}, transparent 65%)`,
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Hover border glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-400"
            style={{
              border: `1px solid ${course.glowStrong}`,
              opacity: hovered ? 1 : 0,
              boxShadow: `0 0 40px -10px ${course.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-12 h-px rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${course.accent}, transparent)`,
              opacity: hovered ? 0.8 : 0.3,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Language code watermark */}
          <div
            className="absolute -right-1 bottom-0 font-black text-white select-none pointer-events-none"
            style={{
              fontSize: '8.5rem',
              opacity: 0.035,
              letterSpacing: '-0.06em',
              lineHeight: 1,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {course.lang}
          </div>

          {/* ── Content ── */}
          <div
            className="relative h-full flex flex-col items-center justify-center px-8 pb-2 text-center z-10"
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* Floating flag */}
            <motion.div
              animate={{ y: [0, -11, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: course.floatDelay,
              }}
              className="relative mb-5"
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
                style={{
                  background: course.glow,
                  transform: 'scale(2.2)',
                  opacity: hovered ? 1 : 0.6,
                  transition: 'opacity 0.3s ease',
                }}
              />
              <span
                className="relative select-none"
                style={{
                  fontSize: '4.5rem',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 8px 28px rgba(0,0,0,0.6))',
                }}
              >
                {course.flag}
              </span>
            </motion.div>

            {/* Title */}
            <h3 className="text-[2.2rem] font-black text-white tracking-tight mb-1.5 leading-none">
              {course.title}
            </h3>

            {/* Levels badge */}
            <span
              className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full mb-4"
              style={{
                color: course.accent,
                background: `${course.glow}`,
                border: `1px solid ${course.glowStrong}`,
              }}
            >
              {course.sub}
            </span>

            {/* Description */}
            <p className="text-white/45 text-sm leading-relaxed mb-7 max-w-[230px] font-light">
              {course.desc}
            </p>

            {/* CTA */}
            <motion.div
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-shadow duration-300"
              style={{
                color: '#fff',
                background: `linear-gradient(135deg, ${course.accent}dd, ${course.accent}99)`,
                boxShadow: hovered
                  ? `0 8px 30px -6px ${course.glowStrong}`
                  : `0 4px 16px -4px ${course.glow}`,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              Ver programa
              <motion.span
                animate={{ x: hovered ? 4 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="inline-block"
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function CoursesPreview() {
  return (
    <section
      id="cursos"
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #08091a 0%, #05060f 100%)' }}
    >
      {/* Section ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(237,17,24,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(75,107,251,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black uppercase tracking-[0.28em] mb-4"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Programas académicos
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight"
          >
            Nuestros <span style={{ color: '#ED1118' }}>Cursos</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-4 text-base max-w-md mx-auto font-light"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Domina un idioma con metodología práctica y enfoque internacional.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {COURSES.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
