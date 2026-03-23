'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/ui/Section';
import type { FAQItem } from '@/types';

interface FAQProps {
  faq: FAQItem[];
}

export default function FAQ({ faq }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Preguntas <span className="text-primary">frecuentes</span>
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          Encuentra respuestas a las dudas más comunes sobre nuestros cursos de idiomas en Neiva.
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faq.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-primary/20 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
              aria-expanded={openIndex === i}
            >
              <span className="font-semibold text-text pr-4">{item.question}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-text-light text-sm leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}
