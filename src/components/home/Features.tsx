'use client';

import { motion } from 'framer-motion';
import { MessageCircle, GraduationCap, Users, Calendar, Building2, type LucideIcon } from 'lucide-react';
import Section from '@/components/ui/Section';
import type { Feature } from '@/types';

const ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  '🗣️': { icon: MessageCircle, color: 'text-blue-500' },
  '🎓': { icon: GraduationCap, color: 'text-yellow-500' },
  '👨‍🏫': { icon: Users,         color: 'text-teal-500'  },
  '📅': { icon: Calendar,       color: 'text-orange-500'},
  '🏛️': { icon: Building2,      color: 'text-indigo-500'},
};

function FeatureIcon({ emoji }: { emoji: string }) {
  const mapped = ICON_MAP[emoji];
  if (mapped) {
    const Icon = mapped.icon;
    return <Icon className={`w-9 h-9 ${mapped.color}`} strokeWidth={1.8} />;
  }
  return <span className="text-4xl">{emoji}</span>;
}

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
            <div className="mb-4"><FeatureIcon emoji={feature.icon} /></div>
            <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-text-light text-sm leading-relaxed text-justify">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
