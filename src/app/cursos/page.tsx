import type { Metadata } from 'next';
import { fetchCoursesContent } from '@/lib/content';
import Section from '@/components/ui/Section';
import LeadForm from '@/components/forms/LeadForm';

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
  const data = await fetchCoursesContent();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573133973411';
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los cursos de YES Institute')}`;

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {data.pageTitle}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {data.pageDescription}
          </p>
        </div>
      </div>

      {/* Courses */}
      {data.courses.map((course) => (
        <Section key={course.id} id={course.language} className={course.language === 'frances' ? 'bg-surface' : ''}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course header */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{course.language === 'ingles' ? '🇺🇸' : '🇫🇷'}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text">{course.title}</h2>
                  <span className="text-sm text-primary font-medium">Niveles {course.levels}</span>
                </div>
              </div>
              <p className="text-text-light max-w-3xl mb-2">{course.description}</p>
              <p className="text-sm text-primary font-semibold">🎓 {course.certification}</p>
            </div>

            {/* Modalities */}
            {course.modalities.map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <h3 className="text-lg font-bold text-text mb-2">{mod.name}</h3>
                <p className="text-text-light text-sm mb-4">{mod.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-text-light uppercase tracking-wider">⏱️ Duración: {mod.duration}</p>
                  {mod.schedules.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm bg-surface rounded-lg px-3 py-2">
                      <span className="text-text font-medium">{s.name}</span>
                      <span className="text-text-light">{s.hours}</span>
                    </div>
                  ))}
                </div>
                {mod.price && (
                  <p className="text-primary font-bold text-lg">{mod.price}</p>
                )}
              </div>
            ))}

            {/* Benefits */}
            <div className="lg:col-span-3">
              <h3 className="font-bold text-text mb-3">✅ Beneficios</h3>
              <div className="flex flex-wrap gap-2">
                {course.benefits.map((b, i) => (
                  <span key={i} className="text-sm bg-primary/5 text-primary font-medium px-3 py-1.5 rounded-full">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-100 mb-8">
            Solicita tu clase demo gratuita y conoce nuestra metodología.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contacto" className="bg-secondary hover:bg-secondary-dark text-surface-dark font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105">
              📞 Solicitar clase demo
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Lead form */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text text-center mb-8">
            Solicita más información
          </h2>
          <LeadForm sourcePage="cursos" />
        </div>
      </Section>
    </>
  );
}
