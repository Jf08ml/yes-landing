'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GraduationCap, Phone } from 'lucide-react';
import type { BlogPost } from '@/types';

// Lazy-loaded WebGL background — skipped on SSR and on mobile/low-end
const HeroBackground = dynamic(() => import('./HeroBackground'), { ssr: false });

interface HeroProps {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaWhatsappText: string;
  };
  noticias?: BlogPost[];
  whatsapp: string;
}

const RED  = '#ED1118';
const BLUE = '#323D6E';

export default function Hero({ hero, noticias = [], whatsapp }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  // Skip WebGL on mobile — GPU too weak, globe barely visible on small screens
  const [isMobile, setIsMobile] = useState(true); // start true to avoid flash on mobile SSR
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (noticias.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % noticias.length);
    }, 4500);
    return () => clearInterval(id);
  }, [noticias.length]);

  const waLink = useMemo(() =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los cursos de YES Institute')}`,
    [whatsapp]
  );

  const titleWords = useMemo(() => hero.title.split(' '), [hero.title]);

  const current = noticias[activeIndex];

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">

      {/* WebGL animated gradient background — skipped only on reduced-motion */}
      {!shouldReduceMotion ? (
        <HeroBackground reducedQuality={isMobile} />
      ) : (
        // Fallback estático para usuarios con prefers-reduced-motion
        <div
          className="absolute inset-0"
          style={{
            zIndex: -20,
            background: 'linear-gradient(150deg, #EEF2FF 0%, #FFFFFF 50%, #F5F7FF 100%)',
          }}
        />
      )}

      {/* Grid pattern estático — CSS puro, sin animación */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.10]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(50,61,110,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(50,61,110,0.15) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 0%, transparent 60%)',
        }}
      />


      {/* ── Hero partido (hero-split) ── */}
      {noticias.length > 0 ? (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Columna izquierda */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-left relative"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                boxShadow: '0 4px 40px rgba(50,61,110,0.08)',
                border: '1px solid rgba(255,255,255,0.80)',
              }}
            >
              <div className="inline-flex items-center relative mb-8">
                <motion.div
                  className="relative px-5 py-2 rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(50,61,110,0.08)',
                    border: '1px solid rgba(50,61,110,0.18)',
                    boxShadow: '0 4px 24px rgba(50,61,110,0.10)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                >
                  {!shouldReduceMotion && (
                    <motion.span
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(50,61,110,0.10) 45%, transparent 70%)' }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative text-sm font-semibold" style={{ color: BLUE }}>
                    <GraduationCap className="inline w-4 h-4 mr-1.5 text-yellow-500 shrink-0" />Más de 32 años formando profesionales bilingües en Neiva
                  </span>
                </motion.div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black leading-[1.04] tracking-tight mb-6">
                {titleWords.map((w, i) => {
                  const isEnglish = w.toLowerCase().includes('ingl');
                  const isFrench  = w.toLowerCase().includes('franc');
                  return (
                    <motion.span
                      key={`${w}-${i}`}
                      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                      className="inline-block mr-3"
                      style={{
                        color: isEnglish ? RED : isFrench ? BLUE : '#111827',
                        textShadow: isEnglish ? '0 8px 30px rgba(237,17,24,0.18)' : isFrench ? '0 8px 30px rgba(50,61,110,0.15)' : 'none',
                      }}
                    >
                      {w}
                    </motion.span>
                  );
                })}
              </h1>

              <div className="relative mb-8">
                <motion.div
                  className="h-[2px] w-full max-w-xs rounded-full opacity-70"
                  style={{ background: `linear-gradient(90deg, ${RED} 0%, rgba(50,61,110,0.7) 60%, transparent 100%)` }}
                  animate={shouldReduceMotion ? {} : { opacity: [0.45, 0.75, 0.50] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
                style={{ color: '#374151' }}
              >
                {hero.subtitle}
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="/contacto"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${RED} 0%, rgba(237,17,24,0.85) 40%, rgba(255,255,255,0.10) 140%)`,
                    boxShadow: '0 12px 40px rgba(237,17,24,0.22)',
                  }}
                >
                  {!shouldReduceMotion && (
                    <motion.span
                      className="absolute inset-0 opacity-70"
                      style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.26) 42%, transparent 70%)' }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative flex items-center gap-2"><Phone className="w-4 h-4" />{hero.ctaText}</span>
                </motion.a>

                <motion.a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold overflow-hidden"
                  style={{
                    background: 'white',
                    border: `1.5px solid rgba(50,61,110,0.18)`,
                    color: BLUE,
                    boxShadow: '0 8px 32px rgba(50,61,110,0.12)',
                  }}
                >
                  <svg className="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="relative">{hero.ctaWhatsappText}</span>
                </motion.a>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-md"
                style={{ color: '#000000' }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                  Cursos por niveles • Acompañamiento
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
                  Inglés / Francés • Modalidades flexibles
                </span>
              </motion.div>
            </motion.div>

            {/* Columna derecha: carrusel de noticias */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="relative"
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: RED, background: 'rgba(237,17,24,0.10)', border: '1px solid rgba(237,17,24,0.18)' }}
                >
                  Noticias
                </span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{activeIndex + 1} / {noticias.length}</span>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(50,61,110,0.12)]"
                style={{ background: 'white', border: '1px solid rgba(50,61,110,0.10)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {(current.coverImage || current.coverVideo) && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        {current.coverType === 'video' && current.coverVideo ? (
                          (() => {
                            const ytMatch = current.coverVideo.match(
                              /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
                            );
                            return ytMatch ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&mute=1&rel=0&modestbranding=1`}
                                title={current.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                              />
                            ) : (
                              <video
                                src={current.coverVideo}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                              />
                            );
                          })()
                        ) : (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={current.coverImage}
                              alt={current.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </>
                        )}
                        {current.category && (
                          <span
                            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ background: 'rgba(237,17,24,0.80)' }}
                          >
                            {current.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <Link
                        href={`/blog/${current.slug}`}
                        className="group block"
                      >
                        <h3 className="font-bold text-base leading-snug mb-2 transition-colors" style={{ color: '#111827' }}>
                          {current.title}
                        </h3>
                        {current.excerpt && (
                          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>
                            {current.excerpt}
                          </p>
                        )}
                        <span
                          className="inline-flex items-center gap-1 mt-3 text-xs font-semibold transition-colors"
                          style={{ color: RED }}
                        >
                          Leer más →
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {noticias.length > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <button
                    onClick={() => setActiveIndex((activeIndex - 1 + noticias.length) % noticias.length)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors"
                    style={{ border: '1px solid rgba(50,61,110,0.18)', background: 'white', color: '#6B7280' }}
                    aria-label="Noticia anterior"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-2">
                    {noticias.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Noticia ${i + 1}`}
                        className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                        style={{
                          width: i === activeIndex ? '20px' : '6px',
                          background: i === activeIndex ? RED : 'rgba(50,61,110,0.20)',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveIndex((activeIndex + 1) % noticias.length)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors"
                    style={{ border: '1px solid rgba(50,61,110,0.18)', background: 'white', color: '#6B7280' }}
                    aria-label="Noticia siguiente"
                  >
                    →
                  </button>
                </div>
              )}
            </motion.div>

          </div>
        </div>

      ) : (

        /* ── Hero centrado (sin noticias) ── */
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center justify-center relative mb-8">
              <motion.div
                className="relative px-5 py-2 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(50,61,110,0.08)',
                  border: '1px solid rgba(50,61,110,0.18)',
                  boxShadow: '0 4px 24px rgba(50,61,110,0.10)',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              >
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(50,61,110,0.10) 45%, transparent 70%)' }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative text-sm font-semibold" style={{ color: BLUE }}>
                  <GraduationCap className="inline w-4 h-4 mr-1.5 text-yellow-500 shrink-0" />Más de 32 años formando profesionales bilingües en Neiva
                </span>
              </motion.div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.04] tracking-tight mb-6">
              {titleWords.map((w, i) => {
                const isEnglish = w.toLowerCase().includes('ingl');
                const isFrench  = w.toLowerCase().includes('franc');
                return (
                  <motion.span
                    key={`${w}-${i}`}
                    initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                    className="inline-block mr-3"
                    style={{
                      color: isEnglish ? RED : isFrench ? BLUE : '#111827',
                      textShadow: isEnglish ? '0 8px 30px rgba(237,17,24,0.18)' : isFrench ? '0 8px 30px rgba(50,61,110,0.15)' : 'none',
                    }}
                  >
                    {w}
                  </motion.span>
                );
              })}
            </h1>

            <div className="relative max-w-3xl mx-auto mb-8">
              <motion.div
                className="h-[2px] w-full rounded-full opacity-70"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${RED} 35%, rgba(50,61,110,0.7) 65%, transparent 100%)` }}
                animate={shouldReduceMotion ? {} : { opacity: [0.45, 0.75, 0.50] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: '#4B5563' }}
            >
              {hero.subtitle}
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contacto"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${RED} 0%, rgba(237,17,24,0.85) 40%, rgba(255,255,255,0.10) 140%)`,
                  boxShadow: '0 12px 40px rgba(237,17,24,0.22)',
                }}
              >
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-0 opacity-70"
                    style={{ background: 'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.26) 42%, transparent 70%)' }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative">📞 {hero.ctaText}</span>
              </motion.a>

              <motion.a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold overflow-hidden"
                style={{
                  background: 'white',
                  border: `1.5px solid rgba(50,61,110,0.18)`,
                  color: BLUE,
                  boxShadow: '0 8px 32px rgba(50,61,110,0.12)',
                }}
              >
                <svg className="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="relative">{hero.ctaWhatsappText}</span>
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
              style={{ color: '#6B7280' }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                Cursos por niveles • Acompañamiento
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
                Inglés / Francés • Modalidades flexibles
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#9CA3AF' }} />
                Enfoque práctico • Resultados medibles
              </span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
