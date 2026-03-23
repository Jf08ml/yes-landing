'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/blog', label: 'Blog' },
  { href: '/yes-factor', label: 'YES Factor' },
  { href: '/contacto', label: 'Contacto' },
];

const RED = '#ED1118';
const BLUE = '#323D6E';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573133973411';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/30'
          : 'bg-white/60 backdrop-blur-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="relative group">
            <div className="relative">
              <Image
                src="/fav.png"
                alt="YES Institute"
                width={60}
                height={60}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className="absolute -bottom-1 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300"
                style={{ background: RED }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-gray-700 font-medium transition-colors duration-300 hover:text-black"
                >
                  {link.label}

                  {/* Animated underline */}
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 -bottom-1 h-[2px]"
                    style={{
                      background: active
                        ? `linear-gradient(90deg, ${RED}, ${BLUE})`
                        : 'transparent',
                    }}
                    initial={false}
                    animate={{
                      width: active ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              );
            })}

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-5 py-2.5 rounded-xl text-white font-semibold overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${RED}, ${BLUE})`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              }}
            >
              <span className="relative z-10">WhatsApp</span>

              {/* subtle shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
                }}
              />
            </a>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
          >
            <motion.div
              animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
              className="w-6 h-6 relative"
            >
              <span className={`absolute h-[2px] w-full bg-black transition-all duration-300 ${isOpen ? 'rotate-90 top-3' : 'top-1'}`} />
              <span className={`absolute h-[2px] w-full bg-black transition-all duration-300 ${isOpen ? 'opacity-0' : 'top-3'}`} />
              <span className={`absolute h-[2px] w-full bg-black transition-all duration-300 ${isOpen ? 'rotate-90 top-3' : 'top-5'}`} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-xl"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-gray-800 hover:text-black"
                >
                  {link.label}
                </Link>
              ))}

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 rounded-xl text-white font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${RED}, ${BLUE})`,
                }}
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
