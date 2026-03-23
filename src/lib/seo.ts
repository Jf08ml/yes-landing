import type { FAQItem, ContactContent } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yes.edu.co';

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    name: 'YES Institute',
    legalName: 'YES YOUR ENGLISH SERVICES SAS',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    foundingDate: '1993-04-23',
    description:
      'Instituto de educación no formal especializado en inglés y francés en Neiva, Huila. Más de 32 años de experiencia.',
    sameAs: [
      'https://www.facebook.com/institutoyes/',
      'https://www.youtube.com/channel/UCfvzDmamWvhdZubng7YRzfQ',
    ],
  };
}

export function buildLocalBusinessJsonLd(contact: ContactContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: 'YES Institute',
    legalName: 'YES YOUR ENGLISH SERVICES SAS',
    description:
      'Clases de inglés y francés en Neiva, Huila. Instituto de educación no formal con más de 32 años de experiencia. Método comunicativo 70/30.',
    url: SITE_URL,
    telephone: contact.phone,
    email: contact.email,
    foundingDate: '1993-04-23',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: contact.city,
      addressRegion: contact.region,
      addressCountry: contact.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 2.934,
      longitude: -75.281,
    },
    openingHoursSpecification: contact.openingHours.map((oh) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: oh.days,
      opens: oh.hours.split('–')[0]?.trim(),
      closes: oh.hours.split('–')[1]?.trim(),
    })),
    sameAs: contact.social.map((s) => s.url),
    priceRange: '$$',
    areaServed: {
      '@type': 'City',
      name: 'Neiva',
    },
  };
}

export function buildCourseJsonLd(
  language: string,
  title: string,
  description: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'YES Institute',
      url: SITE_URL,
    },
    inLanguage: language === 'ingles' ? 'en' : 'fr',
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceType: 'Presencial',
        serviceLocation: {
          '@type': 'Place',
          name: 'YES Institute — Sede Neiva',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Neiva',
            addressRegion: 'Huila',
            addressCountry: 'CO',
          },
        },
      },
    ],
  };
}

export function buildFAQJsonLd(faq: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
