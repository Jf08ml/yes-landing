'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import type { Announcement, AnnouncementsDisplay } from '@/types';

interface HeroProps {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaWhatsappText: string;
  };
  announcements?: Announcement[];
  displayMode?: AnnouncementsDisplay;
  whatsapp: string;
}

const RED = '#ED1118';
const BLUE = '#323D6E';

export default function Hero({ hero, announcements, displayMode = 'ticker', whatsapp }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (!announcements || announcements.length <= 1) return;
    if (displayMode === 'marquee' || displayMode === 'cards' || displayMode === 'header-hybrid') return;
    const id = setInterval(() => {
      setActiveAnnouncement((i) => (i + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(id);
  }, [announcements, displayMode]);

  const waLink = useMemo(() => {
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      'Hola, quiero información sobre los cursos de YES Institute'
    )}`;
  }, [whatsapp]);

  // Animación de palabras (reveal elegante)
  const titleWords = useMemo(() => hero.title.split(' '), [hero.title]);

  const loop = shouldReduceMotion
    ? {}
    : {
      transition: { duration: 10, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' },
    };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Base background (azul) */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          background:
            `radial-gradient(1200px 600px at 20% 10%, ${BLUE} 0%, rgba(0,0,0,0) 60%),` +
            `radial-gradient(900px 600px at 80% 20%, rgba(237,17,24,.22) 0%, rgba(0,0,0,0) 55%),` +
            `linear-gradient(135deg, #0B1024 0%, #070A12 55%, #05060B 100%)`,
        }}
      />

      {/* Animated glow blobs (loop) */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute -z-20 -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-[50px] sm:blur-[90px] opacity-70"
            style={{ background: `radial-gradient(circle at 30% 30%, ${BLUE} 0%, rgba(50,61,110,0) 60%)`, willChange: 'transform' }}
            animate={isMobile ? {} : { x: [0, 60, -10], y: [0, 25, 10], scale: [1, 1.08, 0.98] }}
            transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -z-20 -bottom-48 -right-48 h-[620px] w-[620px] rounded-full blur-[60px] sm:blur-[110px] opacity-70"
            style={{ background: `radial-gradient(circle at 70% 60%, ${RED} 0%, rgba(237,17,24,0) 62%)`, willChange: 'transform' }}
            animate={isMobile ? {} : { x: [0, -50, 15], y: [0, -30, -10], scale: [1, 0.95, 1.06] }}
            transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Moving lines pattern (super subtle, loop) */}
      <div className="absolute inset-0 -z-10 opacity-[0.16]">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black 0%, transparent 62%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 0%, transparent 62%)',
          }}
          animate={shouldReduceMotion || isMobile ? {} : { backgroundPosition: ['0px 0px', '0px 120px'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Light sweep full width */}
      {!shouldReduceMotion && !isMobile && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 -z-10"
          style={{
            width: '100%',
            willChange: 'transform',
            background:
              'linear-gradient(110deg, transparent 35%, rgba(237,17,24,0.15) 50%, transparent 65%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Announcements — multi-mode */}
      {announcements && announcements.length > 0 && displayMode !== 'cards' && displayMode !== 'header-hybrid' && displayMode !== 'hero-split' && (
        <div className="absolute top-0 left-0 right-0 z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">

          {/* ── TICKER HORIZONTAL: desktop 2 noticias visibles, mobile 1 ── */}
          {displayMode === 'marquee' && (
            <div className="h-10 flex items-center">
              <div
                className="relative z-10 flex-shrink-0 flex items-center self-stretch px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-white/15"
                style={{ color: RED, background: 'rgba(237,17,24,0.12)' }}
              >
                Noticias
              </div>
              <div className="flex-1 overflow-hidden h-full flex items-center">
                <div className="animate-marquee">
                  {[...announcements, ...announcements].map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 ml-6" style={{ background: RED }} />
                      {item.url ? (
                        <Link href={item.url} className="text-xs sm:text-sm text-white/85 hover:text-white transition-colors">
                          {item.text}
                        </Link>
                      ) : (
                        <span className="text-xs sm:text-sm text-white/85">{item.text}</span>
                      )}
                      {/* Separador: grande en mobile (≈1 visible), pequeño en desktop (≈2 visibles) */}
                      <span className="inline-block flex-shrink-0 w-[60vw] sm:w-[20vw]" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TICKER-IMAGE: ticker con thumbnail ── */}
          {displayMode === 'ticker-image' && (
            <div className="flex items-center h-14">
              <div
                className="flex-shrink-0 flex items-center self-stretch px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-white/15"
                style={{ color: RED, background: 'rgba(237,17,24,0.12)' }}
              >
                Noticias
              </div>
              <div className="relative flex-1 overflow-hidden h-full flex items-center px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAnnouncement}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="w-full flex items-center gap-3"
                  >
                    {announcements[activeAnnouncement].imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={announcements[activeAnnouncement].imageUrl}
                        alt=""
                        className="flex-shrink-0 h-9 w-9 rounded-lg object-cover border border-white/10"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {announcements[activeAnnouncement].url ? (
                        <Link
                          href={announcements[activeAnnouncement].url!}
                          className="flex items-center gap-2 text-xs sm:text-sm text-white/85 hover:text-white transition-colors group"
                        >
                          <span className="truncate">{announcements[activeAnnouncement].text}</span>
                          <span className="flex-shrink-0 text-white/40 group-hover:text-white/70 transition-colors text-[10px]">→</span>
                        </Link>
                      ) : (
                        <span className="text-xs sm:text-sm text-white/85 truncate block">
                          {announcements[activeAnnouncement].text}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              {announcements.length > 1 && (
                <div className="flex-shrink-0 flex items-center gap-1.5 pr-4">
                  {announcements.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveAnnouncement(i)}
                      aria-label={`Anuncio ${i + 1}`}
                      className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                      style={{
                        width: i === activeAnnouncement ? '16px' : '6px',
                        background: i === activeAnnouncement ? RED : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TICKER: comportamiento original ── */}
          {(displayMode === 'ticker' || !displayMode) && (
            <div className="flex items-center h-9">
              <div
                className="flex-shrink-0 flex items-center self-stretch px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-white/15"
                style={{ color: RED, background: 'rgba(237,17,24,0.12)' }}
              >
                Noticias
              </div>
              <div className="relative flex-1 overflow-hidden h-full flex items-center px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAnnouncement}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="w-full"
                  >
                    {announcements[activeAnnouncement].url ? (
                      <Link
                        href={announcements[activeAnnouncement].url!}
                        className="flex items-center gap-2 text-xs sm:text-sm text-white/85 hover:text-white transition-colors group w-fit max-w-full"
                      >
                        <span className="truncate">{announcements[activeAnnouncement].text}</span>
                        <span className="flex-shrink-0 text-white/40 group-hover:text-white/70 transition-colors text-[10px]">→</span>
                      </Link>
                    ) : (
                      <span className="text-xs sm:text-sm text-white/85 truncate block">
                        {announcements[activeAnnouncement].text}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              {announcements.length > 1 && (
                <div className="flex-shrink-0 flex items-center gap-1.5 pr-4">
                  {announcements.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveAnnouncement(i)}
                      aria-label={`Anuncio ${i + 1}`}
                      className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                      style={{
                        width: i === activeAnnouncement ? '16px' : '6px',
                        background: i === activeAnnouncement ? RED : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── HERO PARTIDO (hero-split) ── */}
      {displayMode === 'hero-split' && announcements && announcements.length > 0 ? (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Columna izquierda: contenido */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center relative mb-8">
                <motion.div
                  className="relative px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                >
                  {!shouldReduceMotion && (
                    <motion.span
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 70%)' }}
                      animate={{ x: ['-120%', '120%'] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative text-white/90 text-sm font-semibold">
                    🎓 Más de 32 años formando profesionales bilingües en Neiva
                  </span>
                </motion.div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black leading-[1.04] tracking-tight mb-6">
                {titleWords.map((w, i) => {
                  const isEnglish = w.toLowerCase().includes('ingl');
                  const isFrench = w.toLowerCase().includes('franc');
                  return (
                    <motion.span
                      key={`${w}-${i}`}
                      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                      className="inline-block mr-3"
                      style={{
                        color: isEnglish ? RED : isFrench ? '#A7B0FF' : 'white',
                        textShadow: isEnglish ? '0 18px 60px rgba(237,17,24,0.35)' : '0 18px 60px rgba(80,120,255,0.25)',
                      }}
                    >
                      {w}
                    </motion.span>
                  );
                })}
              </h1>

              {/* Underline */}
              <div className="relative mb-8">
                <motion.div
                  className="h-[2px] w-full max-w-xs rounded-full opacity-80"
                  style={{ background: `linear-gradient(90deg, ${RED} 0%, rgba(167,176,255,0.95) 60%, transparent 100%)` }}
                  animate={shouldReduceMotion ? {} : { opacity: [0.55, 0.9, 0.6] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/80 max-w-lg mb-10 leading-relaxed"
              >
                {hero.subtitle}
              </motion.p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="/contacto"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${RED} 0%, rgba(237,17,24,0.85) 40%, rgba(255,255,255,0.10) 140%)`,
                    boxShadow: '0 18px 60px rgba(237,17,24,0.25)',
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
                  className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden"
                  style={{ boxShadow: '0 18px 60px rgba(50,61,110,0.28)' }}
                >
                  <svg className="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="relative">{hero.ctaWhatsappText}</span>
                </motion.a>
              </div>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                  Cursos por niveles • Acompañamiento
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#A7B0FF' }} />
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
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: RED, background: 'rgba(237,17,24,0.12)', border: '1px solid rgba(237,17,24,0.2)' }}
                >
                  Noticias
                </span>
                <span className="text-white/35 text-xs">{activeAnnouncement + 1} / {announcements.length}</span>
              </div>

              {/* Card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeAnnouncement}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {announcements[activeAnnouncement].imageUrl && (
                      <div className="relative h-52 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={announcements[activeAnnouncement].imageUrl}
                          alt={announcements[activeAnnouncement].text}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      {announcements[activeAnnouncement].url ? (
                        <Link
                          href={announcements[activeAnnouncement].url!}
                          className="group flex items-start justify-between gap-3 text-white text-base font-semibold hover:text-white/80 transition-colors leading-snug"
                        >
                          <span>{announcements[activeAnnouncement].text}</span>
                          <span className="flex-shrink-0 text-white/40 group-hover:text-white/70 transition-colors mt-0.5">→</span>
                        </Link>
                      ) : (
                        <p className="text-white text-base font-semibold leading-snug">
                          {announcements[activeAnnouncement].text}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {announcements.length > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <button
                    onClick={() => setActiveAnnouncement((activeAnnouncement - 1 + announcements.length) % announcements.length)}
                    className="h-8 w-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white text-sm"
                    aria-label="Noticia anterior"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-2">
                    {announcements.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveAnnouncement(i)}
                        aria-label={`Noticia ${i + 1}`}
                        className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                        style={{
                          width: i === activeAnnouncement ? '20px' : '6px',
                          background: i === activeAnnouncement ? RED : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveAnnouncement((activeAnnouncement + 1) % announcements.length)}
                    className="h-8 w-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white text-sm"
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

        /* ── HERO CENTRADO (todos los demás modos) ── */
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge glass + shimmer */}
            <div className="inline-flex items-center justify-center relative mb-8">
              <motion.div
                className="relative px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              >
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 70%)',
                    }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative text-white/90 text-sm font-semibold">
                  🎓 Más de 32 años formando profesionales bilingües en Neiva
                </span>
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.04] tracking-tight mb-6">
              {titleWords.map((w, i) => {
                const isEnglish = w.toLowerCase().includes('ingl');
                const isFrench = w.toLowerCase().includes('franc');
                return (
                  <motion.span
                    key={`${w}-${i}`}
                    initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                    className="inline-block mr-3"
                    style={{
                      color: isEnglish ? RED : isFrench ? '#A7B0FF' : 'white',
                      textShadow: isEnglish
                        ? '0 18px 60px rgba(237,17,24,0.35)'
                        : '0 18px 60px rgba(80,120,255,0.25)',
                    }}
                  >
                    {w}
                  </motion.span>
                );
              })}
            </h1>

            {/* Underline accent (loop) */}
            <div className="relative max-w-3xl mx-auto mb-8">
              <motion.div
                className="h-[2px] w-full rounded-full opacity-80"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${RED} 35%, rgba(167,176,255,0.95) 65%, transparent 100%)`,
                }}
                animate={shouldReduceMotion ? {} : { opacity: [0.55, 0.9, 0.6] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              {hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Primary (rojo) */}
              <motion.a
                href="/contacto"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${RED} 0%, rgba(237,17,24,0.85) 40%, rgba(255,255,255,0.10) 140%)`,
                  boxShadow: '0 18px 60px rgba(237,17,24,0.25)',
                }}
              >
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-0 opacity-70"
                    style={{
                      background:
                        'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.26) 42%, transparent 70%)',
                    }}
                    animate={{ x: ['-120%', '120%'] }}
                    transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative">📞 {hero.ctaText}</span>
              </motion.a>

              {/* Secondary (glass + azul) */}
              <motion.a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-extrabold text-white border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden"
                style={{
                  boxShadow: '0 18px 60px rgba(50,61,110,0.28)',
                }}
              >
                {!shouldReduceMotion && (
                  <motion.span
                    className="absolute -inset-24 rounded-full opacity-25"
                    style={{ background: `radial-gradient(circle, ${BLUE} 0%, transparent 60%)` }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <svg className="relative w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="relative">{hero.ctaWhatsappText}</span>
              </motion.a>
            </div>

            {/* Tiny trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/65"
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                Cursos por niveles • Acompañamiento
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#A7B0FF' }} />
                Inglés / Francés • Modalidades flexibles
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
                Enfoque práctico • Resultados medibles
              </span>
            </motion.div>
          </motion.div>
        </div>

      )}
    </section>
  );
}
