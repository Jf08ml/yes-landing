'use client';

import { motion } from 'framer-motion';

interface CTAFinalProps {
  title: string;
  subtitle: string;
  ctaText: string;
  whatsapp: string;
}

export default function CTAFinal({ title, subtitle, ctaText, whatsapp }: CTAFinalProps) {
  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quiero solicitar una clase demo en YES Institute')}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-blue-950 py-20 sm:py-24">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-surface-dark font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
            >
              📞 {ctaText}
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
            >
              💬 Escríbenos por WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
