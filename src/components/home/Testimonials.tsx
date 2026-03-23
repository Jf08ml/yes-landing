'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import type { Testimonial } from '@/types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <Section id="testimonios" className="bg-surface">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Lo que dicen nuestros <span className="text-primary">estudiantes</span>
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          Más de 30 mil estudiantes han confiado en YES para aprender idiomas.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <svg key={j} className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-text-light text-sm leading-relaxed mb-6 italic">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-text text-sm">{t.name}</p>
                <p className="text-text-light text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
