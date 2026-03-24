'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Announcement } from '@/types';

const RED = '#ED1118';

interface AnnouncementsCardsProps {
  items: Announcement[];
}

export default function AnnouncementsCards({ items }: AnnouncementsCardsProps) {
  if (!items.length) return null;

  return (
    <section className="bg-[#070A12] border-b border-white/5 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={{
              color: RED,
              background: 'rgba(237,17,24,0.10)',
              border: '1px solid rgba(237,17,24,0.20)',
            }}
          >
            Noticias
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const content = (
              <>
                {item.imageUrl && (
                  <div className="relative h-36 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.text}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-4 flex items-start justify-between gap-2">
                  <p className="text-sm text-white/85 leading-snug group-hover:text-white transition-colors">
                    {item.text}
                  </p>
                  {item.url && (
                    <span className="flex-shrink-0 text-white/30 group-hover:text-white/60 transition-colors mt-0.5 text-sm">
                      →
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: 'easeOut' }}
                className="group relative rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-colors"
              >
                {item.url ? (
                  <Link href={item.url} className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
