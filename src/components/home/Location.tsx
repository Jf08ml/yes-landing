import Section from '@/components/ui/Section';
import type { ContactContent } from '@/types';

interface LocationProps {
  contact: ContactContent;
}

export default function Location({ contact }: LocationProps) {
  const waLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre los cursos de YES Institute')}`;

  return (
    <Section id="ubicacion">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Sede en <span className="text-primary">Neiva, Huila</span>
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          Visítanos en nuestras instalaciones.
          Atendemos de lunes a sábado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 h-[300px] lg:h-full min-h-[300px] bg-gray-100">
          {contact.mapEmbed ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-text-light">
              <a
                href={contact.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                📍 Ver en Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 text-text">📍 Dirección</h3>
            <p className="text-text-light">
              {contact.address}<br />
              {contact.city}, {contact.region} — Colombia
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 text-text">🕐 Horarios</h3>
            <ul className="space-y-1">
              {contact.openingHours.map((oh, i) => (
                <li key={i} className="text-text-light text-sm">
                  <span className="font-medium text-text">{oh.days}:</span> {oh.hours}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={contact.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              📍 Cómo llegar
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
