import { isFirebaseConfigured, db } from './firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {
  mockHome,
  mockCourses,
  mockContact,
  mockYESFactor,
  mockBlogPosts,
  mockBlogContent,
  mockPrograms,
} from './mockData';
import {
  HomeContent,
  CoursesContent,
  Program,
  ContactContent,
  YESFactorContent,
  BlogPost,
  BlogContent,
  TestimonialSubmission,
} from '@/types';

async function fetchDoc<T>(docPath: string, fallback: T): Promise<T> {
  if (!isFirebaseConfigured || !db) {
    return fallback;
  }

  try {
    const snap = await getDoc(doc(db, 'siteConfig', docPath));
    if (snap.exists()) {
      return snap.data() as T;
    }
    return fallback;
  } catch (error) {
    console.warn(`[content] Failed to fetch siteConfig/${docPath}, using fallback:`, error);
    return fallback;
  }
}

/** Filtra noticias expiradas en JS (expiresAt es solo un filtro de visualización) */
function isNotExpired(post: BlogPost): boolean {
  if (!post.expiresAt) return true;
  return new Date(post.expiresAt) > new Date();
}

export async function fetchHomeContent(): Promise<HomeContent> {
  return fetchDoc<HomeContent>('home', mockHome);
}

export async function fetchCoursesContent(): Promise<CoursesContent> {
  return fetchDoc<CoursesContent>('courses', mockCourses);
}

export async function fetchContactContent(): Promise<ContactContent> {
  return fetchDoc<ContactContent>('contact', mockContact);
}

export async function fetchYESFactorContent(): Promise<YESFactorContent> {
  return fetchDoc<YESFactorContent>('yesFactor', mockYESFactor);
}

/** Noticias publicadas y no expiradas — para el hero del home */
export async function fetchNoticias(): Promise<BlogPost[]> {
  const mockNoticias = mockBlogPosts.filter(p => p.type === 'noticia' && p.published && isNotExpired(p));
  if (!db) return mockNoticias;
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('type', '==', 'noticia'),
      where('published', '==', true),
    );
    const snap = await getDocs(q);
    if (snap.empty) return mockNoticias;
    const noticias = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as BlogPost))
      .filter(isNotExpired);
    return noticias.length ? noticias : mockNoticias;
  } catch (err) {
    console.error('Error fetching noticias:', err);
    return mockNoticias;
  }
}

/** Blog posts publicados — para la sección blog */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const mockBlogs = mockBlogPosts.filter(p => p.type === 'blog' && p.published);
  if (!db) return mockBlogs;
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('type', '==', 'blog'),
      where('published', '==', true),
    );
    const snap = await getDocs(q);
    if (snap.empty) return mockBlogs;
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    return mockBlogs;
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!db) return mockBlogPosts.find(p => p.slug === slug) || null;
  try {
    const q = query(collection(db, 'blogPosts'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return mockBlogPosts.find(p => p.slug === slug) || null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
  } catch (err) {
    console.error('Error fetching blog post:', err);
    return null;
  }
}

export async function fetchBlogContent(): Promise<BlogContent> {
  return fetchDoc<BlogContent>('blogContent', mockBlogContent);
}

/** Programas activos — gestionados desde el admin, ordenados por `order` */
export async function fetchPrograms(): Promise<Program[]> {
  if (!isFirebaseConfigured || !db) return mockPrograms;
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'programs'));
    if (!snap.exists()) return mockPrograms;
    const items: Program[] = snap.data().items ?? [];
    return items.filter(p => p.active).sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error('Error fetching programs:', err);
    return mockPrograms;
  }
}

/** Testimonios aprobados — ordenados por más reciente */
export async function fetchApprovedTestimonials(): Promise<TestimonialSubmission[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const { orderBy } = await import('firebase/firestore');
    const q = query(
      collection(db, 'testimonials'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TestimonialSubmission));
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return [];
  }
}
