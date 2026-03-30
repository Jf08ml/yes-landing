"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FrenchFlagBg, USFlagBg } from "./Flag";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COURSES = [
  {
    id: "ingles",
    flag: "🇺🇸",
    lang: "EN",
    title: "Inglés",
    sub: "A1 – C1",
    tagline: "Inglés profesional para mentes globales.",
    desc: "Domina el idioma que abre puertas en tecnología, negocios y cultura internacional.",
    cardBg: "#FAFCFF",
    inkColor: "#0F172A",
    accentColor: "#C1121F",
    accentLight: "rgba(193,18,31,0.12)",
    radialBg:
      "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 68%)",
    shadowBase:
      "0 4px 24px -4px rgba(193,18,31,0.12), 0 1px 4px -2px rgba(15,23,42,0.06)",
    shadowHover:
      "0 28px 72px -10px rgba(193,18,31,0.28), 0 8px 24px -6px rgba(15,23,42,0.10)",
    href: "/cursos",
    delay: 0,
    floatDelay: 0,
    skyline: "nyc" as const,
    flagType: "us" as const,
  },
  {
    id: "frances",
    flag: "🇫🇷",
    lang: "FR",
    title: "Francés",
    sub: "A1 – B2",
    tagline: "El idioma de la cultura y la diplomacia.",
    desc: "Conecta con Europa y el mundo francófono. Prepárate para la certificación DELF.",
    cardBg: "#F7F8FF",
    inkColor: "#1D3557",
    accentColor: "#1A56DB",
    accentLight: "rgba(26,86,219,0.10)",
    radialBg:
      "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(26,86,219,0.10) 0%, transparent 68%)",
    shadowBase:
      "0 4px 24px -4px rgba(26,86,219,0.12), 0 1px 4px -2px rgba(29,53,87,0.06)",
    shadowHover:
      "0 28px 72px -10px rgba(26,86,219,0.28), 0 8px 24px -6px rgba(29,53,87,0.10)",
    href: "/cursos",
    delay: 0.12,
    floatDelay: 1.1,
    skyline: "paris" as const,
    flagType: "fr" as const,
  },
] as const;


// ─── Course Card ──────────────────────────────────────────────────────────────

type Course = (typeof COURSES)[number];

export function CourseCard({ course }: { course: Course }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, delay: course.delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={course.href}>
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          style={{ boxShadow: hovered ? course.shadowHover : course.shadowBase }}
          whileHover={reduced ? {} : { y: -6 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="relative overflow-hidden rounded-[28px] cursor-pointer
                     min-h-[60svh] md:min-h-0 md:h-[440px]
                     border border-black/[0.6]"
        >
          {/* ── Flag shader — ocupa todo el card ── */}
          {course.flagType === "us" ? <USFlagBg /> : <FrenchFlagBg />}

          {/* ── Skyline de ciudad sobre la bandera ── */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-[1]"
            style={{ filter: `drop-shadow(0 -4px 12px ${course.inkColor}22)` }}
          >
            <Image
              src={course.skyline === "nyc" ? "/NYCSkyline-no-bg.png" : "/france-skyline.png"}
              alt=""
              width={800}
              height={210}
              className="w-full h-auto opacity-90"
            />
          </div>

          {/* ── Velo superior oscuro para que la bandera no tape el texto ── */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 55%)` }}
          />

          {/* ── Franja accent top ── */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] z-20"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${course.accentColor} 20%, ${course.accentColor} 80%, transparent 100%)` }}
          />

          {/* ── Panel de contenido inferior ── */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              background: `linear-gradient(to top, ${course.cardBg}ee 0%, ${course.cardBg}bb 38%, ${course.cardBg}44 58%, transparent 100%)`,
              paddingTop: '5rem',
            }}
          >
            <div className="px-7 pb-7 flex flex-col items-center text-center">

              {/* Idioma badge */}
              <span
                className="inline-flex items-center text-[10px] font-bold uppercase
                            tracking-[0.18em] px-3 py-1 rounded-full mb-3"
                style={{
                  color: course.inkColor,
                  background: `${course.cardBg}cc`,
                  border: `1px solid ${course.accentColor}55`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {course.sub}
              </span>

              {/* Title */}
              <h3
                className="text-[2rem] font-black tracking-tight leading-none mb-1.5"
                style={{ color: course.inkColor }}
              >
                {course.title}
              </h3>

              {/* Divider */}
              <div className="w-8 h-[2px] rounded-full mb-2.5" style={{ background: course.accentColor }} />

              {/* Tagline */}
              <p
                className="text-[12px] font-semibold mb-2.5 max-w-[220px] leading-snug"
                style={{ color: course.accentColor }}
              >
                {course.tagline}
              </p>

              {/* Description */}
              <p
                className="text-[12px] leading-relaxed mb-5 max-w-[240px] font-normal"
                style={{ color: `${course.inkColor}99` }}
              >
                {course.desc}
              </p>

              {/* CTA */}
              <motion.div
                className="inline-flex items-center gap-2.5 text-[13px] font-bold px-6 py-3 rounded-xl text-white"
                style={{
                  background: course.accentColor,
                  boxShadow: hovered
                    ? `0 10px 32px -6px ${course.accentColor}55`
                    : `0 4px 16px -4px ${course.accentColor}33`,
                }}
                whileHover={reduced ? {} : { scale: 1.04, y: -2 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
              >
                Ver programa
                <motion.span
                  className="inline-block"
                  animate={{ x: hovered ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                >
                  →
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* ── Watermark idioma (top-right, sobre la bandera) ── */}
          <div
            className="absolute top-5 right-6 font-black select-none pointer-events-none z-10"
            style={{
              fontSize: '4.5rem',
              color: 'white',
              opacity: 0.20,
              letterSpacing: '-0.06em',
              lineHeight: 1,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {course.lang}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function CoursesPreview() {
  return (
    <section
      id="cursos"
      className="relative py-16 md:py-24 px-4 overflow-hidden bg-[#F4F6F9]"
    >
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Ambient color washes per idioma */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 15% 60%, rgba(193,18,31,0.10) 0%, transparent 62%)," +
            "radial-gradient(ellipse 55% 65% at 85% 60%, rgba(26,86,219,0.10) 0%, transparent 62%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10 md:mb-12">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-black uppercase tracking-[0.32em] mb-3 text-[#0F172A]/30"
          >
            Programas académicos
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.07,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="tracking-tight"
          >
            <span className="block font-light text-[#0F172A] text-2xl sm:text-[1.7rem] md:text-[2rem] tracking-[0.01em]">
              Domina el idioma.
            </span>
            <span className="block font-black text-[#C1121F] text-3xl sm:text-[2.3rem] md:text-[2.8rem] tracking-[-0.01em] mt-0.5">
              Domina el mundo.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mt-3 text-[14px] max-w-xs mx-auto font-normal leading-relaxed text-[#0F172A]/45"
          >
            Dos idiomas. Una transformación.
            <br />
            Comienza tu camino hacia el mundo.
          </motion.p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
