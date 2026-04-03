import { HomeContent, CoursesContent, Program, ContactContent, YESFactorContent, BlogPost, BlogContent } from '@/types';

export const mockHome: HomeContent = {
  hero: {
    title: 'Aprende Inglés y Francés en Neiva',
    subtitle:
      'Desde 1993 formando huilenses con metodología comunicativa 70/30. Clases presenciales en Neiva.',
    ctaText: 'Solicita tu clase demo',
    ctaWhatsappText: 'Escríbenos por WhatsApp',
  },
  stats: [
    { value: '32+', label: 'Años de experiencia' },
    { value: '30,000+', label: 'Estudiantes formados' },
    { value: 'B1', label: 'Certificación garantizada' },
    { value: '70/30', label: 'Método comunicativo' },
  ],
  trustBar: [
    'Presencial en Neiva',
    'Niveles A1 – C1',
    'Licencia MEN No. 1598',
  ],
  features: [
    {
      icon: '🗣️',
      title: 'Método Comunicativo 70/30',
      description:
        'El alumno participa el 70% del tiempo en clase. Cursos 100% conversacionales desde nivel principiante hasta avanzado.',
    },
    {
      icon: '🎓',
      title: 'Certificación Garantizada',
      description:
        'Certificamos nivel B1 del Marco Común Europeo de Referencia a quienes completen la programación académica.',
    },
    {
      icon: '👨‍🏫',
      title: 'Profesores Certificados',
      description:
        'Equipo docente con competencias lingüísticas certificadas y pasión por la enseñanza de idiomas.',
    },
    {
      icon: '📅',
      title: 'Horarios Flexibles',
      description:
        'Intensivos entre semana, semestrales los sábados o clases personalizadas. Adaptamos el horario a tu vida.',
    },
    {
      icon: '🏛️',
      title: 'Instalaciones Modernas',
      description:
        'Sede propia en el barrio Quirinal, Neiva. Aulas equipadas con tecnología para una experiencia de aprendizaje óptima.',
    },
  ],
  coursesPreview: [
    {
      id: 'ingles',
      language: 'ingles',
      title: 'Cursos de Inglés',
      description:
        'Desde principiante hasta avanzado. Modalidades intensiva, semestral y personalizada con certificación B1 garantizada.',
      levels: 'A1 – C1',
    },
    {
      id: 'frances',
      language: 'frances',
      title: 'Cursos de Francés',
      description:
        'Aprende francés con profesores especializados. Ideal para estudios, trabajo o viajes a países francófonos.',
      levels: 'A1 – B2',
    },
  ],
  faq: [
    {
      question: '¿Qué niveles de inglés ofrecen?',
      answer:
        'Ofrecemos todos los niveles del Marco Común Europeo: desde A1 (principiante) hasta C1 (avanzado). Al completar nuestra programación académica, certificamos nivel B1 (intermedio alto).',
    },
    {
      question: '¿Cuánto dura un curso intensivo?',
      answer:
        'Los cursos intensivos entre semana tienen una duración de aproximadamente 3 meses por nivel, con clases de lunes a viernes.',
    },
    {
      question: '¿Qué es el método 70/30?',
      answer:
        'Es nuestro método comunicativo donde el alumno participa el 70% del tiempo en clase. Las clases son 100% conversacionales, usando estrategias naturales para la adquisición del lenguaje.',
    },
    {
      question: '¿Puedo solicitar una clase demo?',
      answer:
        '¡Claro! Ofrecemos una clase demo gratuita para que conozcas nuestra metodología. Contáctanos por WhatsApp o llámanos para agendar.',
    },
    {
      question: '¿Dónde están ubicados?',
      answer:
        'Nuestra sede está en la esquina de la Carrera 7 con Calle 17A, barrio Quirinal, Neiva (Huila). Atendemos de lunes a sábado de 6:00 am a 8:30 pm.',
    },
  ],
  yesFactorPreview: {
    title: 'THE YES FACTOR',
    description: 'Nuestro famoso concurso de canto en inglés donde el talento de nuestros estudiantes brilla en el escenario.',
    ctaText: 'Ver ganadores e inscripciones',
  },
  ctaFinal: {
    title: '¿Listo para empezar a hablar inglés o francés?',
    subtitle:
      'Solicita tu clase demo gratuita y descubre por qué más de 30 mil estudiantes han confiado en YES.',
    ctaText: 'Solicita tu clase demo',
  },
  seo: {
    title: 'Clases de Inglés y Francés en Neiva | YES Institute',
    description:
      'YES Institute: clases de inglés y francés en Neiva, Huila. Más de 32 años de experiencia, método comunicativo 70/30, certificación B1 garantizada.',
  },
};

