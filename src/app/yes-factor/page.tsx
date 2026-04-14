import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, FileText, Star, Trophy } from 'lucide-react';
import { fetchYESFactorContent, fetchContactContent } from '@/lib/content';

import Section from '@/components/ui/Section';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchYESFactorContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export default async function YESFactorPage() {
  const [data, contact] = await Promise.all([
    fetchYESFactorContent(),
    fetchContactContent(),
  ]);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || contact.whatsapp;
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero inscribirme en el próximo YES Factor')}`;

  return (
    <div className="pt-20">
      {/* Hero */}
      {(data.backgroundImageDesktop || data.backgroundImageMobile) ? (
        <div className="w-full">
          <Image
            src={data.backgroundImageMobile || data.backgroundImageDesktop!}
            alt={data.title}
            width={0}
            height={0}
            sizes="100vw"
            priority
            className="md:hidden w-full h-auto block"
          />
          <Image
            src={data.backgroundImageDesktop || data.backgroundImageMobile!}
            alt={data.title}
            width={0}
            height={0}
            sizes="100vw"
            priority
            className="hidden md:block w-full h-auto"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary to-primary-dark py-10 sm:py-14 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="bg-secondary text-surface-dark text-xs font-black px-4 py-1.5 rounded-full mb-4 inline-block tracking-widest uppercase">
              Evento Anual
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{data.title}</h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-7">{data.description}</p>
            {data.registrationStatus === 'open' && (
              <a href={data.registrationUrl || waLink} target="_blank" rel="noopener noreferrer"
                className="bg-secondary hover:bg-secondary-dark text-surface-dark font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-2">
                <Mic className="w-5 h-5" /> Inscribirse ahora
              </a>
            )}
          </div>
        </div>
      )}

      {/* Video / Info */}
      <Section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-text mb-6">Mucho más que un concurso</h2>
            <p className="text-text-light mb-4">
              En YES Institute creemos que el arte es una de las mejores herramientas para el aprendizaje de idiomas. 
              <strong> The YES Factor</strong> no solo evalúa el talento vocal, sino también la dicción, entonación y confianza de nuestros estudiantes en el escenario.
            </p>
            <p className="text-text-light mb-6">
              Participan estudiantes de todas las edades en categorías Kids, Teens y Adults, frente a un jurado calificado y nuestra gran comunidad de Neiva.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {data.rulesUrl && (
                <a 
                  href={data.rulesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-bold hover:underline flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-blue-500" /> Descargar reglamento (PDF)
                </a>
              )}
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-2xl relative group">
            {data.videoUrl ? (
              <video 
                src={data.videoUrl} 
                className="w-full h-full object-cover" 
                controls
                poster="/yes-factor-poster.jpg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <Star className="w-16 h-16 text-yellow-400" />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Winners — agrupados por categoría */}
      {data.winners.length > 0 && (() => {
        // Derivar categorías únicas manteniendo el orden de aparición
        const categories = Array.from(new Set(data.winners.map(w => w.category).filter(Boolean)));
        return (
          <Section className="bg-surface">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text mb-4">Wall of Fame</h2>
              <p className="text-text-light">Recordamos a los talentos que han dejado huella en nuestras últimas ediciones.</p>
            </div>

            <div className="space-y-14">
              {categories.map((cat) => {
                const group = data.winners.filter(w => w.category === cat);
                return (
                  <div key={cat}>
                    {/* Cabecera de categoría */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white" style={{ background: '#323D6E' }}>
                        {cat}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Grid de ganadores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {group.map((winner, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center overflow-hidden flex flex-col"
                        >
                          {winner.image ? (
                            <div className="relative aspect-square w-full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="aspect-square w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <Trophy className="w-14 h-14 text-yellow-500 opacity-60" />
                            </div>
                          )}
                          <div className="p-5 flex flex-col flex-1">
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{winner.place}</p>
                            <h3 className="text-base font-bold text-text mb-1">{winner.name}</h3>
                            {winner.year && <p className="text-xs text-text-lighter mt-1">{winner.year}</p>}
                            {winner.videoUrl && (
                              <a
                                href={winner.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: '#ED1118' }}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                Ver audición
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })()}

      {/* Registration / CTA */}
      <Section className="bg-white">
        <div className="bg-surface border border-primary/10 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4">
            {data.registrationStatus === 'open' ? '¡Es tu momento de brillar!' : 'Próxima edición: Muy pronto'}
          </h2>
          <p className="text-text-light mb-8 max-w-xl mx-auto">
            {data.registrationStatus === 'open' 
              ? 'El formulario de inscripciones está abierto para todos los estudiantes activos.' 
              : 'Estamos preparando todo para la edición de este año. Síguenos en nuestras redes sociales para estar al tanto de las fechas de inscripción.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {data.registrationStatus === 'open' ? (
              <a href={data.registrationUrl || waLink} className="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors">
                Inscribirme al concurso
              </a>
            ) : (
              <a href={waLink} className="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors">
                Preguntar por fechas
              </a>
            )}
            <Link href="/" className="bg-white text-text font-bold px-8 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
