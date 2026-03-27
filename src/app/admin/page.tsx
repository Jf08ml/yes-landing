/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type {
  HomeContent,
  CoursesContent,
  ContactContent,
  YESFactorContent,
  BlogPost,
  BlogContent,
} from '@/types';
import { 
  mockHome, 
  mockCourses, 
  mockContact, 
  mockYESFactor, 
  mockBlogPosts, 
  mockBlogContent 
} from '@/lib/mockData';

type TabName = 'home' | 'courses' | 'contact' | 'yesFactor' | 'blog';

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
      const [homeSnap, coursesSnap, contactSnap, yesFactorSnap, blogContentSnap, blogPostsSnap] = await Promise.all([
        getDoc(doc(db, 'siteConfig', 'home')),
        getDoc(doc(db, 'siteConfig', 'courses')),
        getDoc(doc(db, 'siteConfig', 'contact')),
        getDoc(doc(db, 'siteConfig', 'yesFactor')),
        getDoc(doc(db, 'siteConfig', 'blogContent')),
        getDocs(collection(db, 'blogPosts')),
      ]);
      if (homeSnap.exists()) setHome(homeSnap.data() as HomeContent);
      if (coursesSnap.exists()) setCourses(coursesSnap.data() as CoursesContent);
      if (contactSnap.exists()) setContact(contactSnap.data() as ContactContent);
      if (yesFactorSnap.exists()) setYesFactor(yesFactorSnap.data() as YESFactorContent);
      if (blogContentSnap.exists()) setBlogContent(blogContentSnap.data() as BlogContent);
      setBlogPosts(blogPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
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
      if (contact) updates.push(updateDoc(doc(db, 'siteConfig', 'contact'), { ...contact }));
      if (yesFactor) updates.push(updateDoc(doc(db, 'siteConfig', 'yesFactor'), { ...yesFactor }));
      if (blogContent) updates.push(updateDoc(doc(db, 'siteConfig', 'blogContent'), { ...blogContent }));
      await Promise.all(updates);
      setSaveMsg('✅ Cambios guardados. Se reflejarán en el sitio en ~5 minutos (ISR).');
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
          {(['home', 'courses', 'blog', 'yesFactor', 'contact'] as TabName[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-gray-50'
              }`}
            >
              {tab === 'home' ? 'Home' : tab === 'courses' ? 'Cursos' : tab === 'blog' ? 'Blog' : tab === 'contact' ? 'Contacto' : 'YES Factor'}
            </button>
          ))}
        </div>

        {/* Home editor */}
        {activeTab === 'home' && home && (
          <div className="space-y-6">
            <EditorSection title="SEO (metadatos de la página)">
              <Field label="Título SEO" value={home.seo.title} onChange={(v) => setHome({ ...home, seo: { ...home.seo, title: v } })} />
              <Field label="Descripción SEO" value={home.seo.description} onChange={(v) => setHome({ ...home, seo: { ...home.seo, description: v } })} textarea />
            </EditorSection>

            <EditorSection title="Hero">
              <Field label="Título" value={home.hero.title} onChange={(v) => setHome({ ...home, hero: { ...home.hero, title: v } })} />
              <Field label="Subtítulo" value={home.hero.subtitle} onChange={(v) => setHome({ ...home, hero: { ...home.hero, subtitle: v } })} textarea />
              <Field label="CTA texto" value={home.hero.ctaText} onChange={(v) => setHome({ ...home, hero: { ...home.hero, ctaText: v } })} />
              <Field label="CTA WhatsApp texto" value={home.hero.ctaWhatsappText} onChange={(v) => setHome({ ...home, hero: { ...home.hero, ctaWhatsappText: v } })} />
            </EditorSection>

            <EditorSection title={`Stats (${home.stats.length})`}>
              {home.stats.map((s, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Field label="Valor (ej: 32+)" value={s.value} onChange={(v) => {
                      const stats = [...home.stats]; stats[i] = { ...s, value: v }; setHome({ ...home, stats });
                    }} />
                    <Field label="Etiqueta (ej: Años)" value={s.label} onChange={(v) => {
                      const stats = [...home.stats]; stats[i] = { ...s, label: v }; setHome({ ...home, stats });
                    }} />
                  </div>
                  <button onClick={() => setHome({ ...home, stats: home.stats.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 text-xs mt-2">✕</button>
                </div>
              ))}
              <button onClick={() => setHome({ ...home, stats: [...home.stats, { value: '', label: '' }] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar stat
              </button>
            </EditorSection>

            <EditorSection title={`Trust Bar (${home.trustBar.length})`}>
              <p className="text-xs text-text-light mb-2">Píldoras de texto en el banner de confianza bajo el hero.</p>
              {home.trustBar.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const trustBar = [...home.trustBar]; trustBar[i] = e.target.value; setHome({ ...home, trustBar });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  <button onClick={() => setHome({ ...home, trustBar: home.trustBar.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                </div>
              ))}
              <button onClick={() => setHome({ ...home, trustBar: [...home.trustBar, ''] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar ítem
              </button>
            </EditorSection>

            <EditorSection title="CTA Final">
              <Field label="Título" value={home.ctaFinal.title} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, title: v } })} />
              <Field label="Subtítulo" value={home.ctaFinal.subtitle} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, subtitle: v } })} textarea />
              <Field label="CTA texto" value={home.ctaFinal.ctaText} onChange={(v) => setHome({ ...home, ctaFinal: { ...home.ctaFinal, ctaText: v } })} />
            </EditorSection>

            <EditorSection title="Preview YES Factor (Home)">
              <Field label="Título" value={home.yesFactorPreview.title} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, title: v } })} />
              <Field label="Descripción" value={home.yesFactorPreview.description} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, description: v } })} textarea />
              <Field label="Texto botón" value={home.yesFactorPreview.ctaText} onChange={(v) => setHome({ ...home, yesFactorPreview: { ...home.yesFactorPreview, ctaText: v } })} />
            </EditorSection>

            <EditorSection title={`Features (${home.features.length})`}>
              {home.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Field label="Ícono" value={f.icon} onChange={(v) => {
                      const features = [...home.features];
                      features[i] = { ...f, icon: v };
                      setHome({ ...home, features });
                    }} />
                    <Field label="Título" value={f.title} onChange={(v) => {
                      const features = [...home.features];
                      features[i] = { ...f, title: v };
                      setHome({ ...home, features });
                    }} />
                    <Field label="Descripción" value={f.description} onChange={(v) => {
                      const features = [...home.features];
                      features[i] = { ...f, description: v };
                      setHome({ ...home, features });
                    }} textarea />
                  </div>
                  <button onClick={() => {
                    const features = home.features.filter((_, j) => j !== i);
                    setHome({ ...home, features });
                  }} className="text-red-400 hover:text-red-600 text-xs mt-2">✕</button>
                </div>
              ))}
              <button onClick={() => setHome({ ...home, features: [...home.features, { icon: '⭐', title: '', description: '' }] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar feature
              </button>
            </EditorSection>

            <EditorSection title={`Testimonios (${home.testimonials.length})`}>
              {home.testimonials.map((t, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Field label="Nombre" value={t.name} onChange={(v) => {
                      const testimonials = [...home.testimonials];
                      testimonials[i] = { ...t, name: v };
                      setHome({ ...home, testimonials });
                    }} />
                    <Field label="Rol" value={t.role} onChange={(v) => {
                      const testimonials = [...home.testimonials];
                      testimonials[i] = { ...t, role: v };
                      setHome({ ...home, testimonials });
                    }} />
                    <Field label="Texto" value={t.text} onChange={(v) => {
                      const testimonials = [...home.testimonials];
                      testimonials[i] = { ...t, text: v };
                      setHome({ ...home, testimonials });
                    }} textarea />
                  </div>
                  <button onClick={() => {
                    const testimonials = home.testimonials.filter((_, j) => j !== i);
                    setHome({ ...home, testimonials });
                  }} className="text-red-400 hover:text-red-600 text-xs mt-2">✕</button>
                </div>
              ))}
              <button onClick={() => setHome({ ...home, testimonials: [...home.testimonials, { name: '', role: '', text: '' }] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar testimonio
              </button>
            </EditorSection>

            <EditorSection title={`FAQ (${home.faq.length})`}>
              {home.faq.map((f, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Field label="Pregunta" value={f.question} onChange={(v) => {
                      const faq = [...home.faq];
                      faq[i] = { ...f, question: v };
                      setHome({ ...home, faq });
                    }} />
                    <Field label="Respuesta" value={f.answer} onChange={(v) => {
                      const faq = [...home.faq];
                      faq[i] = { ...f, answer: v };
                      setHome({ ...home, faq });
                    }} textarea />
                  </div>
                  <button onClick={() => {
                    const faq = home.faq.filter((_, j) => j !== i);
                    setHome({ ...home, faq });
                  }} className="text-red-400 hover:text-red-600 text-xs mt-2">✕</button>
                </div>
              ))}
              <button onClick={() => setHome({ ...home, faq: [...home.faq, { question: '', answer: '' }] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar FAQ
              </button>
            </EditorSection>
          </div>
        )}

        {/* Courses editor */}
        {activeTab === 'courses' && courses && (
          <div className="space-y-6">
            <EditorSection title="Página de cursos">
              <Field label="Título de página" value={courses.pageTitle} onChange={(v) => setCourses({ ...courses, pageTitle: v })} />
              <Field label="Descripción" value={courses.pageDescription} onChange={(v) => setCourses({ ...courses, pageDescription: v })} textarea />
            </EditorSection>
            {courses.courses.map((course, ci) => (
              <EditorSection key={ci} title={`Curso: ${course.title}`}>
                <Field label="Título" value={course.title} onChange={(v) => {
                  const c = [...courses.courses]; c[ci] = { ...course, title: v };
                  setCourses({ ...courses, courses: c });
                }} />
                <Field label="Descripción" value={course.description} onChange={(v) => {
                  const c = [...courses.courses]; c[ci] = { ...course, description: v };
                  setCourses({ ...courses, courses: c });
                }} textarea />
                <Field label="Niveles" value={course.levels} onChange={(v) => {
                  const c = [...courses.courses]; c[ci] = { ...course, levels: v };
                  setCourses({ ...courses, courses: c });
                }} />
                <Field label="Certificación" value={course.certification} onChange={(v) => {
                  const c = [...courses.courses]; c[ci] = { ...course, certification: v };
                  setCourses({ ...courses, courses: c });
                }} />
              </EditorSection>
            ))}
          </div>
        )}

        {/* Contact editor */}
        {activeTab === 'contact' && contact && (
          <div className="space-y-6">
            <EditorSection title="Datos de contacto">
              <Field label="WhatsApp" value={contact.whatsapp} onChange={(v) => setContact({ ...contact, whatsapp: v })} />
              <Field label="URL Pagos en línea" value={contact.paymentsUrl || ''} onChange={(v) => setContact({ ...contact, paymentsUrl: v })} />
              <Field label="Teléfono" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
              <Field label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
              <Field label="Dirección" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} />
              <Field label="Ciudad" value={contact.city} onChange={(v) => setContact({ ...contact, city: v })} />
              <Field label="Región" value={contact.region} onChange={(v) => setContact({ ...contact, region: v })} />
              <Field label="Link a Google Maps" value={contact.mapLink} onChange={(v) => setContact({ ...contact, mapLink: v })} />
              <Field label="Embed mapa (URL iframe)" value={contact.mapEmbed || ''} onChange={(v) => setContact({ ...contact, mapEmbed: v })} />
            </EditorSection>
            <EditorSection title="Redes sociales">
              {contact.social.map((s, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-text-light">Plataforma</label>
                      <select
                        value={s.platform}
                        onChange={(e) => {
                          const labels: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
                          const social = [...contact.social];
                          social[i] = { ...s, platform: e.target.value, label: labels[e.target.value] || e.target.value };
                          setContact({ ...contact, social });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                    <Field label="URL" value={s.url} onChange={(v) => {
                      const social = [...contact.social]; social[i] = { ...s, url: v };
                      setContact({ ...contact, social });
                    }} />
                  </div>
                  <button
                    onClick={() => {
                      const social = contact.social.filter((_, idx) => idx !== i);
                      setContact({ ...contact, social });
                    }}
                    className="mt-6 text-red-400 hover:text-red-600 text-lg font-bold px-1"
                    title="Eliminar"
                  >×</button>
                </div>
              ))}
              <button
                onClick={() => setContact({ ...contact, social: [...contact.social, { platform: 'instagram', label: 'Instagram', url: '' }] })}
                className="text-sm text-primary font-semibold hover:underline"
              >
                + Añadir red social
              </button>
            </EditorSection>
          </div>
        )}

        {/* YES Factor editor */}
        {activeTab === 'yesFactor' && yesFactor && (
          <div className="space-y-6">
            <EditorSection title="Página YES Factor">
              <Field label="Título" value={yesFactor.title} onChange={(v) => setYesFactor({ ...yesFactor, title: v })} />
              <Field label="Descripción" value={yesFactor.description} onChange={(v) => setYesFactor({ ...yesFactor, description: v })} textarea />
              <Field label="URL Video (opcional)" value={yesFactor.videoUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, videoUrl: v })} />
              <Field label="URL Reglamento (PDF)" value={yesFactor.rulesUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, rulesUrl: v })} />
              <div className="space-y-1">
                <label className="block text-xs font-medium text-text-light">Estado de inscripción</label>
                <select 
                  value={yesFactor.registrationStatus} 
                  onChange={(e) => setYesFactor({ ...yesFactor, registrationStatus: e.target.value as 'open' | 'closed' })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                >
                  <option value="open">Abierto</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
              <Field label="URL Formulario / WhatsApp" value={yesFactor.registrationUrl || ''} onChange={(v) => setYesFactor({ ...yesFactor, registrationUrl: v })} />
            </EditorSection>

            <EditorSection title={`Ganadores (${yesFactor.winners.length})`}>
              {yesFactor.winners.map((w, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <Field label="Nombre" value={w.name} onChange={(v) => {
                      const winners = [...yesFactor.winners];
                      winners[i] = { ...w, name: v };
                      setYesFactor({ ...yesFactor, winners });
                    }} />
                    <Field label="Categoría" value={w.category} onChange={(v) => {
                      const winners = [...yesFactor.winners];
                      winners[i] = { ...w, category: v };
                      setYesFactor({ ...yesFactor, winners });
                    }} />
                    <Field label="Puesto (ej: 1st Place)" value={w.place} onChange={(v) => {
                      const winners = [...yesFactor.winners];
                      winners[i] = { ...w, place: v };
                      setYesFactor({ ...yesFactor, winners });
                    }} />
                  </div>
                  <button onClick={() => {
                    const winners = yesFactor.winners.filter((_, j) => j !== i);
                    setYesFactor({ ...yesFactor, winners });
                  }} className="text-red-400 hover:text-red-600 text-xs mt-2">✕</button>
                </div>
              ))}
              <button onClick={() => setYesFactor({ ...yesFactor, winners: [...yesFactor.winners, { name: '', category: '', place: '' }] })} className="text-primary text-sm font-medium hover:underline">
                + Agregar ganador
              </button>
            </EditorSection>
          </div>
        )}

        {/* Blog & Noticias editor */}
        {activeTab === 'blog' && blogContent && (
          <div className="space-y-6">
            <EditorSection title="Metadatos de la página">
              <Field label="Título de página" value={blogContent.title} onChange={(v) => setBlogContent({ ...blogContent, title: v })} />
              <Field label="Descripción de página" value={blogContent.description} onChange={(v) => setBlogContent({ ...blogContent, description: v })} textarea />
            </EditorSection>

            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-text uppercase tracking-wider text-sm">
                Entradas ({blogPosts.length})
                <span className="ml-2 text-text-light font-normal normal-case tracking-normal">
                  — {blogPosts.filter(p => p.type === 'noticia').length} noticias · {blogPosts.filter(p => p.type === 'blog').length} blogs
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!db) return;
                    const newPost: BlogPost = {
                      id: Date.now().toString(),
                      slug: `nueva-noticia-${Date.now()}`,
                      title: 'Nueva Noticia',
                      excerpt: 'Resumen de la noticia...',
                      content: '# Nueva Noticia\n\nEscribe aquí el contenido.',
                      date: new Date().toISOString().split('T')[0],
                      author: 'Admin YES',
                      category: 'Institucional',
                      published: false,
                      type: 'noticia',
                    };
                    await setDoc(doc(db, 'blogPosts', newPost.id), newPost);
                    setBlogPosts([newPost, ...blogPosts]);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-colors"
                  style={{ borderColor: '#ED1118', color: '#ED1118' }}
                >
                  + Noticia
                </button>
                <button
                  onClick={async () => {
                    if (!db) return;
                    const newPost: BlogPost = {
                      id: Date.now().toString(),
                      slug: `nuevo-articulo-${Date.now()}`,
                      title: 'Nuevo Artículo',
                      excerpt: 'Breve resumen del artículo...',
                      content: '# Contenido del artículo\n\nEscribe aquí usando Markdown.',
                      date: new Date().toISOString().split('T')[0],
                      author: 'Admin YES',
                      category: 'General',
                      published: false,
                      type: 'blog',
                    };
                    await setDoc(doc(db, 'blogPosts', newPost.id), newPost);
                    setBlogPosts([newPost, ...blogPosts]);
                  }}
                  className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  + Blog
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {blogPosts.map((post, i) => {
                const isNoticia = post.type === 'noticia';
                const isExpired = post.expiresAt ? new Date(post.expiresAt) < new Date() : false;
                return (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                    {/* Header: tipo + estado */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                        style={{ background: isNoticia ? '#ED1118' : '#323D6E' }}
                      >
                        {isNoticia ? 'Noticia' : 'Blog'}
                      </span>
                      {post.published && !isExpired && <span className="text-[10px] text-green-600 font-semibold">● Publicado</span>}
                      {post.published && isExpired && <span className="text-[10px] text-orange-500 font-semibold">● Expirado</span>}
                      {!post.published && <span className="text-[10px] text-gray-400 font-semibold">● Borrador</span>}

                      {/* Toggle tipo */}
                      <button
                        onClick={async () => {
                          const newType = isNoticia ? 'blog' : 'noticia';
                          const posts = [...blogPosts]; posts[i] = { ...post, type: newType }; setBlogPosts(posts);
                          if (db) await updateDoc(doc(db, 'blogPosts', post.id), { type: newType });
                        }}
                        className="ml-auto text-[10px] text-text-light hover:text-text underline"
                      >
                        Cambiar a {isNoticia ? 'Blog' : 'Noticia'}
                      </button>
                      <button onClick={async () => {
                        if (!db || !confirm('¿Eliminar esta entrada?')) return;
                        await deleteDoc(doc(db, 'blogPosts', post.id));
                        setBlogPosts(blogPosts.filter(p => p.id !== post.id));
                      }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
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
                        <label className="block text-xs font-medium text-text-light mb-1">
                          Fecha de expiración <span className="text-text-light font-normal">(opcional — se deja de mostrar en el hero al vencer)</span>
                        </label>
                        <input
                          type="date"
                          value={post.expiresAt || ''}
                          onChange={async (e) => {
                            const val = e.target.value || undefined;
                            const posts = [...blogPosts]; posts[i] = { ...post, expiresAt: val }; setBlogPosts(posts);
                            if (db) await updateDoc(doc(db, 'blogPosts', post.id), { expiresAt: val ?? null });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        />
                        {isExpired && (
                          <p className="text-xs text-orange-500 mt-1">Esta noticia ha expirado y no se muestra en el sitio.</p>
                        )}
                      </div>
                    )}

                    {/* Portada: toggle imagen / video */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-text-light">Portada</span>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                          {(['image', 'video'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={async () => {
                                const posts = [...blogPosts]; posts[i] = { ...post, coverType: t }; setBlogPosts(posts);
                                if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverType: t });
                              }}
                              className={`px-3 py-1 transition-colors ${(post.coverType ?? 'image') === t ? 'bg-primary text-white' : 'text-text-light hover:bg-gray-50'}`}
                            >
                              {t === 'image' ? '🖼 Imagen' : '▶ Video'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(post.coverType ?? 'image') === 'image' ? (
                        <ImageUploader
                          label=""
                          value={post.coverImage || ''}
                          storagePath="blog-images"
                          recommendedSize="1280 × 720 px (16:9)"
                          onChange={async (v) => {
                            const posts = [...blogPosts]; posts[i] = { ...post, coverImage: v }; setBlogPosts(posts);
                            if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverImage: v });
                          }}
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="url"
                            value={post.coverVideo || ''}
                            onChange={async (e) => {
                              const v = e.target.value;
                              const posts = [...blogPosts]; posts[i] = { ...post, coverVideo: v }; setBlogPosts(posts);
                              if (db) await updateDoc(doc(db, 'blogPosts', post.id), { coverVideo: v });
                            }}
                            placeholder="https://www.youtube.com/watch?v=... o URL directa de video"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                          />
                          {post.coverVideo && (
                            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black">
                              <iframe
                                src={post.coverVideo.includes('youtube.com/watch')
                                  ? `https://www.youtube.com/embed/${new URLSearchParams(post.coverVideo.split('?')[1]).get('v')}`
                                  : post.coverVideo.includes('youtu.be')
                                    ? `https://www.youtube.com/embed/${post.coverVideo.split('/').pop()}`
                                    : post.coverVideo}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                          <p className="text-[10px] text-text-light">Soporta YouTube, Vimeo o URL directa de video (.mp4)</p>
                        </div>
                      )}
                    </div>

                    <Field label="Resumen" value={post.excerpt} onChange={async (v) => {
                      const posts = [...blogPosts]; posts[i] = { ...post, excerpt: v }; setBlogPosts(posts);
                      if (db) await updateDoc(doc(db, 'blogPosts', post.id), { excerpt: v });
                    }} textarea />

                    <RichTextEditor
                      label="Contenido"
                      value={post.content}
                      onChange={async (v) => {
                        const posts = [...blogPosts]; posts[i] = { ...post, content: v }; setBlogPosts(posts);
                        if (db) await updateDoc(doc(db, 'blogPosts', post.id), { content: v });
                      }}
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`pub-${post.id}`}
                        checked={post.published}
                        onChange={async (e) => {
                          const posts = [...blogPosts]; posts[i] = { ...post, published: e.target.checked }; setBlogPosts(posts);
                          if (db) await updateDoc(doc(db, 'blogPosts', post.id), { published: e.target.checked });
                        }}
                      />
                      <label htmlFor={`pub-${post.id}`} className="text-xs font-medium text-text-light">Publicado</label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            {!saveMsg && <span className="text-sm text-text-light">Los cambios se reflejan en ~5 min (ISR)</span>}
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

// ── Helper components ──

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