export const mockCourses: CoursesContent = {
  pageTitle: 'Cursos de Inglés y Francés en Neiva',
  pageDescription:
    'Conoce nuestra oferta académica. Somos garantía en el aprendizaje del Inglés y Francés con certificación B1 del Marco Común Europeo.',
  seo: {
    title: 'Cursos de Inglés y Francés en Neiva | YES Institute',
    description:
      'Cursos de inglés y francés en Neiva, Huila. Modalidades intensiva, semestral y personalizada. Certificación B1 garantizada.',
  },
};

// Programs are created and managed exclusively from the admin panel.
// This empty array is just a fallback when Firebase is not configured.
export const mockPrograms: Program[] = [];

export const mockContact: ContactContent = {
  whatsapp: '573133973411',
  paymentsUrl: 'https://www.mipagoamigo.com/MPA_WebSite/ServicePayments/StartPayment?id=4298&searchedCategoryId=&searchedAgreementName=YES%20LTDA%20YOUR%20E',
  phone: '+57 313 3973411',
  email: 'contactenos@yes.edu.co',
  address: 'Carrera 7 con Calle 17A, esquina, Barrio Quirinal',
  neighborhood: 'Quirinal',
  city: 'Neiva',
  region: 'Huila',
  country: 'CO',
  mapLink: 'https://maps.google.com/?q=Instituto+YES+Neiva+Huila',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.123!2d-75.281!3d2.934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sInstituto+YES!5e0!3m2!1ses!2sco!4v1',
  openingHours: [
    { days: 'Lunes a Viernes', hours: '6:00 am – 8:30 pm' },
    { days: 'Sábados', hours: '8:00 am – 6:00 pm' },
  ],
  social: [
    { platform: 'facebook', url: 'https://www.facebook.com/institutoyes/', label: 'Facebook' },
    { platform: 'instagram', url: 'https://www.instagram.com/yesinstitute/', label: 'Instagram' },
    { platform: 'tiktok', url: 'https://www.tiktok.com/@yesinstitute', label: 'TikTok' },
    { platform: 'youtube', url: 'https://www.youtube.com/channel/UCfvzDmamWvhdZubng7YRzfQ', label: 'YouTube' },
  ],
  seo: {
    title: 'Contacto | YES Institute — Clases de Inglés en Neiva',
    description:
      '¿Buscas clases de inglés en Neiva? Contáctanos. Estamos en el Barrio Quirinal, Neiva, Huila. WhatsApp: +57 313 3973411. Clase demo gratuita.',
  },
};

export const mockYESFactor: YESFactorContent = {
  title: 'THE YES FACTOR',
  description: 'THE YES FACTOR es el concurso de canto en inglés más esperado de Neiva. Durante años, hemos brindado un espacio para que nuestros estudiantes de todas las edades demuestren su talento, pierdan el miedo escénico y practiquen su pronunciación de una forma divertida y artística.',
  videoUrl: 'https://yes.edu.co/wp-content/uploads/2023/06/YES-Historia-2023.mp4',
  winners: [
    { name: 'Karen Andrea Ramos', category: 'YES FACTOR TEENS', place: '1st Place' },
    { name: 'Ivonne Rebolledo', category: 'YES FACTOR TEENS', place: '2nd Place' },
    { name: 'Luis Leiva', category: 'YES FACTOR TEENS', place: '3rd Place' },
    { name: 'Julian Romero Laverde', category: 'YES FACTOR KIDS', place: '1st Place' },
  ],
  rulesUrl: 'https://yes.edu.co/wp-content/uploads/2023/03/DESCRIPCION-DEL-CONCURSO-DE-CANTO-EN-INGLES-YES-FACTOR.pdf',
  registrationStatus: 'closed',
  seo: {
    title: 'YES Factor | Concurso de Canto en Inglés en Neiva | YES Institute',
    description: 'Conoce THE YES FACTOR, el concurso de canto en inglés del Instituto YES. Ganadores, categorías y cómo participar en el evento más talentoso de Huila.',
  },
};

