'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Announcement } from '@/types';

const RED = '#ED1118';

interface AnnouncementsHeaderBarProps {
  items: Announcement[];
}

export default function AnnouncementsHeaderBar({ items }: AnnouncementsHeaderBarProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="sticky top-20 z-40 border-b border-gray-100 bg-white/92 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center h-9 px-2">
        {/* Label */}
        <div
          className="flex-shrink-0 flex items-center self-stretch px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-gray-100"
          style={{ color: RED, background: 'rgba(237,17,24,0.06)' }}
        >
          Noticias
        </div>

        {/* Rotating item */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {items[active].url ? (
                <Link
                  href={items[active].url!}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors group w-fit max-w-full"
                >
                  <span className="truncate">{items[active].text}</span>
                  <span className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors text-[10px]">→</span>
                </Link>
              ) : (
                <span className="text-xs sm:text-sm text-gray-600 truncate block">
                  {items[active].text}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        {items.length > 1 && (
          <div className="flex-shrink-0 flex items-center gap-1.5 pr-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Anuncio ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  width: i === active ? '16px' : '6px',
                  background: i === active ? RED : 'rgba(0,0,0,0.18)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
