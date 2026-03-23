import { isFirebaseConfigured, db } from './firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { 
  mockHome, 
  mockCourses, 
  mockContact, 
  mockYESFactor, 
  mockBlogPosts, 
  mockBlogContent 
} from './mockData';
import { 
  HomeContent, 
  CoursesContent, 
  ContactContent, 
  YESFactorContent, 
  BlogPost, 
  BlogContent 
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

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!db) return mockBlogPosts;
  try {
    const q = query(collection(db, 'blogPosts'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return mockBlogPosts;
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    return mockBlogPosts;
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

