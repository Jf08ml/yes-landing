'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import type { Feature } from '@/types';

interface FeaturesProps {
  features: Feature[];
}

export default function Features({ features }: FeaturesProps) {
  return (
    <Section id="features">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          ¿Por qué elegir <span className="text-primary">YES</span>?
        </h2>
        <p className="text-text-light max-w-2xl mx-auto">
          Más de 32 años nos respaldan como el instituto líder de idiomas en Neiva, Huila.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="group bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-text-light text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
