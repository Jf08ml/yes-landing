'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { SocialLink } from '@/types';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/blog', label: 'Blog & Noticias' },
  { href: '/yes-factor', label: 'YES Factor' },
  { href: '/contacto', label: 'Contacto' },
];

const RED   = '#ED1118';
const BLUE  = '#323D6E';

// Brand colors per social platform
const SOCIAL_COLORS: Record<string, string> = {
  facebook:  '#1877F2',
  instagram: '#E1306C',
  tiktok:    '#010101',
  youtube:   '#FF0000',
};

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'facebook':
      return (
        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}

interface HeaderProps {
  paymentsUrl?: string;
  social?: SocialLink[];
}

export default function Header({ paymentsUrl, social = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">

      {/* ── Accent line ── */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${RED} 0%, ${BLUE} 100%)` }}
      />

      {/* ── Main bar ── */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-24'}`}>

            {/* ── Logo ── */}
            <Link href="/" className="relative flex-shrink-0 group">
              {/* Colored strip behind logo */}
              <div
                className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                style={{ background: `linear-gradient(135deg, ${RED}15, ${BLUE}15)` }}
              />
              <Image
                src="/fav.png"
                alt="YES Institute"
                width={90}
                height={90}
                className={`relative transition-all duration-300 ${scrolled ? 'w-[60px] h-[60px]' : 'w-[90px] h-[90px]'}`}
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-[13px] font-bold tracking-[0.08em] uppercase transition-all duration-200 ${
                      active ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {/* Active background pill */}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: `linear-gradient(135deg, ${RED}, ${BLUE})` }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {/* Hover background */}
                    {!active && (
                      <span className="absolute inset-0 rounded-lg bg-gray-100 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── Right cluster ── */}
            <div className="hidden md:flex items-center gap-4">

              {/* Social icons */}
              {social.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {social.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:scale-110 hover:text-white"
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.backgroundColor = SOCIAL_COLORS[s.platform] || BLUE;
                        el.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.backgroundColor = 'transparent';
                        el.style.color = '';
                      }}
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              )}

              {/* Divider */}
              {social.length > 0 && paymentsUrl && (
                <div className="w-px h-5 bg-gray-200" />
              )}

              {/* Pagos en línea */}
              {paymentsUrl && (
                <a
                  href={paymentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-[0.08em] uppercase text-white overflow-hidden group"
                  style={{ background: `linear-gradient(135deg, ${RED}, ${BLUE})` }}
                >
                  {/* Shimmer */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                    }}
                  />
                  <svg className="relative w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="relative">Pagos en línea</span>
                </a>
              )}
            </div>

            {/* ── Mobile toggle ── */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menú"
            >
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 rounded-full bg-gray-800"
                transition={{ duration: 0.22 }}
              />
              <motion.span
                animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                className="block w-5 h-0.5 rounded-full bg-gray-800"
                transition={{ duration: 0.18 }}
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 rounded-full bg-gray-800"
                transition={{ duration: 0.22 }}
              />
            </button>

          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden bg-white border-t border-gray-100 shadow-2xl"
          >
            {/* Nav links */}
            <div className="px-6 pt-4 pb-2">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0"
                  >
                    <span
                      className="text-sm font-bold tracking-[0.08em] uppercase"
                      style={{ color: active ? RED : '#374151' }}
                    >
                      {link.label}
                    </span>
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: RED }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="px-6 pb-6 pt-3 space-y-3">
              {social.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mr-1">
                    Síguenos
                  </span>
                  {social.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all"
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.backgroundColor = SOCIAL_COLORS[s.platform] || BLUE;
                        el.style.color = '#fff';
                        el.style.borderColor = SOCIAL_COLORS[s.platform] || BLUE;
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.backgroundColor = 'transparent';
                        el.style.color = '';
                        el.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              )}

              {paymentsUrl && (
                <a
                  href={paymentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold tracking-wide text-white"
                  style={{ background: `linear-gradient(135deg, ${RED}, ${BLUE})` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pagos en línea
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