export const mockBlogPosts: BlogPost[] = [
  // ── Noticias ──
  {
    id: 'n1',
    slug: 'inscripciones-abiertas-2025',
    title: 'Inscripciones abiertas para el nuevo semestre 2025',
    excerpt: 'Ya están disponibles los cupos para los cursos de inglés y francés del primer semestre 2025. Reserva tu lugar y obtén tu clase demo gratuita.',
    content: `# Inscripciones abiertas — Semestre 2025\n\nNos complace anunciar que los cupos para el primer semestre 2025 ya están disponibles.\n\n## ¿Qué modalidades hay disponibles?\n\n* Intensivo entre semana (Lunes a Viernes)\n* Semestral los sábados\n* Personalizado\n\n¡Solicita tu clase demo gratuita hoy!`,
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    date: '2025-01-10',
    author: 'Admin YES',
    category: 'Institucional',
    published: true,
    type: 'noticia',
  },
  {
    id: 'n2',
    slug: 'yes-factor-2025-convocatoria',
    title: 'YES Factor 2025 — ¡Abierta la convocatoria!',
    excerpt: 'El concurso de canto en inglés más esperado del año regresa. Inscribe a tu hijo o inscríbete tú mismo antes del 30 de marzo.',
    content: `# YES Factor 2025\n\nEl evento más talentoso de Neiva regresa con más categorías y premios.\n\n## Categorías\n\n* YES Factor Kids (6–12 años)\n* YES Factor Teens (13–17 años)\n* YES Factor Adults (18+ años)\n\nFecha límite de inscripción: **30 de marzo de 2025**.`,
    coverImage: 'https://images.unsplash.com/photo-1546519638405-a9d1b634a69f?auto=format&fit=crop&q=80&w=800',
    date: '2025-01-15',
    author: 'Admin YES',
    category: 'Eventos',
    published: true,
    type: 'noticia',
    expiresAt: '2025-03-31',
  },
  {
    id: 'n3',
    slug: 'nuevos-horarios-sabatinos',
    title: 'Nuevos horarios sabatinos disponibles',
    excerpt: 'Ampliamos nuestra oferta de horarios los sábados para que nadie se quede sin aprender inglés o francés.',
    content: `# Nuevos horarios sabatinos\n\nEntendemos que muchos de nuestros estudiantes trabajan entre semana. Por eso ampliamos los grupos de los sábados.\n\n## Nuevos horarios\n\n* 8:00 am – 10:00 am\n* 10:00 am – 12:00 pm\n* 2:00 pm – 4:00 pm\n\nCupos limitados. ¡Escríbenos ya!`,
    coverImage: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=800',
    date: '2025-01-20',
    author: 'Admin YES',
    category: 'Institucional',
    published: true,
    type: 'noticia',
  },
  // ── Blogs ──
  {
    id: 'b1',
    slug: 'como-aprender-ingles-rapido',
    title: '5 Consejos para aprender inglés más rápido',
    excerpt: '¿Quieres acelerar tu aprendizaje? Aquí te damos los mejores tips basados en nuestro método 70/30.',
    content: `# 5 Consejos para aprender inglés más rápido\n\nAprender un nuevo idioma es un viaje emocionante. En **YES Institute** hemos perfeccionado un método que prioriza la comunicación.\n\n1. **Sumérgete en el idioma**: Cambia el idioma de tu celular y mira series con subtítulos en inglés.\n2. **Practica hablar**: El método 70/30 se trata de hablar. No tengas miedo a equivocarte.\n3. **Escucha música y traduce**: Una forma divertida de ampliar vocabulario.\n4. **Usa aplicaciones de refuerzo**: Herramientas como Duolingo son geniales para los ratos libres.\n5. **Ven a nuestras clases presenciales**: Nada supera la interacción real con profesores expertos.`,
    coverImage: 'https://images.unsplash.com/photo-1543167664-402b3a39733c?auto=format&fit=crop&q=80&w=800',
    date: '2024-02-15',
    author: 'Admin YES',
    category: 'Consejos',
    published: true,
    type: 'blog',
  },
  {
    id: 'b2',
    slug: 'preparacion-examenes-internacionales',
    title: 'Cómo prepararse para exámenes internacionales (TOEFL, IELTS)',
    excerpt: 'Descubre las claves para obtener el puntaje que necesitas para tus metas internacionales.',
    content: `# Cómo prepararse para exámenes internacionales\n\nCertificar tu nivel de inglés es vital para procesos migratorios o becas.\n\n* **Conoce el formato del examen**: Cada examen es diferente.\n* **Simulacros**: Haz exámenes de práctica con tiempo real.\n* **Refuerza tu vocabulario académico**: No es lo mismo el inglés de la calle que el del TOEFL.\n\nEn **YES Institute** tenemos cursos específicos de preparación. ¡Contáctanos!`,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    date: '2024-02-10',
    author: 'Coordinación Académica',
    category: 'Académico',
    published: true,
    type: 'blog',
  },
];

export const mockBlogContent: BlogContent = {
  title: 'Blog & Noticias',
  description: 'Noticias del instituto, consejos para aprender idiomas y más.',
  seo: {
    title: 'Blog & Noticias | YES Institute Neiva',
    description: 'Mantente al día con las noticias de YES Institute y aprende con nuestros artículos sobre inglés y francés en Neiva.',
  },
};
