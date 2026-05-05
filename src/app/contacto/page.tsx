import type { Metadata } from 'next';
import { fetchContactContent } from '@/lib/content';
import Section from '@/components/ui/Section';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const contact = await fetchContactContent();
  return {
    title: contact.seo.title,
    description: contact.seo.description,
    openGraph: {
      title: contact.seo.title,
      description: contact.seo.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContactPage() {
  const contact = await fetchContactContent();
  const whatsapp = contact.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los cursos de YES Institute')}`;

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            ¿Buscas clases de inglés en Neiva?
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Escríbenos y te asesoraremos sobre el curso ideal para ti. ¡Tu clase demo es gratis!
          </p>
        </div>
      </div>

      <Section>
        <div className="max-w-2xl mx-auto">
          {/* Contact info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text mb-6">Información de contacto</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold text-text">Dirección</p>
                  <p className="text-text-light text-sm">
                    {contact.address}<br />
                    {contact.city}, {contact.region} — Colombia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-text">Teléfono</p>
                  <p className="text-text-light text-sm">{contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />
                <div>
                  <p className="font-semibold text-text">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-primary text-sm hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 shrink-0 text-yellow-500" />
                <div>
                  <p className="font-semibold text-text">Horarios</p>
                  {contact.openingHours.map((oh, i) => (
                    <p key={i} className="text-text-light text-sm">
                      {oh.days}: {oh.hours}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" /> Escríbenos por WhatsApp
              </a>
              {contact.mapLink && (
                <a
                  href={contact.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  <MapPin className="w-4 h-4" /> Cómo llegar
                </a>
              )}
            </div>

            {/* Map */}
            {contact.mapEmbed && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[250px] mt-6">
                <iframe
                  src={contact.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación YES Institute en Neiva"
                />
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
