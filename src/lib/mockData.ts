import { HomeContent, CoursesContent, ContactContent, YESFactorContent, BlogPost, BlogContent } from '@/types';

export const mockHome: HomeContent = {
  hero: {
    title: 'Aprende Inglés y Francés en Neiva',
    subtitle:
      'Desde 1993 formando huilenses con metodología comunicativa 70/30. Clases presenciales en Neiva.',
    ctaText: 'Solicita tu clase demo',
    ctaWhatsappText: 'Escríbenos por WhatsApp',
  },
  announcementsDisplay: 'ticker' as const,
  announcements: [
    {
      text: '🎓 Inscripciones abiertas para el nuevo semestre',
      url: '/contacto',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    },
    {
      text: '🏆 YES Factor 2025 — ¡Participa y gana!',
      url: '/yes-factor',
      imageUrl: 'https://images.unsplash.com/photo-1546519638405-a9d1b634a69f?w=400&q=80',
    },
    {
      text: '📅 Nuevos horarios sabatinos disponibles',
      url: '/cursos',
      imageUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&q=80',
    },
  ],
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
  testimonials: [
    {
      name: 'María Fernanda López',
      role: 'Estudiante de Inglés Intensivo',
      text: 'Gracias a YES logré el nivel B1 en menos de un año. La metodología 70/30 te obliga a hablar desde el primer día. ¡Lo recomiendo totalmente!',
    },
    {
      name: 'Carlos Andrés Méndez',
      role: 'Profesional — Curso Personalizado',
      text: 'Necesitaba inglés para mi trabajo y YES me ofreció horarios flexibles. Los profesores son excelentes y las clases son muy dinámicas.',
    },
    {
      name: 'Laura Valentina Rojas',
      role: 'Estudiante de Francés',
      text: 'Siempre quise aprender francés y en YES encontré el mejor programa. En Neiva no hay otro instituto con esta calidad.',
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
  courses: [
    {
      id: 'ingles',
      language: 'ingles',
      title: 'Cursos de Inglés en Neiva',
      description:
        'Aprende inglés con el método comunicativo 70/30. Cursos 100% conversacionales para todos los niveles.',
      levels: 'A1 – C1',
      certification:
        'Certificamos nivel B1 (intermedio alto) del Marco Común Europeo de Referencia',
      modalities: [
        {
          id: 'intensivo',
          name: 'Intensivo entre semana',
          description:
            'Ideal para quienes buscan avanzar rápido. Clases diarias de lunes a viernes.',
          duration: '~3 meses por nivel',
          schedules: [
            { name: 'Mañana', days: 'Lunes a Viernes', hours: '6:00 am – 8:00 am' },
            { name: 'Medio día', days: 'Lunes a Viernes', hours: '10:00 am – 12:00 pm' },
            { name: 'Tarde', days: 'Lunes a Viernes', hours: '4:00 pm – 6:00 pm' },
            { name: 'Noche', days: 'Lunes a Viernes', hours: '6:00 pm – 8:00 pm' },
          ],
        },
        {
          id: 'semestral',
          name: 'Semestral (sábados)',
          description:
            'Perfecto para quienes trabajan o estudian entre semana. Clases los sábados.',
          duration: '~6 meses por nivel',
          schedules: [
            { name: 'Mañana', days: 'Sábados', hours: '8:00 am – 12:00 pm' },
            { name: 'Tarde', days: 'Sábados', hours: '2:00 pm – 6:00 pm' },
          ],
        },
        {
          id: 'personalizado',
          name: 'Personalizado',
          description:
            'Clases individuales o en grupos pequeños. Horarios a tu medida según tus necesidades.',
          duration: 'Flexible',
          schedules: [
            { name: 'A convenir', days: 'Lunes a Sábado', hours: 'Horario personalizado' },
          ],
        },
      ],
      benefits: [
        'Método comunicativo 70/30',
        'Profesores certificados',
        'Grupos reducidos',
        'Material didáctico incluido',
        'Certificación B1 garantizada',
        'Clase demo gratuita',
      ],
    },
    {
      id: 'frances',
      language: 'frances',
      title: 'Cursos de Francés en Neiva',
      description:
        'Aprende francés con profesores especializados. El único instituto en Neiva con programas completos de francés.',
      levels: 'A1 – B2',
      certification:
        'Certificamos nivel B1 del Marco Común Europeo de Referencia para las lenguas',
      modalities: [
        {
          id: 'intensivo',
          name: 'Intensivo entre semana',
          description: 'Avanza rápidamente con clases diarias.',
          duration: '~3 meses por nivel',
          schedules: [
            { name: 'Consultar', days: 'Lunes a Viernes', hours: 'Consultar disponibilidad' },
          ],
        },
        {
          id: 'semestral',
          name: 'Semestral (sábados)',
          description: 'Clases los sábados para quienes trabajan entre semana.',
          duration: '~6 meses por nivel',
          schedules: [
            { name: 'Consultar', days: 'Sábados', hours: 'Consultar disponibilidad' },
          ],
        },
      ],
      benefits: [
        'Profesores especializados en francés',
        'Metodología comunicativa',
        'Preparación para exámenes DELF',
        'Grupos reducidos',
        'Material incluido',
      ],
    },
  ],
  seo: {
    title: 'Cursos de Inglés y Francés en Neiva | YES Institute',
    description:
      'Cursos de inglés y francés en Neiva, Huila. Modalidades intensiva, semestral y personalizada. Certificación B1 garantizada.',
  },
};

export const mockContact: ContactContent = {
  whatsapp: '573133973411',
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
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/institutoyes/',
      label: 'Facebook',
    },
    {
      platform: 'youtube',
      url: 'https://www.youtube.com/channel/UCfvzDmamWvhdZubng7YRzfQ',
      label: 'YouTube',
    },
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
  {
    id: '1',
    slug: 'como-aprender-ingles-rapido',
    title: '5 Consejos para aprender inglés más rápido en 2024',
    excerpt: '¿Quieres acelerar tu aprendizaje? Aquí te damos los mejores tips basados en nuestro método 70/30.',
    content: `
# 5 Consejos para aprender inglés más rápido en 2024

Aprender un nuevo idioma es un viaje emocionante, pero a veces queremos ver resultados más rápido. En **YES Institute**, hemos perfeccionado un método que prioriza la comunicación. Aquí te dejamos nuestros consejos estrella:

1. **Sumérgete en el idioma**: Cambia el idioma de tu celular y mira series con subtítulos en inglés.
2. **Practica la producción y no solo la recepción**: El método 70/30 se trata de hablar. No tengas miedo a equivocarte.
3. **Escucha música y traduce**: Una forma divertida de ampliar vocabulario.
4. **Usa aplicaciones de refuerzo**: Herramientas como Duolingo son geniales para los ratos libres.
5. **Ven a nuestras clases presenciales**: Nada supera la interacción real con profesores expertos.

¡Inscríbete hoy y empieza tu camino a la fluidez!
    `,
    coverImage: 'https://images.unsplash.com/photo-1543167664-402b3a39733c?auto=format&fit=crop&q=80&w=800',
    date: '2024-02-15',
    author: 'Admin YES',
    category: 'Consejos',
    published: true,
  },
  {
    id: '2',
    slug: 'preparacion-examenes-internacionales',
    title: 'Cómo prepararse para exámenes internacionales (TOEFL, IELTS)',
    excerpt: 'Descubre las claves para obtener el puntaje que necesitas para tus metas internacionales.',
    content: `
# Cómo prepararse para exámenes internacionales

Certificar tu nivel de inglés es vital para procesos migratorios o becas. Aquí te contamos cómo lograrlo:

*   **Conoce el formato del examen**: Cada examen es diferente.
*   **Simulacros**: Haz exámenes de práctica con tiempo real.
*   **Refuerza tu vocabulario académico**: No es lo mismo el inglés de la calle que el del TOEFL.

En **YES Institute** tenemos cursos específicos de preparación. ¡Contáctanos!
    `,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    date: '2024-02-10',
    author: 'Coordinación Académica',
    category: 'Académico',
    published: true,
  }
];

export const mockBlogContent: BlogContent = {
  title: 'Blog de YES Institute',
  description: 'Noticias, consejos y eventos sobre el aprendizaje de idiomas en Neiva.',
  seo: {
    title: 'Blog | YES Institute Neiva | Aprender Inglés y Francés',
    description: 'Lee las últimas noticias y consejos para aprender inglés y francés en nuestro blog oficial.',
  },
};

