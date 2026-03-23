'use client';

import { motion } from 'framer-motion';
import type { Stat } from '@/types';

interface TrustBarProps {
  trustItems: string[];
  stats: Stat[];
}

export default function TrustBar({ trustItems, stats }: TrustBarProps) {
  return (
    <>
      {/* Trust bar */}
      <div className="bg-primary/5 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {trustItems.map((item, i) => (
              <span key={i} className="text-sm font-medium text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center p-4"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-light font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
