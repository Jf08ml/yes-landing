// ── Firestore: siteConfig/home ──
export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaWhatsappText: string;
  backgroundImage?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface CoursePreview {
  id: string;
  language: 'ingles' | 'frances';
  title: string;
  description: string;
  levels: string;
  image?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  photo?: string;
}

// ── Firestore: testimonials/{id} — submitted by users, moderated by admin ──
export interface TestimonialSubmission {
  id?: string;
  name: string;
  role: string;
  text: string;
  rating: number; // 1–5
  approved: boolean;
  createdAt: Date | string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HomeContent {
  hero: HeroContent;
  stats: Stat[];
  trustBar: string[];
  features: Feature[];
  coursesPreview: CoursePreview[];
  testimonials: Testimonial[];
  faq: FAQItem[];
  yesFactorPreview: {
    title: string;
    description: string;
    ctaText: string;
  };
  ctaFinal: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

// ── Firestore: siteConfig/yesFactor ──
export interface YESFactorWinner {
  name: string;
  category: string;
  place: string;
  year?: string;
}

export interface YESFactorContent {
  title: string;
  description: string;
  videoUrl?: string;
  winners: YESFactorWinner[];
  rulesUrl?: string;
  registrationStatus: 'open' | 'closed';
  registrationUrl?: string;
  seo: {
    title: string;
    description: string;
  };
}


// ── Firestore: siteConfig/courses ──
export interface CoursesContent {
  pageTitle: string;
  pageDescription: string;
  seo: {
    title: string;
    description: string;
  };
}

// ── Firestore: siteConfig/programs ──
export interface Program {
  id: string;
  title: string;
  subtitle?: string;      // audience: "Jóvenes-Adultos", "5-11 años"
  language: 'ingles' | 'frances' | 'ambos';
  tag?: string;           // "Intensivo", "Sábados", "Viernes", "YES Kids", "GEP"
  levels?: string;        // "6 Niveles (Año y Medio)"
  modality?: string;      // "Virtual y/o Presencial Trimestral"
  intensity?: string;     // "110 horas por nivel"
  schedules: string[];
  highlights?: string[];  // bullet points for special programs (GEP, etc.)
  materials?: string;
  showMaterials?: boolean; // si true, se muestra en el sitio
  price?: string;
  showPrice?: boolean;     // si true, se muestra en el sitio
  notes?: string;
  order: number;
  active: boolean;
}

// ── Firestore: siteConfig/contact ──
export interface OpeningHour {
  days: string;
  hours: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface ContactContent {
  whatsapp: string;
  paymentsUrl?: string;
  phone: string;
  email: string;
  address: string;
  neighborhood?: string;
  city: string;
  region: string;
  country: string;
  mapLink: string;
  mapEmbed?: string;
  openingHours: OpeningHour[];
  social: SocialLink[];
  seo: {
    title: string;
    description: string;
  };
}

// ── Firestore: leads/{id} ──
export interface Lead {
  name: string;
  phone: string;
  email: string;
  interest: 'ingles' | 'frances' | 'ambos';
  message: string;
  sourcePage: string;
  createdAt: Date | string;
}

// ── Firestore: blogPosts/{id} ──
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string; // HTML (TipTap) — legacy posts may contain Markdown
  excerpt: string;
  coverType?: 'image' | 'video'; // defaults to 'image'
  coverImage?: string;
  coverVideo?: string; // YouTube URL or direct video URL
  date: string;
  author: string;
  category: string;
  published: boolean;
  type: 'blog' | 'noticia';
  expiresAt?: string; // ISO date — solo para noticias, filtro de visualización
}

export interface BlogContent {
  title: string;
  description: string;
  seo: {
    title: string;
    description: string;
  };
}
