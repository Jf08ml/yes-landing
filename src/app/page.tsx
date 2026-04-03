import type { Metadata } from 'next';
import { fetchHomeContent, fetchContactContent, fetchBlogPosts, fetchNoticias } from '@/lib/content';
import { buildLocalBusinessJsonLd, buildFAQJsonLd, buildCourseJsonLd } from '@/lib/seo';
import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import Features from '@/components/home/Features';
import CoursesPreview from '@/components/home/CoursesPreview';
import Location from '@/components/home/Location';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import CTAFinal from '@/components/home/CTAFinal';
import YESFactorSection from '@/components/home/YESFactorSection';
import BlogPreview from '@/components/home/BlogPreview';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeContent();
  return {
    title: home.seo.title,
    description: home.seo.description,
    openGraph: {
      title: home.seo.title,
      description: home.seo.description,
    },
  };
}

export default async function HomePage() {
  const [home, contact, blogPosts, noticias] = await Promise.all([
    fetchHomeContent(),
    fetchContactContent(),
    fetchBlogPosts(),
    fetchNoticias(),
  ]);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || contact.whatsapp || '573133973411';

  const localBusinessJsonLd = buildLocalBusinessJsonLd(contact);
  const faqJsonLd = buildFAQJsonLd(home.faq);
  const courseEnJsonLd = buildCourseJsonLd(
    'ingles',
    'Cursos de Inglés en Neiva — YES Institute',
    'Cursos de inglés en Neiva con método comunicativo 70/30. Niveles A1-C1. Certificación B1 garantizada.'
  );
  const courseFrJsonLd = buildCourseJsonLd(
    'frances',
    'Cursos de Francés en Neiva — YES Institute',
    'Cursos de francés en Neiva. Profesores especializados. Preparación para exámenes DELF.'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseEnJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseFrJsonLd) }}
      />

      <Hero
        hero={home.hero}
        noticias={noticias}
        whatsapp={whatsapp}
      />
      <TrustBar trustItems={home.trustBar} stats={home.stats} />
      <Features features={home.features} />
      <CoursesPreview />
      <Location contact={contact} />
      <Testimonials />
      <YESFactorSection preview={home.yesFactorPreview} />
      <BlogPreview posts={blogPosts} />
      <FAQ faq={home.faq} />
      <CTAFinal
        title={home.ctaFinal.title}
        subtitle={home.ctaFinal.subtitle}
        ctaText={home.ctaFinal.ctaText}
        whatsapp={whatsapp}
      />
    </>
  );
}
