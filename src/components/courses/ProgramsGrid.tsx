'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Program } from '@/types';

const LANG_COLORS = {
  ingles: { accent: '#C1121F', light: 'rgba(193,18,31,0.10)', label: 'Inglés', flag: '🇺🇸' },
  frances: { accent: '#1A56DB', light: 'rgba(26,86,219,0.10)', label: 'Francés', flag: '🇫🇷' },
  ambos: { accent: '#6B21A8', light: 'rgba(107,33,168,0.10)', label: 'Ambos', flag: null },
};

type Filter = 'todos' | 'ingles' | 'frances';

function ProgramCard({ program, waLink, index }: { program: Program; waLink: string; index: number }) {
  const colors = LANG_COLORS[program.language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: colors.accent }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: colors.light, color: colors.accent }}
          >
            {colors.flag !== null ? colors.flag : <Globe className="w-3 h-3" />}
            {colors.label}
          </span>
          {program.tag && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {program.tag}
            </span>
          )}
        </div>

        {/* Title & audience */}
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
          {program.title}
        </h3>
        {program.subtitle && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {program.subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* Details */}
        <div className="space-y-2.5 flex-1">
          {program.levels && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Niveles</span>
              <span className="font-semibold text-gray-700">{program.levels}</span>
            </div>
          )}
          {program.duration && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Duración</span>
              <span className="font-semibold text-gray-700">{program.duration}</span>
            </div>
          )}
          {program.modality && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Modalidad</span>
              <span className="font-semibold text-gray-700">{program.modality}</span>
            </div>
          )}
          {program.intensity && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Intensidad</span>
              <span className="font-semibold text-gray-700">{program.intensity}</span>
            </div>
          )}

          {/* Schedules */}
          {program.schedules && program.schedules.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Horarios</p>
              <div className="flex flex-col gap-1">
                {program.schedules.map((s, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
                    style={{ background: colors.light, color: colors.accent }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights (for GEP-style special programs) */}
          {program.highlights && program.highlights.length > 0 && (
            <ul className="space-y-1.5">
              {program.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: colors.accent }} />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Price — solo si showPrice está activo */}
          {program.showPrice && program.price && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Inversión</span>
              <span className="font-bold" style={{ color: colors.accent }}>{program.price}</span>
            </div>
          )}

          {/* Materials — solo si showMaterials está activo */}
          {program.showMaterials && program.materials && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">Material</span>
              <span className="font-semibold text-gray-700">{program.materials}</span>
            </div>
          )}

          {/* Notes */}
          {program.notes && (
            <p className="text-xs text-gray-400 italic">{program.notes}</p>
          )}
        </div>

        {/* CTA */}
        {program.infoUrl && (
          <a
            href={program.infoUrl}
            className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-5 rounded-xl border transition-all hover:bg-gray-50"
            style={{ color: colors.accent, borderColor: `${colors.accent}40` }}
          >
            Ver más información
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-bold py-3 px-5 rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: colors.accent }}
        >
          Consultar disponibilidad
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

export default function ProgramsGrid({ programs, waLink }: { programs: Program[]; waLink: string }) {
  const [filter, setFilter] = useState<Filter>('todos');

  const filtered = programs.filter(p => {
    if (filter === 'todos') return true;
    return p.language === filter || p.language === 'ambos';
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos los programas' },
    { key: 'ingles', label: '🇺🇸 Inglés' },
    { key: 'frances', label: '🇫🇷 Francés' },
  ];

  return (
    <section className="py-14 px-4 bg-[#F4F6F9]">
      <div className="max-w-6xl mx-auto">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-10 flex-wrap justify-center">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
                filter === f.key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-primary/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hay programas disponibles aún.</p>
            <p className="text-gray-300 text-sm mt-1">Contacta con nosotros para más información.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((program, i) => (
                <ProgramCard key={program.id} program={program} waLink={waLink} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
