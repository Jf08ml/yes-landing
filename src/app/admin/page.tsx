/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import StorageMonitor from '@/components/admin/StorageMonitor';
import type {
  HomeContent,
  CoursesContent,
  Program,
  ContactContent,
  YESFactorContent,
  BlogPost,
  BlogContent,
  TestimonialSubmission,
} from '@/types';
import {
  mockHome,
  mockCourses,
  mockContact,
  mockYESFactor,
  mockBlogPosts,
  mockBlogContent
} from '@/lib/mockData';

type TabName = 'home' | 'courses' | 'contact' | 'yesFactor' | 'blog' | 'testimonials' | 'storage';

async function triggerRevalidate(slugs?: string[]): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? '',
      },
      body: JSON.stringify({ slugs: slugs ?? [] }),
    });
  } catch {
    // revalidación best-effort, no bloquea el flujo
  }
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Content states
  const [home, setHome] = useState<HomeContent | null>(null);
  const [courses, setCourses] = useState<CoursesContent | null>(null);
  const [contact, setContact] = useState<ContactContent | null>(null);
  const [yesFactor, setYesFactor] = useState<YESFactorContent | null>(null);
  const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [testimonialSubmissions, setTestimonialSubmissions] = useState<TestimonialSubmission[]>([]);
  const [storageUsageRatio, setStorageUsageRatio] = useState<number>(-1); // -1 = not loaded yet
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // activeModal values: 'home-seo' | 'home-hero' | 'home-stats' | 'home-trustbar' | 'home-ctafinal'
  //   | 'home-yesfactorpreview' | 'home-features' | 'home-testimonials' | 'home-faq' | 'home-coursespreview'
  //   | 'yf-info' | 'yf-winner-{idx}' | 'yf-newcat'
  //   | 'blog-content' | 'blog-{postId}'
  //   | 'contact-info' | 'contact-social'
  //   | 'courses-meta' | 'prog-{progId}'
  //   | 'testimonial-{id}'
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loadContent = useCallback(async () => {
    if (!db) return;
    try {
      const [homeSnap, coursesSnap, programsSnap, contactSnap, yesFactorSnap, blogContentSnap, blogPostsSnap, testimonialsSnap] = await Promise.all([
        getDoc(doc(db, 'siteConfig', 'home')),
        getDoc(doc(db, 'siteConfig', 'courses')),
        getDoc(doc(db, 'siteConfig', 'programs')),
        getDoc(doc(db, 'siteConfig', 'contact')),
        getDoc(doc(db, 'siteConfig', 'yesFactor')),
        getDoc(doc(db, 'siteConfig', 'blogContent')),
        getDocs(collection(db, 'blogPosts')),
        getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
      ]);
      if (homeSnap.exists()) setHome({ ...mockHome, ...homeSnap.data() } as HomeContent);
      if (coursesSnap.exists()) setCourses(coursesSnap.data() as CoursesContent);
      if (programsSnap.exists()) setPrograms((programsSnap.data().items ?? []) as Program[]);
      if (contactSnap.exists()) setContact({ ...mockContact, ...contactSnap.data() } as ContactContent);
      if (yesFactorSnap.exists()) setYesFactor(yesFactorSnap.data() as YESFactorContent);
      if (blogContentSnap.exists()) setBlogContent(blogContentSnap.data() as BlogContent);
      setBlogPosts(blogPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      setTestimonialSubmissions(testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() } as TestimonialSubmission)));
    } catch (err) {
      console.error('Error loading content:', err);
    }
  }, []);

  useEffect(() => {
    if (user) loadContent();
  }, [user, loadContent]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setLoginError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const updates: Promise<void>[] = [];
      if (home) updates.push(updateDoc(doc(db, 'siteConfig', 'home'), { ...home }));
      if (courses) updates.push(updateDoc(doc(db, 'siteConfig', 'courses'), { ...courses }));
      updates.push(setDoc(doc(db, 'siteConfig', 'programs'), { items: programs }));
      if (contact) updates.push(updateDoc(doc(db, 'siteConfig', 'contact'), { ...contact }));
      if (yesFactor) updates.push(updateDoc(doc(db, 'siteConfig', 'yesFactor'), { ...yesFactor }));
      if (blogContent) updates.push(updateDoc(doc(db, 'siteConfig', 'blogContent'), { ...blogContent }));
      await Promise.all(updates);
      await triggerRevalidate();
      setSaveMsg('✅ Cambios guardados y sitio actualizado.');
    } catch (err) {
      console.error('Save error:', err);
      setSaveMsg('❌ Error al guardar. Verifica permisos de Firebase.');
    }
    setSaving(false);
  };

  const handleSeed = async () => {
    if (!db || !confirm('¿Estás seguro de que quieres inicializar la base de datos con los datos de prueba? Esto sobrescribirá cualquier cambio existente.')) return;
    setSeeding(true);
    setSaveMsg('');
    try {
      await Promise.all([
        setDoc(doc(db!, 'siteConfig', 'home'), mockHome),
        setDoc(doc(db!, 'siteConfig', 'courses'), mockCourses),
        setDoc(doc(db!, 'siteConfig', 'contact'), mockContact),
        setDoc(doc(db!, 'siteConfig', 'yesFactor'), mockYESFactor),
        setDoc(doc(db!, 'siteConfig', 'blogContent'), mockBlogContent),
        ...mockBlogPosts.map(p => setDoc(doc(db!, 'blogPosts', p.id), p)),
      ]);
      setSaveMsg('✅ Base de datos inicializada. Recargando...');
      setTimeout(() => {
        loadContent();
        setSaveMsg('');
      }, 2000);
    } catch (err) {
      console.error('Seed error:', err);
      setSaveMsg('❌ Error al inicializar la base de datos.');
    }
    setSeeding(false);
  };

  // ── No Firebase ──
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-8">
        <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg text-center">
          <h1 className="text-2xl font-bold text-text mb-4">Admin — YES Institute</h1>
          <p className="text-text-light">
            Firebase no está configurado. Agrega las variables de entorno de Firebase para habilitar el panel de administración.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-text-light">Cargando...</div>
      </div>
    );
  }

  // ── Login ──
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg">
          <div className="text-center mb-6">
            <Image 
              src="/fav.png" 
              alt="YES Institute Logo" 
              width={48} 
              height={48} 
              className="mx-auto mb-2 w-12 h-12 object-contain"
            />
            <h1 className="text-xl font-bold text-text">Panel de Administración</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              required
            />
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Editor ──
  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/fav.png" 
              alt="YES Institute Logo" 
              width={24} 
              height={24} 
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-semibold text-text">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-light">{user.email}</span>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-text-light px-2 py-1 rounded transition-colors"
              title="Cargar datos de prueba iniciales"
            >
              {seeding ? 'Sembrando...' : '🌱 Sembrar datos'}
            </button>
            <button
              onClick={() => signOut(auth!)}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 overflow-x-auto">
          {(['home', 'courses', 'blog', 'yesFactor', 'contact', 'testimonials', 'storage'] as TabName[]).map((tab) => {
            const labels: Record<TabName, string> = {
              home: 'Home', courses: 'Cursos', blog: 'Blog',
              contact: 'Contacto', yesFactor: 'YES Factor', testimonials: 'Testimonios',
              storage: '🗄️ Storage',
            };
            const pending = tab === 'testimonials'
              ? testimonialSubmissions.filter(t => !t.approved).length
              : 0;
            const storageWarn = tab === 'storage' && storageUsageRatio >= 0.80;
            const storageCrit = tab === 'storage' && storageUsageRatio >= 0.95;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? storageCrit ? 'bg-red-500 text-white'
                    : storageWarn ? 'bg-amber-500 text-white'
                    : 'bg-primary text-white'
                    : storageCrit ? 'text-red-600 bg-red-50 hover:bg-red-100 ring-1 ring-red-300'
                    : storageWarn ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300'
                    : 'text-text-light hover:bg-gray-50'
                }`}
              >
                {labels[tab]}
                {pending > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pending}
                  </span>
                )}
                {storageWarn && activeTab !== 'storage' && (
                  <span className={`absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${storageCrit ? 'bg-red-500' : 'bg-amber-500'}`}>
                    !
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── HOME ── */}
        {activeTab === 'home' && home && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectionCard title="SEO" icon="🔍" desc={home.seo.title} onEdit={() => setActiveModal('home-seo')} />
            <SectionCard title="Hero" icon="🎯" desc={home.hero.title} onEdit={() => setActiveModal('home-hero')} />
            <SectionCard title="Stats" icon="📊" badge={`${home.stats.length}`} desc={home.stats.map(s => `${s.value} ${s.label}`).join(' · ')} onEdit={() => setActiveModal('home-stats')} />
            <SectionCard title="Trust Bar" icon="✅" badge={`${home.trustBar.length}`} desc={home.trustBar.join(' · ')} onEdit={() => setActiveModal('home-trustbar')} />
            <SectionCard title="CTA Final" icon="📣" desc={home.ctaFinal.title} onEdit={() => setActiveModal('home-ctafinal')} />
            <SectionCard title="YES Factor preview" icon="⭐" desc={home.yesFactorPreview.title} onEdit={() => setActiveModal('home-yesfactorpreview')} />
            <SectionCard title="Features" icon="🧩" badge={`${home.features.length}`} desc={home.features.map(f => f.title).join(', ')} onEdit={() => setActiveModal('home-features')} />
            <SectionCard title="Cursos Preview" icon="🌐" badge={`${home.coursesPreview.length}`} desc={home.coursesPreview.map(c => c.title).join(' · ')} onEdit={() => setActiveModal('home-coursespreview')} />
            <SectionCard title="FAQ" icon="❓" badge={`${home.faq.length}`} desc={home.faq.map(f => f.question).slice(0,2).join(' · ')} onEdit={() => setActiveModal('home-faq')} />
          </div>

          {/* Modal SEO */}
          {activeModal === 'home-seo' && (
            <Modal title="SEO — Metadatos de la página" onClose={closeModal}>
              <Field label="Título SEO" value={home.seo.title} onChange={(v) => setHome({ ...home, seo: { ...home.seo, title: v } })} />
              <Field label="Descripción SEO" value={home.seo.description} onChange={(v) => setHome({ ...home, seo: { ...home.seo, description: v } })} textarea />
            </Modal>
          )}

          {/* Modal Hero */}
          {activeModal === 'home-hero' && (
            <Modal title="Hero" onClose={closeModal}>
              <Field label="Título" value={home.hero.title} onChange={(v) => setHome({ ...home, hero: { ...home.hero, title: v } })} />
              <Field label="Subtítulo" value={home.hero.subtitle} onChange={(v) => setHome({ ...home, hero: { ...home.hero, subtitle: v } })} textarea />
              <Field label="CTA texto" value={home.hero.ctaText} onChange={(v) => setHome({ ...home, hero: { ...home.hero, ctaText: v } })} />
              <Field label="CTA WhatsApp texto" value={home.hero.ctaWhatsappText} onChange={(v) => setHome({ ...home, hero: { ...home.hero, ctaWhatsappText: v } })} />
            </Modal>
          )}

          {/* Modal Stats */}
          {activeModal === 'home-stats' && (
            <Modal title="Stats" onClose={closeModal} size="sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-bold text-text-light uppercase tracking-wider">Valor</th>
                  <th className="text-left pb-2 text-xs font-bold text-text-light uppercase tracking-wider px-2">Etiqueta</th>
                  <th className="w-8"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {home.stats.map((s, i) => (
                    <tr key={i} className="group">
                      <td className="py-1.5 pr-2">
                        <input value={s.value} onChange={(e) => { const stats = [...home.stats]; stats[i] = { ...s, value: e.target.value }; setHome({ ...home, stats }); }}
                          className="w-full px-2 py-1 rounded border border-gray-200 focus:border-primary outline-none text-sm font-medium" placeholder="32+" />
                      </td>
                      <td className="py-1.5 px-2">
                        <input value={s.label} onChange={(e) => { const stats = [...home.stats]; stats[i] = { ...s, label: e.target.value }; setHome({ ...home, stats }); }}
                          className="w-full px-2 py-1 rounded border border-gray-200 focus:border-primary outline-none text-sm text-text-light" placeholder="Años" />
                      </td>
                      <td className="py-1.5 text-center">
                        <button onClick={() => setHome({ ...home, stats: home.stats.filter((_, j) => j !== i) })} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setHome({ ...home, stats: [...home.stats, { value: '', label: '' }] })} className="text-primary text-sm font-medium hover:underline">+ Agregar stat</button>
            </Modal>
          )}

          {/* Modal Trust Bar */}
          {activeModal === 'home-trustbar' && (
            <Modal title="Trust Bar" onClose={closeModal} size="sm">
              <p className="text-xs text-text-light">Píldoras de confianza bajo el hero.</p>
              <div className="space-y-2">
                {home.trustBar.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center group">
                    <input type="text" value={item}
                      onChange={(e) => { const trustBar = [...home.trustBar]; trustBar[i] = e.target.value; setHome({ ...home, trustBar }); }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" />
                    <button onClick={() => setHome({ ...home, trustBar: home.trustBar.filter((_, j) => j !== i) })}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setHome({ ...home, trustBar: [...home.trustBar, ''] })} className="text-primary text-sm font-medium hover:underline">+ Agregar ítem</button>
            </Modal>
          )}

          {/* Modal CTA Final */}
          {activeModal === 'home-ctafinal' && (
            <Modal title="CTA Final" onClose={closeModal}>
              <Field label="Título" value={home.ctaFinal.title} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, title: v } })} />
              <Field label="Subtítulo" value={home.ctaFinal.subtitle} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, subtitle: v } })} textarea />
              <Field label="Texto del botón" value={home.ctaFinal.ctaText} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, ctaText: v } })} />
            </Modal>
          )}

          {/* Modal YES Factor preview */}
          {activeModal === 'home-yesfactorpreview' && (
            <Modal title="YES Factor — Preview (Home)" onClose={closeModal}>
              <Field label="Título" value={home.yesFactorPreview.title} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, title: v } })} />
              <Field label="Descripción" value={home.yesFactorPreview.description} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, description: v } })} textarea />
              <Field label="Texto botón" value={home.yesFactorPreview.ctaText} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, ctaText: v } })} />
            </Modal>
          )}

          {/* Modal Features */}
          {activeModal === 'home-features' && (
            <Modal title={`Features (${home.features.length})`} onClose={closeModal} size="lg">
              <div className="space-y-4">
                {home.features.map((f, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => setHome({ ...home, features: home.features.filter((_, j) => j !== i) })}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                    <div className="grid grid-cols-4 gap-3 pr-6">
                      <Field label="Ícono" value={f.icon} onChange={(v) => { const features = [...home.features]; features[i] = { ...f, icon: v }; setHome({ ...home, features }); }} />
                      <div className="col-span-3"><Field label="Título" value={f.title} onChange={(v) => { const features = [...home.features]; features[i] = { ...f, title: v }; setHome({ ...home, features }); }} /></div>
                    </div>
                    <Field label="Descripción" value={f.description} onChange={(v) => { const features = [...home.features]; features[i] = { ...f, description: v }; setHome({ ...home, features }); }} textarea />
                  </div>
                ))}
              </div>
              <button onClick={() => setHome({ ...home, features: [...home.features, { icon: '⭐', title: '', description: '' }] })}
                className="text-primary text-sm font-medium hover:underline">+ Agregar feature</button>
            </Modal>
          )}

          {/* Modal FAQ */}
          {activeModal === 'home-faq' && (
            <Modal title={`FAQ (${home.faq.length})`} onClose={closeModal} size="lg">
              <div className="space-y-4">
                {home.faq.map((f, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => setHome({ ...home, faq: home.faq.filter((_, j) => j !== i) })}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                    <div className="pr-6"><Field label="Pregunta" value={f.question} onChange={(v) => { const faq = [...home.faq]; faq[i] = { ...f, question: v }; setHome({ ...home, faq }); }} /></div>
                    <Field label="Respuesta" value={f.answer} onChange={(v) => { const faq = [...home.faq]; faq[i] = { ...f, answer: v }; setHome({ ...home, faq }); }} textarea />
                  </div>
                ))}
              </div>
              <button onClick={() => setHome({ ...home, faq: [...home.faq, { question: '', answer: '' }] })}
                className="text-primary text-sm font-medium hover:underline">+ Agregar FAQ</button>
            </Modal>
          )}

          {/* Modal Cursos Preview */}
          {activeModal === 'home-coursespreview' && (
            <Modal title="Cursos Preview" onClose={closeModal} size="lg">
              <p className="text-xs text-text-light font-semibold uppercase tracking-wider mb-3">Encabezado de sección</p>
              <Field label="Etiqueta superior" value={home.coursesPreviewSection.sectionLabel}
                onChange={(v) => setHome({ ...home, coursesPreviewSection: { ...home.coursesPreviewSection, sectionLabel: v } })} />
              <Field label="Titular línea 1 (texto claro)" value={home.coursesPreviewSection.heading1}
                onChange={(v) => setHome({ ...home, coursesPreviewSection: { ...home.coursesPreviewSection, heading1: v } })} />
              <Field label="Titular línea 2 (texto rojo)" value={home.coursesPreviewSection.heading2}
                onChange={(v) => setHome({ ...home, coursesPreviewSection: { ...home.coursesPreviewSection, heading2: v } })} />
              <Field label="Subtítulo (usa \\n para salto de línea)" value={home.coursesPreviewSection.subheading}
                onChange={(v) => setHome({ ...home, coursesPreviewSection: { ...home.coursesPreviewSection, subheading: v } })} textarea />

              <div className="border-t border-gray-100 my-4" />
              <p className="text-xs text-text-light font-semibold uppercase tracking-wider mb-3">Tarjetas de idioma</p>
              <div className="space-y-4">
                {home.coursesPreview.map((c, i) => (
                  <div key={c.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-text-light uppercase tracking-wider">{c.id === 'ingles' ? '🇺🇸 Inglés' : '🇫🇷 Francés'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Título" value={c.title}
                        onChange={(v) => { const cp = [...home.coursesPreview]; cp[i] = { ...c, title: v }; setHome({ ...home, coursesPreview: cp }); }} />
                      <Field label="Niveles" value={c.levels}
                        onChange={(v) => { const cp = [...home.coursesPreview]; cp[i] = { ...c, levels: v }; setHome({ ...home, coursesPreview: cp }); }} />
                    </div>
                    <Field label="Tagline (texto en color acento)" value={c.tagline}
                      onChange={(v) => { const cp = [...home.coursesPreview]; cp[i] = { ...c, tagline: v }; setHome({ ...home, coursesPreview: cp }); }} />
                    <Field label="Descripción" value={c.description}
                      onChange={(v) => { const cp = [...home.coursesPreview]; cp[i] = { ...c, description: v }; setHome({ ...home, coursesPreview: cp }); }} textarea />
                  </div>
                ))}
              </div>
            </Modal>
          )}
          </>
        )}


        {/* ── COURSES ── */}
        {activeTab === 'courses' && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {courses && (
              <SectionCard title="Texto de la página" icon="📄" desc={courses.pageTitle} onEdit={() => setActiveModal('courses-meta')} />
            )}
          </div>

          <ProgramsEditor programs={programs} onChange={setPrograms} onEditModal={(id) => setActiveModal(`prog-${id}`)} activeModal={activeModal} closeModal={closeModal} />

          {activeModal === 'courses-meta' && courses && (
            <Modal title="Página de Cursos — Metadatos" onClose={closeModal}>
              <Field label="Título principal" value={courses.pageTitle} onChange={(v) => setCourses({ ...courses, pageTitle: v })} />
              <Field label="Descripción" value={courses.pageDescription} onChange={(v) => setCourses({ ...courses, pageDescription: v })} textarea />
              <Field label="Título SEO" value={courses.seo.title} onChange={(v) => setCourses({ ...courses, seo: { ...courses.seo, title: v } })} />
              <Field label="Descripción SEO" value={courses.seo.description} onChange={(v) => setCourses({ ...courses, seo: { ...courses.seo, description: v } })} textarea />
            </Modal>
          )}
          </>
        )}

        {/* ── CONTACT ── */}
        {activeTab === 'contact' && contact && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionCard title="Datos de contacto" icon="📞" desc={`${contact.phone} · ${contact.email}`} onEdit={() => setActiveModal('contact-info')} />
            <SectionCard title="Redes sociales" icon="📱" badge={`${contact.social.length}`} desc={contact.social.map(s => s.label).join(' · ')} onEdit={() => setActiveModal('contact-social')} />
          </div>

          {activeModal === 'contact-info' && (
            <Modal title="Datos de contacto" onClose={closeModal} size="md">
              <Field label="WhatsApp" value={contact.whatsapp} onChange={(v) => setContact({ ...contact, whatsapp: v })} />
              <Field label="URL Pagos en línea" value={contact.paymentsUrl || ''} onChange={(v) => setContact({ ...contact, paymentsUrl: v })} />
              <Field label="Teléfono" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
              <Field label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
              <Field label="Dirección" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} />
              <Field label="Ciudad" value={contact.city} onChange={(v) => setContact({ ...contact, city: v })} />
              <Field label="Región" value={contact.region} onChange={(v) => setContact({ ...contact, region: v })} />
              <Field label="Link a Google Maps" value={contact.mapLink} onChange={(v) => setContact({ ...contact, mapLink: v })} />
              <Field label="Embed mapa (URL iframe)" value={contact.mapEmbed || ''} onChange={(v) => setContact({ ...contact, mapEmbed: v })} />
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Texto del footer</p>
                <Field label="Descripción (footer)" value={contact.footerDescription || ''} onChange={(v) => setContact({ ...contact, footerDescription: v })} textarea />
                <Field label="Licencia (footer)" value={contact.footerLicense || ''} onChange={(v) => setContact({ ...contact, footerLicense: v })} />
              </div>
            </Modal>
          )}

          {activeModal === 'contact-social' && (
            <Modal title="Redes sociales" onClose={closeModal} size="md">
              <div className="space-y-4">
                {contact.social.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => setContact({ ...contact, social: contact.social.filter((_, idx) => idx !== i) })}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                    <div className="pr-6">
                      <label className="block text-xs font-medium text-text-light mb-1">Plataforma</label>
                      <select value={s.platform}
                        onChange={(e) => {
                          const lbls: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
                          const social = [...contact.social]; social[i] = { ...s, platform: e.target.value, label: lbls[e.target.value] || e.target.value };
                          setContact({ ...contact, social });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white">
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                    <Field label="URL" value={s.url} onChange={(v) => { const social = [...contact.social]; social[i] = { ...s, url: v }; setContact({ ...contact, social }); }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setContact({ ...contact, social: [...contact.social, { platform: 'instagram', label: 'Instagram', url: '' }] })}
                className="text-primary text-sm font-medium hover:underline">+ Añadir red social</button>
            </Modal>
          )}
          </>
        )}

        {/* ── YES FACTOR ── */}
        {activeTab === 'yesFactor' && yesFactor && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <SectionCard title="Información general" icon="⭐"
              desc={`${yesFactor.title} · Inscripciones: ${yesFactor.registrationStatus === 'open' ? 'Abiertas' : 'Cerradas'}`}
              onEdit={() => setActiveModal('yf-info')} />
            <SectionCard title="Ganadores" icon="🏆" badge={`${yesFactor.winners.length}`}
              desc={Array.from(new Set(yesFactor.winners.map(w => w.category).filter(Boolean))).join(' · ')}
              onEdit={() => setActiveModal('yf-winners')} />
          </div>

          {/* Modal info general */}
          {activeModal === 'yf-info' && (
            <Modal title="YES Factor — Información general" onClose={closeModal} size="lg">
              {/* Título y descripción */}
              <Field label="Título del evento" value={yesFactor.title} onChange={(v) => setYesFactor({ ...yesFactor, title: v })} />
              <Field label="Descripción" value={yesFactor.description} onChange={(v) => setYesFactor({ ...yesFactor, description: v })} textarea />

              {/* Separador — Imágenes */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Imagen de fondo (home + página YES Factor)</p>
                <p className="text-xs text-text-light mb-4 leading-relaxed">
                  Si se configura una imagen, reemplaza el degradado en ambas vistas. La imagen se muestra completa sin recortes.<br />
                  <span className="font-semibold text-gray-500">Desktop:</span> proporción 16:5 recomendada — ej. <span className="font-mono">1200 × 375 px</span> ·{' '}
                  <span className="font-semibold text-gray-500">Mobile:</span> proporción 4:3 o 1:1 — ej. <span className="font-mono">600 × 450 px</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600">🖥 Desktop <span className="font-normal text-gray-400">(≥ 768 px) — 1200 × 375 px</span></label>
                    <ImageUploader
                      value={yesFactor.backgroundImageDesktop || ''}
                      onChange={(url) => setYesFactor({ ...yesFactor, backgroundImageDesktop: url })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600">📱 Mobile <span className="font-normal text-gray-400">(&lt; 768 px) — 600 × 450 px</span></label>
                    <ImageUploader
                      value={yesFactor.backgroundImageMobile || ''}
                      onChange={(url) => setYesFactor({ ...yesFactor, backgroundImageMobile: url })}
                    />
                  </div>
                </div>
              </div>

              {/* Separador — Inscripciones */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Inscripciones</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-text-light">Estado</label>
                    <select value={yesFactor.registrationStatus}
                      onChange={(e) => setYesFactor({ ...yesFactor, registrationStatus: e.target.value as 'open' | 'closed' })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm bg-white">
                      <option value="open">✅ Abiertas</option>
                      <option value="closed">🔒 Cerradas</option>
                    </select>
                  </div>
                  <Field label="URL formulario de inscripción" value={yesFactor.registrationUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, registrationUrl: v })} />
                </div>
              </div>

              {/* Separador — Recursos */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Recursos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploader label="Video del evento" type="video" storagePath="yes-factor-videos"
                    value={yesFactor.videoUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, videoUrl: v })} />
                  <ImageUploader label="Reglamento (PDF)" type="document" storagePath="yes-factor-docs"
                    value={yesFactor.rulesUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, rulesUrl: v })} />
                </div>
              </div>
            </Modal>
          )}

          {/* Modal ganadores — tabla por categoría */}
          {activeModal === 'yf-winners' && (() => {
            const categories = Array.from(new Set(yesFactor.winners.map(w => w.category).filter(Boolean)));
            const uncategorized = yesFactor.winners.filter(w => !w.category);
            const allGroups: { cat: string; indices: number[] }[] = [
              ...categories.map(cat => ({ cat, indices: yesFactor.winners.map((w, i) => w.category === cat ? i : -1).filter(i => i !== -1) })),
              ...(uncategorized.length > 0 ? [{ cat: '', indices: yesFactor.winners.map((w, i) => !w.category ? i : -1).filter(i => i !== -1) }] : []),
            ];
            return (
              <Modal title={`Ganadores (${yesFactor.winners.length})`} onClose={closeModal} size="xl">
                <div className="space-y-6">
                  {allGroups.map(({ cat, indices }) => (
                    <div key={cat || '__none__'} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between bg-primary/5 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-black uppercase tracking-widest text-primary">{cat || 'Sin categoría'}</span>
                        <button onClick={() => setYesFactor({ ...yesFactor, winners: [...yesFactor.winners, { name: '', category: cat, place: '' }] })}
                          className="text-primary text-xs font-medium hover:underline">+ Ganador</button>
                      </div>
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-3 py-2 text-xs font-bold text-text-light uppercase tracking-wider w-12">Foto</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-text-light uppercase tracking-wider">Nombre</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-text-light uppercase tracking-wider w-28 hidden md:table-cell">Puesto</th>
                          <th className="text-left px-3 py-2 text-xs font-bold text-text-light uppercase tracking-wider w-16 hidden md:table-cell">Año</th>
                          <th className="px-3 py-2 w-20"></th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {indices.map((i) => {
                            const w = yesFactor.winners[i];
                            return (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2">
                                  {w.image
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={w.image} alt={w.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                    : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">🏆</div>}
                                </td>
                                <td className="px-3 py-2">
                                  <p className="font-medium text-text text-sm">{w.name || <span className="text-gray-300 italic text-xs">Sin nombre</span>}</p>
                                  {w.videoUrl && <span className="text-[10px] text-red-500 font-semibold">▶ Video</span>}
                                </td>
                                <td className="px-3 py-2 text-xs text-text-light hidden md:table-cell">{w.place}</td>
                                <td className="px-3 py-2 text-xs text-text-light hidden md:table-cell">{w.year}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1 justify-end">
                                    <button onClick={() => setActiveModal(`yf-winner-${i}`)}
                                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-50 text-primary hover:bg-indigo-100 transition-colors">Editar</button>
                                    <button onClick={() => setYesFactor({ ...yesFactor, winners: yesFactor.winners.filter((_, j) => j !== i) })}
                                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">✕</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <button
                    onClick={() => { const newCat = prompt('Nombre de la nueva categoría (ej: YES FACTOR KIDS):'); if (!newCat?.trim()) return; setYesFactor({ ...yesFactor, winners: [...yesFactor.winners, { name: '', category: newCat.trim(), place: '' }] }); }}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                    + Nueva categoría
                  </button>
                </div>
              </Modal>
            );
          })()}

          {/* Modal editar ganador individual */}
          {activeModal?.startsWith('yf-winner-') && (() => {
            const idx = parseInt(activeModal.replace('yf-winner-', ''));
            const w = yesFactor.winners[idx];
            if (!w) return null;
            return (
              <Modal title={`Editar ganador — ${w.name || 'Nuevo'}`} onClose={() => setActiveModal('yf-winners')} size="md">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre" value={w.name} onChange={(v) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, name: v }; setYesFactor({ ...yesFactor, winners }); }} />
                  <Field label="Categoría" value={w.category} onChange={(v) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, category: v }; setYesFactor({ ...yesFactor, winners }); }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Puesto (ej: 1st Place)" value={w.place} onChange={(v) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, place: v }; setYesFactor({ ...yesFactor, winners }); }} />
                  <Field label="Año (opcional)" value={w.year || ''} onChange={(v) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, year: v }; setYesFactor({ ...yesFactor, winners }); }} />
                </div>
                <Field label="URL video (opcional)" value={w.videoUrl || ''} onChange={(v) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, videoUrl: v }; setYesFactor({ ...yesFactor, winners }); }} />
                <ImageUploader label="Foto del ganador" value={w.image || ''}
                  onChange={(url) => { const winners = [...yesFactor.winners]; winners[idx] = { ...w, image: url }; setYesFactor({ ...yesFactor, winners }); }}
                  storagePath="yes-factor-winners" recommendedSize="400 × 400 px (1:1)" />
                <div className="flex justify-end pt-2">
                  <button onClick={() => setActiveModal('yf-winners')} className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-primary-dark transition-colors">← Volver a ganadores</button>
                </div>
              </Modal>
            );
          })()}
          </>
        )}

        {/* ── BLOG ── */}
        {activeTab === 'blog' && blogContent && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <SectionCard title="Metadatos de la página" icon="📄" desc={blogContent.title} onEdit={() => setActiveModal('blog-content')} />
          </div>

          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-bold text-text uppercase tracking-wider text-sm">
              Entradas ({blogPosts.length})
              <span className="ml-2 text-text-light font-normal normal-case tracking-normal">
                — {blogPosts.filter(p => p.type === 'noticia').length} noticias · {blogPosts.filter(p => p.type === 'blog').length} blogs
              </span>
            </h3>
            <div className="flex gap-2">
              <button onClick={async () => {
                if (!db) return;
                const newPost: BlogPost = { id: Date.now().toString(), slug: `nueva-noticia-${Date.now()}`, title: 'Nueva Noticia', excerpt: 'Resumen...', content: '', date: new Date().toISOString().split('T')[0], author: 'Admin YES', category: 'Institucional', published: false, type: 'noticia' };
                await setDoc(doc(db, 'blogPosts', newPost.id), newPost);
                await triggerRevalidate([newPost.slug]);
                setBlogPosts([newPost, ...blogPosts]);
                setActiveModal(`blog-${newPost.id}`);
              }} className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-colors" style={{ borderColor: '#ED1118', color: '#ED1118' }}>+ Noticia</button>
              <button onClick={async () => {
                if (!db) return;
                const newPost: BlogPost = { id: Date.now().toString(), slug: `nuevo-articulo-${Date.now()}`, title: 'Nuevo Artículo', excerpt: 'Breve resumen...', content: '', date: new Date().toISOString().split('T')[0], author: 'Admin YES', category: 'General', published: false, type: 'blog' };
                await setDoc(doc(db, 'blogPosts', newPost.id), newPost);
                await triggerRevalidate([newPost.slug]);
                setBlogPosts([newPost, ...blogPosts]);
                setActiveModal(`blog-${newPost.id}`);
              }} className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">+ Blog</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-text-light uppercase tracking-wider w-20">Tipo</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-text-light uppercase tracking-wider">Título</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-text-light uppercase tracking-wider w-28 hidden md:table-cell">Fecha</th>
                  <th className="text-center px-4 py-2.5 text-xs font-bold text-text-light uppercase tracking-wider w-24">Estado</th>
                  <th className="px-4 py-2.5 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blogPosts.map((post) => {
                  const isNoticia = post.type === 'noticia';
                  const isExpired = post.expiresAt ? new Date(post.expiresAt) < new Date() : false;
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                          style={{ background: isNoticia ? '#ED1118' : '#323D6E' }}>
                          {isNoticia ? 'Noticia' : 'Blog'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-text truncate max-w-xs">{post.title || <span className="text-gray-300 italic">Sin título</span>}</p>
                        {post.category && <p className="text-xs text-text-light">{post.category}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-light hidden md:table-cell">{post.date}</td>
                      <td className="px-4 py-3 text-center">
                        {post.published && !isExpired && <span className="text-[10px] text-green-600 font-bold">● Publicado</span>}
                        {post.published && isExpired && <span className="text-[10px] text-orange-500 font-bold">● Expirado</span>}
                        {!post.published && <span className="text-[10px] text-gray-400 font-bold">● Borrador</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setActiveModal(`blog-${post.id}`)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-primary hover:bg-indigo-100 transition-colors">Editar</button>
                          <button onClick={async () => {
                            if (!db || !confirm('¿Eliminar esta entrada?')) return;
                            await deleteDoc(doc(db, 'blogPosts', post.id));
                            await triggerRevalidate([post.slug]);
                            setBlogPosts(blogPosts.filter(p => p.id !== post.id));
                            if (activeModal === `blog-${post.id}`) closeModal();
                          }} className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {blogPosts.length === 0 && <p className="text-center text-text-light text-sm py-10">No hay entradas. Crea la primera con los botones de arriba.</p>}
          </div>

          {/* Modal metadatos blog */}
          {activeModal === 'blog-content' && (
            <Modal title="Blog — Metadatos de la página" onClose={closeModal}>
              <Field label="Título de página" value={blogContent.title} onChange={(v) => setBlogContent({ ...blogContent, title: v })} />
              <Field label="Descripción de página" value={blogContent.description} onChange={(v) => setBlogContent({ ...blogContent, description: v })} textarea />
            </Modal>
          )}

          {/* Modal editar post */}
          {activeModal?.startsWith('blog-') && activeModal !== 'blog-content' && (() => {
            const postId = activeModal.replace('blog-', '');
            const i = blogPosts.findIndex(p => p.id === postId);
            if (i === -1) return null;
            const post = blogPosts[i];
            const isNoticia = post.type === 'noticia';
            const isExpired = post.expiresAt ? new Date(post.expiresAt) < new Date() : false;
            return (
              <Modal title={post.title || 'Editar entrada'} onClose={closeModal} size="xl">
                <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                  <button onClick={async () => {
                    const newType = isNoticia ? 'blog' : 'noticia';
                    const posts = [...blogPosts]; posts[i] = { ...post, type: newType }; setBlogPosts(posts);
                    if (db) await updateDoc(doc(db, 'blogPosts', post.id), { type: newType });
                  }} className="text-xs text-text-light hover:text-text underline">
                    Cambiar a {isNoticia ? 'Blog' : 'Noticia'}
                  </button>
                  <label className="flex items-center gap-2 ml-auto cursor-pointer">
                    <input type="checkbox" checked={post.published}
                      onChange={async (e) => {
                        const posts = [...blogPosts]; posts[i] = { ...post, published: e.target.checked }; setBlogPosts(posts);
                        if (db) await updateDoc(doc(db, 'blogPosts', post.id), { published: e.target.checked });
                        await triggerRevalidate([post.slug]);
                      }} className="w-4 h-4 accent-primary" />
                    <span className="text-xs font-semibold text-text-light">Publicado</span>
                  </label>
                </div>

                <Field label="Título" value={post.title} onChange={async (v) => {
                  const posts = [...blogPosts];
                  posts[i] = { ...post, title: v, slug: v.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') };
                  setBlogPosts(posts);
                  if (db) await updateDoc(doc(db, 'blogPosts', post.id), { title: v, slug: posts[i].slug });
                }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Categoría" value={post.category} onChange={async (v) => {
                    const posts = [...blogPosts]; posts[i] = { ...post, category: v }; setBlogPosts(posts);
                    if (db) await updateDoc(doc(db, 'blogPosts', post.id), { category: v });
                  }} />
                  <Field label="Fecha de publicación" value={post.date} onChange={async (v) => {
                    const posts = [...blogPosts]; posts[i] = { ...post, date: v }; setBlogPosts(posts);
                    if (db) await updateDoc(doc(db, 'blogPosts', post.id), { date: v });
                  }} />
                </div>

                {isNoticia && (
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">Fecha de expiración <span className="font-normal">(opcional)</span></label>
                    <input type="date" value={post.expiresAt || ''}
                      onChange={async (e) => {
                        const val = e.target.value || undefined;
                        const posts = [...blogPosts]; posts[i] = { ...post, expiresAt: val }; setBlogPosts(posts);
                        if (db) await updateDoc(doc(db, 'blogPosts', post.id), { expiresAt: val ?? null });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" />
                    {isExpired && <p className="text-xs text-orange-500 mt-1">Esta noticia ha expirado.</p>}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-text-light">Portada</span>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                      {(['image', 'video'] as const).map((t) => (
                        <button key={t} type="button"
                          onClick={async () => {
                            const posts = [...blogPosts]; posts[i] = { ...post, coverType: t }; setBlogPosts(posts);
                            if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverType: t });
                          }}
                          className={`px-3 py-1 transition-colors ${(post.coverType ?? 'image') === t ? 'bg-primary text-white' : 'text-text-light hover:bg-gray-50'}`}>
                          {t === 'image' ? '🖼 Imagen' : '▶ Video'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(post.coverType ?? 'image') === 'image' ? (
                    <ImageUploader label="" value={post.coverImage || ''} storagePath="blog-images" recommendedSize="1280 × 720 px (16:9)"
                      onChange={async (v) => {
                        const posts = [...blogPosts]; posts[i] = { ...post, coverImage: v }; setBlogPosts(posts);
                        if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverImage: v });
                      }} />
                  ) : (
                    <input type="url" value={post.coverVideo || ''}
                      onChange={async (e) => {
                        const v = e.target.value;
                        const posts = [...blogPosts]; posts[i] = { ...post, coverVideo: v }; setBlogPosts(posts);
                        if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverVideo: v });
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm" />
                  )}
                </div>

                <Field label="Resumen" value={post.excerpt} onChange={async (v) => {
                  const posts = [...blogPosts]; posts[i] = { ...post, excerpt: v }; setBlogPosts(posts);
                  if (db) await updateDoc(doc(db, 'blogPosts', post.id), { excerpt: v });
                }} textarea />

                <RichTextEditor label="Contenido" value={post.content}
                  onChange={async (v) => {
                    const posts = [...blogPosts]; posts[i] = { ...post, content: v }; setBlogPosts(posts);
                    if (db) await updateDoc(doc(db, 'blogPosts', post.id), { content: v });
                  }} />
              </Modal>
            );
          })()}
          </>
        )}

        {/* Testimonials moderation */}
        {activeTab === 'testimonials' && (
          <TestimonialsTab
            submissions={testimonialSubmissions}
            onUpdate={(updated) => setTestimonialSubmissions(updated)}
          />
        )}

        {/* ── STORAGE — always mounted so it loads in background for tab badge ── */}
        <div className={activeTab === 'storage' ? 'bg-white rounded-2xl border border-gray-100 p-6' : 'hidden'}>
          <StorageMonitor onUsageLoad={setStorageUsageRatio} />
        </div>

        {/* No content loaded */}
        {activeTab === 'home' && !home && (
          <p className="text-text-light text-center py-12">No se encontró contenido de Home en Firestore. Crea el documento siteConfig/home primero.</p>
        )}
        {activeTab === 'courses' && !courses && (
          <p className="text-text-light text-center py-12">No se encontró contenido de Cursos en Firestore. Crea el documento siteConfig/courses primero.</p>
        )}
        {activeTab === 'contact' && !contact && (
          <p className="text-text-light text-center py-12">No se encontró contenido de Contacto en Firestore. Crea el documento siteConfig/contact primero.</p>
        )}
        {activeTab === 'yesFactor' && !yesFactor && (
          <p className="text-text-light text-center py-12">No se encontró contenido de YES Factor en Firestore. Crea el documento siteConfig/yesFactor primero.</p>
        )}


        {/* Save button */}
        <div className="sticky bottom-4 mt-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg flex items-center justify-between">
            {saveMsg && <span className="text-sm">{saveMsg}</span>}
            {!saveMsg && <span className="text-sm text-text-light">Guarda para aplicar cambios en el sitio</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Programs CRUD ──

const EMPTY_PROGRAM: Omit<Program, 'id' | 'order'> = {
  title: '',
  subtitle: '',
  language: 'ingles',
  tag: '',
  levels: '',
  modality: '',
  intensity: '',
  schedules: [],
  highlights: [],
  materials: '',
  price: '',
  notes: '',
  active: true,
};

function ProgramsEditor({
  programs,
  onChange,
  onEditModal,
  activeModal,
  closeModal,
}: {
  programs: Program[];
  onChange: (p: Program[]) => void;
  onEditModal: (id: string) => void;
  activeModal: string | null;
  closeModal: () => void;
}) {
  const addProgram = () => {
    const id = `prog-${Date.now()}`;
    const newProg: Program = {
      ...EMPTY_PROGRAM,
      id,
      order: programs.length + 1,
      schedules: [],
      highlights: [],
    };
    onChange([...programs, newProg]);
    onEditModal(id);
  };

  const updateProgram = (id: string, patch: Partial<Program>) => {
    onChange(programs.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProgram = (id: string) => {
    if (!confirm('¿Eliminar este programa?')) return;
    onChange(programs.filter(p => p.id !== id));
    if (activeModal === `prog-${id}`) closeModal();
  };

  const moveProgram = (id: string, dir: -1 | 1) => {
    const sorted = [...programs].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(p => p.id === id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const reordered = sorted.map((p, i) => {
      if (i === idx) return { ...p, order: sorted[target].order };
      if (i === target) return { ...p, order: sorted[idx].order };
      return p;
    });
    onChange(reordered);
  };

  const sorted = [...programs].sort((a, b) => a.order - b.order);

  const fieldCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text text-sm uppercase tracking-wider">
          Programas ({programs.length})
        </h3>
        <button
          onClick={addProgram}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo programa
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="text-text-light text-sm text-center py-8">
          No hay programas. Crea el primero con el botón de arriba.
        </p>
      )}

      <div className="space-y-3">
        {sorted.map((prog, idx) => {
          const langColor = { ingles: '#C1121F', frances: '#1A56DB', ambos: '#6B21A8' }[prog.language];

          return (
            <div key={prog.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 p-3 bg-gray-50">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveProgram(prog.id, -1)} disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none px-1">▲</button>
                  <button onClick={() => moveProgram(prog.id, 1)} disabled={idx === sorted.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none px-1">▼</button>
                </div>

                <input type="checkbox" checked={prog.active}
                  onChange={e => updateProgram(prog.id, { active: e.target.checked })}
                  className="w-4 h-4 accent-primary shrink-0" title="Activo / visible en el sitio" />

                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: langColor }} />

                <button onClick={() => onEditModal(prog.id)} className="flex-1 text-left text-sm font-semibold text-text truncate">
                  {prog.title || <span className="text-gray-300 italic">Sin título</span>}
                  {prog.subtitle && <span className="text-gray-400 font-normal ml-2 text-xs">— {prog.subtitle}</span>}
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onEditModal(prog.id)} className="text-xs text-primary font-medium hover:underline">Editar</button>
                  <button onClick={() => deleteProgram(prog.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Eliminar</button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {programs.length > 0 && (
        <p className="text-xs text-text-light text-center pt-1">
          Recuerda guardar los cambios con el botón al final de la página.
        </p>
      )}

      {/* Modal de edición de programa */}
      {activeModal?.startsWith('prog-') && (() => {
        const progId = activeModal.replace('prog-', '');
        const prog = programs.find(p => p.id === progId);
        if (!prog) return null;
        return (
          <Modal title={prog.title || 'Nuevo programa'} onClose={closeModal} size="xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Título del programa *</label>
                <input className={fieldCls} value={prog.title} onChange={e => updateProgram(prog.id, { title: e.target.value })} placeholder="Ej: Niveles Intensivos Inglés" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Audiencia / público</label>
                <input className={fieldCls} value={prog.subtitle ?? ''} onChange={e => updateProgram(prog.id, { subtitle: e.target.value })} placeholder="Ej: Jóvenes-Adultos" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Idioma</label>
                <select className={fieldCls} value={prog.language} onChange={e => updateProgram(prog.id, { language: e.target.value as Program['language'] })}>
                  <option value="ingles">Inglés</option>
                  <option value="frances">Francés</option>
                  <option value="ambos">Inglés y Francés</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Etiqueta / tipo</label>
                <input className={fieldCls} value={prog.tag ?? ''} onChange={e => updateProgram(prog.id, { tag: e.target.value })} placeholder="Ej: Intensivo, Sábados, YES Kids, GEP" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Niveles</label>
                <input className={fieldCls} value={prog.levels ?? ''} onChange={e => updateProgram(prog.id, { levels: e.target.value })} placeholder="Ej: A1 – C1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Duración</label>
                <input className={fieldCls} value={prog.duration ?? ''} onChange={e => updateProgram(prog.id, { duration: e.target.value })} placeholder="Ej: 6 Niveles (Año y Medio)" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Modalidad</label>
                <input className={fieldCls} value={prog.modality ?? ''} onChange={e => updateProgram(prog.id, { modality: e.target.value })} placeholder="Ej: Virtual y/o Presencial" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-light mb-1">Intensidad</label>
                <input className={fieldCls} value={prog.intensity ?? ''} onChange={e => updateProgram(prog.id, { intensity: e.target.value })} placeholder="Ej: 110 horas por nivel" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-2">Horarios</label>
              <div className="space-y-2">
                {(prog.schedules ?? []).map((s, si) => (
                  <div key={si} className="flex gap-2">
                    <input className={`${fieldCls} flex-1`} value={s}
                      onChange={e => { const arr = [...(prog.schedules ?? [])]; arr[si] = e.target.value; updateProgram(prog.id, { schedules: arr }); }}
                      placeholder="Ej: SAB AM: 8:00 a 12:00 M" />
                    <button onClick={() => updateProgram(prog.id, { schedules: (prog.schedules ?? []).filter((_, i) => i !== si) })}
                      className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                  </div>
                ))}
                <button onClick={() => updateProgram(prog.id, { schedules: [...(prog.schedules ?? []), ''] })}
                  className="text-xs text-primary font-semibold hover:underline">+ Agregar horario</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Puntos destacados <span className="text-gray-300">(GEP, programas especiales)</span></label>
              <div className="space-y-2">
                {(prog.highlights ?? []).map((h, hi) => (
                  <div key={hi} className="flex gap-2">
                    <input className={`${fieldCls} flex-1`} value={h}
                      onChange={e => { const arr = [...(prog.highlights ?? [])]; arr[hi] = e.target.value; updateProgram(prog.id, { highlights: arr }); }}
                      placeholder="Ej: 100% alineación con el MCERL" />
                    <button onClick={() => updateProgram(prog.id, { highlights: (prog.highlights ?? []).filter((_, i) => i !== hi) })}
                      className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                  </div>
                ))}
                <button onClick={() => updateProgram(prog.id, { highlights: [...(prog.highlights ?? []), ''] })}
                  className="text-xs text-primary font-semibold hover:underline">+ Agregar punto</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Nota adicional (visible)</label>
              <input className={fieldCls} value={prog.notes ?? ''} onChange={e => updateProgram(prog.id, { notes: e.target.value })} placeholder="Ej: Cupos limitados" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1">Enlace "Ver más información" (URL del blog)</label>
              <input className={fieldCls} value={prog.infoUrl ?? ''} onChange={e => updateProgram(prog.id, { infoUrl: e.target.value })} placeholder="Ej: /blog/cursos-intensivos-ingles" />
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inversión y material</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-light">Inversión / Precio</label>
                  <input className={fieldCls} value={prog.price ?? ''} onChange={e => updateProgram(prog.id, { price: e.target.value })} placeholder="Ej: $755.000 Presencial / $650.000 Virtual" />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={prog.showPrice ?? false} onChange={e => updateProgram(prog.id, { showPrice: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-xs text-text-light">Mostrar precio en el sitio</span>
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-light">Material</label>
                  <input className={fieldCls} value={prog.materials ?? ''} onChange={e => updateProgram(prog.id, { materials: e.target.value })} placeholder="Ej: $160.000 / Incluido" />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={prog.showMaterials ?? false} onChange={e => updateProgram(prog.id, { showMaterials: e.target.checked })} className="w-4 h-4 accent-primary" />
                    <span className="text-xs text-text-light">Mostrar material en el sitio</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={prog.active} onChange={e => updateProgram(prog.id, { active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-xs font-semibold text-text-light">Activo / visible en el sitio</span>
              </label>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => moveProgram(prog.id, -1)} disabled={sorted.findIndex(p => p.id === prog.id) === 0}
                  className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30">▲ Subir</button>
                <button onClick={() => moveProgram(prog.id, 1)} disabled={sorted.findIndex(p => p.id === prog.id) === sorted.length - 1}
                  className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30">▼ Bajar</button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ── Testimonials moderation tab ──

function TestimonialsTab({
  submissions,
  onUpdate,
}: {
  submissions: TestimonialSubmission[];
  onUpdate: (updated: TestimonialSubmission[]) => void;
}) {
  const [actionMsg, setActionMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TestimonialSubmission>>({});

  const startEdit = (testimonial: TestimonialSubmission) => {
    setEditingId(testimonial.id || null);
    setEditData(testimonial);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'testimonials', id), editData);
      onUpdate(submissions.map(t => t.id === id ? { ...t, ...editData } : t));
      setEditingId(null);
      setEditData({});
      setActionMsg('✅ Testimonio actualizado');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (err) {
      console.error('Error updating testimonial:', err);
      setActionMsg('❌ Error al actualizar');
      setTimeout(() => setActionMsg(''), 2000);
    }
  };

  const updateApproval = async (id: string, approved: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'testimonials', id), { approved });
      onUpdate(submissions.map(t => t.id === id ? { ...t, approved } : t));
      setActionMsg(approved ? '✅ Aprobado' : '🚫 Rechazado');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (err) {
      console.error('Error updating testimonial:', err);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!db || !confirm('¿Eliminar este testimonio?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      onUpdate(submissions.filter(t => t.id !== id));
      setActionMsg('🗑 Eliminado');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    }
  };

  const pending = submissions.filter(t => !t.approved);
  const approved = submissions.filter(t => t.approved);

  return (
    <div className="space-y-6">
      {actionMsg && (
        <p className="text-sm font-medium text-center bg-white border border-gray-100 rounded-xl py-2">{actionMsg}</p>
      )}

      <EditorSection title={`Pendientes de revisión (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="text-text-light text-sm text-center py-4">No hay comentarios pendientes.</p>
        ) : (
          <div className="space-y-4">
            {pending.map(t => (
              <div key={t.id} className={editingId === t.id ? "border-2 border-primary bg-blue-50 rounded-xl p-4" : "border border-amber-200 bg-amber-50 rounded-xl p-4"}>
                {editingId === t.id ? (
                  // ── Modo edición ──
                  <div className="space-y-3">
                    <Field 
                      label="Nombre" 
                      value={editData.name || ''} 
                      onChange={(v) => setEditData({ ...editData, name: v })} 
                    />
                    <Field 
                      label="Rol" 
                      value={editData.role || ''} 
                      onChange={(v) => setEditData({ ...editData, role: v })} 
                    />
                    <div>
                      <label className="block text-xs font-medium text-text-light mb-1">Texto</label>
                      <textarea 
                        value={editData.text || ''} 
                        onChange={(e) => setEditData({ ...editData, text: e.target.value })} 
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(t.id!)}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Modo visualización ──
                  <>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-text">{t.name}</p>
                        <p className="text-xs text-text-light">{t.role}</p>
                      </div>
                      <p className="text-xs text-text-light whitespace-nowrap">
                        {t.createdAt
                          ? new Date(
                              typeof t.createdAt === 'string'
                                ? t.createdAt
                                : (t.createdAt as unknown as { seconds: number }).seconds * 1000
                            ).toLocaleDateString('es-CO')
                          : ''}
                      </p>
                    </div>
                    <p className="text-sm text-text-light italic mb-3">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        ✎ Editar
                      </button>
                      <button
                        onClick={() => updateApproval(t.id!, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => deleteTestimonial(t.id!)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        ✕ Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </EditorSection>

      <EditorSection title={`Publicados (${approved.length})`}>
        {approved.length === 0 ? (
          <p className="text-text-light text-sm text-center py-4">No hay testimonios aprobados aún.</p>
        ) : (
          <div className="space-y-3">
            {approved.map(t => (
              <div key={t.id} className={editingId === t.id ? "border-2 border-primary bg-blue-50 rounded-xl p-4" : "border border-gray-100 rounded-xl p-4"}>
                {editingId === t.id ? (
                  // ── Modo edición ──
                  <div className="space-y-3">
                    <Field 
                      label="Nombre" 
                      value={editData.name || ''} 
                      onChange={(v) => setEditData({ ...editData, name: v })} 
                    />
                    <Field 
                      label="Rol" 
                      value={editData.role || ''} 
                      onChange={(v) => setEditData({ ...editData, role: v })} 
                    />
                    <div>
                      <label className="block text-xs font-medium text-text-light mb-1">Texto</label>
                      <textarea 
                        value={editData.text || ''} 
                        onChange={(e) => setEditData({ ...editData, text: e.target.value })} 
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(t.id!)}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Modo visualización ──
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-text">{t.name}</p>
                        <span className="text-xs text-text-light">— {t.role}</span>
                      </div>
                      <p className="text-sm text-text-light italic truncate">&ldquo;{t.text}&rdquo;</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors"
                      >
                        ✎ Editar
                      </button>
                      <button
                        onClick={() => updateApproval(t.id!, false)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-text-light font-medium py-1.5 px-3 rounded-lg transition-colors"
                      >
                        Ocultar
                      </button>
                      <button
                        onClick={() => deleteTestimonial(t.id!)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1.5 px-3 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </EditorSection>
    </div>
  );
}

// ── Helper components ──

function Modal({
  title,
  onClose,
  children,
  size = 'md',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[85vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-text text-base truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-light leading-none shrink-0"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  desc,
  badge,
  onEdit,
}: {
  title: string;
  icon?: string;
  desc?: string;
  badge?: string;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="text-xl shrink-0 mt-0.5">{icon}</span>}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-text text-sm">{title}</p>
            {badge && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
          </div>
          {desc && <p className="text-xs text-text-light mt-0.5 truncate max-w-xs">{desc}</p>}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-primary hover:bg-indigo-100 transition-colors"
      >
        Editar
      </button>
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm';
  return (
    <div>
      <label className="block text-xs font-medium text-text-light mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
