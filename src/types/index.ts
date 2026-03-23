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

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HomeContent {
  hero: HeroContent;
  announcements?: { text: string; url?: string }[];
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
export interface CourseSchedule {
  name: string;
  days: string;
  hours: string;
}

export interface CourseModality {
  id: string;
  name: string;
  description: string;
  duration: string;
  schedules: CourseSchedule[];
  price?: string;
}

export interface Course {
  id: string;
  language: 'ingles' | 'frances';
  title: string;
  description: string;
  levels: string;
  certification: string;
  modalities: CourseModality[];
  benefits: string[];
  image?: string;
}

export interface CoursesContent {
  pageTitle: string;
  pageDescription: string;
  courses: Course[];
  seo: {
    title: string;
    description: string;
  };
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

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown
  excerpt: string;
  coverImage?: string;
  date: string;
  author: string;
  category: string;
  published: boolean;
}

export interface BlogContent {
  title: string;
  description: string;
  seo: {
    title: string;
    description: string;
  };
}
