'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import type { CoursePreview } from '@/types';

interface CoursesPreviewProps {
  courses: CoursePreview[];
}

export default function CoursesPreview({ courses }: CoursesPreviewProps) {
  return (
    <Section id="cursos" className="bg-surface">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Nuestros <span className="text-primary">Cursos</span>
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          Ofrecemos programas de inglés y francés con certificación B1 garantizada del Marco Común Europeo.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className={`h-2 ${course.language === 'ingles' ? 'bg-gradient-to-r from-primary to-primary-light' : 'bg-gradient-to-r from-accent to-cyan-400'}`} />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{course.language === 'ingles' ? '🇺🇸' : '🇫🇷'}</span>
                <div>
                  <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <span className="text-xs font-semibold text-primary-light bg-primary/5 px-2 py-0.5 rounded-full">
                    Niveles {course.levels}
                  </span>
                </div>
              </div>
              <p className="text-text-light text-sm leading-relaxed mb-6">{course.description}</p>
              <a
                href="/cursos"
                className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
              >
                Ver modalidades y horarios
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
