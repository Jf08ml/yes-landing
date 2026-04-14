'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mic2, Music } from 'lucide-react';
import Section from '@/components/ui/Section';

interface YESFactorSectionProps {
  preview: {
    title: string;
    description: string;
    ctaText: string;
  };
  backgroundImageDesktop?: string;
  backgroundImageMobile?: string;
}

export default function YESFactorSection({ preview, backgroundImageDesktop, backgroundImageMobile }: YESFactorSectionProps) {
  const hasImage = !!(backgroundImageDesktop || backgroundImageMobile);

  if (hasImage) {
    const desktopSrc = backgroundImageDesktop || backgroundImageMobile!;
    const mobileSrc  = backgroundImageMobile  || backgroundImageDesktop!;

    return (
      <Section className="bg-surface overflow-hidden">
        <Link href="/yes-factor" className="block rounded-3xl overflow-hidden">
          {/* Mobile */}
          <Image
            src={mobileSrc}
            alt="YES Factor"
            width={0}
            height={0}
            sizes="100vw"
            className="md:hidden w-full h-auto block"
          />
          {/* Desktop */}
          <Image
            src={desktopSrc}
            alt="YES Factor"
            width={0}
            height={0}
            sizes="100vw"
            className="hidden md:block w-full h-auto"
          />
        </Link>
      </Section>
    );
  }

  /* ── Fallback sin imagen: degradado + texto ── */
  return (
    <Section className="bg-surface overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block bg-secondary text-surface-dark text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Comunidad YES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            {preview.title}
          </h2>
          <p className="text-blue-100 text-lg sm:text-xl mb-8 leading-relaxed">
            {preview.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/yes-factor"
              className="bg-white text-primary hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-xl"
            >
              {preview.ctaText}
            </Link>
          </div>
        </div>

        <Mic2  className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:block w-16 h-16 text-white opacity-20 rotate-12" />
        <Music className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block w-16 h-16 text-white opacity-20 -rotate-12" />
      </div>
    </Section>
  );
}
