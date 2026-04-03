'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Section from '@/components/ui/Section';
import { db } from '@/lib/firebase';
import type { TestimonialSubmission } from '@/types';

const ITEMS_PER_PAGE = 3;
const ROTATION_INTERVAL = 8000;

function StarDisplay({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-secondary' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${s} estrella${s > 1 ? 's' : ''}`}
        >
          <svg className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? 'text-secondary' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function TestimonialCard({ name, role, text, rating = 5, index }: { name: string; role: string; text: string; rating?: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <StarDisplay rating={rating} />
      <p className="text-text-light text-sm leading-relaxed mb-6 italic">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-text text-sm">{name}</p>
          <p className="text-text-light text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5 });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al enviar. Intenta de nuevo.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setStatus('error');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-text mb-2">¡Gracias por compartir!</h3>
              <p className="text-text-light text-sm leading-relaxed">
                Tu comentario fue enviado y será revisado pronto.<br />
                Lo publicaremos cuando sea aprobado.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
              >
                Cerrar
              </button>
            </motion.div>
          ) : (
            <motion.div key="form">
              <div className="px-7 pt-7 pb-2">
                <h3 className="text-lg font-bold text-text mb-1">Comparte tu experiencia</h3>
                <p className="text-text-light text-sm">Tu comentario aparecerá aquí tras revisión.</p>
              </div>
              <form onSubmit={handleSubmit} className="px-7 pb-7 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-light mb-2">Tu calificación *</label>
                  <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tu nombre *"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    required
                    maxLength={80}
                  />
                  <input
                    type="text"
                    placeholder="Ej: Estudiante de Inglés *"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                    required
                    maxLength={80}
                  />
                </div>
                <textarea
                  placeholder="Cuéntanos tu experiencia en YES... *"
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={4}
                  required
                  minLength={20}
                  maxLength={400}
                />
                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar comentario'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [modalOpen, setModalOpen] = useState(false);
  const [allTestimonials, setAllTestimonials] = useState<TestimonialSubmission[]>([]);
  const [displayed, setDisplayed] = useState<TestimonialSubmission[]>([]);
  const rotationIndex = useRef(0);

  useEffect(() => {
    const load = async () => {
      if (!db) return;
      try {
        const snap = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as TestimonialSubmission))
          .filter(t => t.approved === true);
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        setAllTestimonials(shuffled);
        setDisplayed(shuffled.slice(0, ITEMS_PER_PAGE));
      } catch {
        // sin testimonios aprobados aún
      }
    };
    load();
  }, []);

  // Auto-rotate when there are more than ITEMS_PER_PAGE
  useEffect(() => {
    if (allTestimonials.length <= ITEMS_PER_PAGE) return;

    const interval = setInterval(() => {
      const next = (rotationIndex.current + ITEMS_PER_PAGE) % allTestimonials.length;
      rotationIndex.current = next;
      const batch = allTestimonials.slice(next, next + ITEMS_PER_PAGE);
      setDisplayed(
        batch.length < ITEMS_PER_PAGE
          ? [...batch, ...allTestimonials.slice(0, ITEMS_PER_PAGE - batch.length)]
          : batch
      );
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [allTestimonials]);

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
        {displayed.length > 0 ? (
          displayed.map((t, i) => (
            <TestimonialCard
              key={`${t.id}-${i}`}
              name={t.name}
              role={t.role}
              text={t.text}
              rating={t.rating ?? 5}
              index={i}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-text-light">Cargando testimonios...</p>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-10 text-center"
      >
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2.5 border border-primary/30 hover:border-primary bg-white hover:bg-primary/5 text-primary font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM8 5v3m0 2.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          ¿Estudiaste en YES? Comparte tu experiencia
        </button>
      </motion.div>

      <AnimatePresence>
        {modalOpen && <TestimonialModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </Section>
  );
}
