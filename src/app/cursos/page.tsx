import type { Metadata } from 'next';
import { fetchCoursesContent, fetchPrograms, fetchContactContent } from '@/lib/content';
import ProgramsGrid from '@/components/courses/ProgramsGrid';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const courses = await fetchCoursesContent();
  return {
    title: courses.seo.title,
    description: courses.seo.description,
    openGraph: {
      title: courses.seo.title,
      description: courses.seo.description,
    },
  };
}

export default async function CoursesPage() {
  const [data, programs, contact] = await Promise.all([
    fetchCoursesContent(),
    fetchPrograms(),
    fetchContactContent(),
  ]);

  const whatsapp = contact.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573133973411';
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los cursos de YES Institute')}`;

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">
            Oferta académica
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            {data.pageTitle}
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {data.pageDescription}
          </p>
        </div>
      </div>

      {/* Programs */}
      <ProgramsGrid programs={programs} waLink={waLink} />

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
            ¿Listo para empezar?
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Solicita tu clase demo gratuita y conoce nuestra metodología.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="bg-white text-primary font-black px-8 py-4 rounded-xl text-base transition-all hover:scale-105 hover:shadow-lg"
            >
              Solicitar clase demo
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
