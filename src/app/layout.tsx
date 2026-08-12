import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import { buildOrganizationJsonLd } from '@/lib/seo';
import { fetchContactContent } from '@/lib/content';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yes.edu.co';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'YES Institute | Clases de Inglés y Francés en Neiva, Huila',
    template: '%s | YES Institute',
  },
  description:
    'Instituto de inglés y francés en Neiva, Huila. Más de 32 años de experiencia con método comunicativo 70/30. Certificación B1. ¡Solicita tu clase demo!',
  keywords: [
    'clases de inglés en Neiva',
    'instituto de inglés en Neiva',
    'clases de francés en Neiva',
    'curso de inglés en Neiva',
    'academia de idiomas Neiva',
    'YES Institute',
    'aprender inglés Neiva Huila',
    'cursos de francés Neiva',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITE_URL,
    siteName: 'YES Institute',
    title: 'YES Institute | Clases de Inglés y Francés en Neiva',
    description:
      'Aprende inglés y francés en Neiva con el método comunicativo 70/30. Más de 32 años formando profesionales bilingües.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'YES Institute — Clases de Inglés y Francés en Neiva',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YES Institute | Clases de Inglés y Francés en Neiva',
    description: 'Aprende inglés y francés en Neiva. Método comunicativo 70/30. ¡Solicita tu clase demo!',
  },
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = buildOrganizationJsonLd();
  const contact = await fetchContactContent();

  return (
    <html lang="es" className={inter.variable}>
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G35LG7CSQV"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-G35LG7CSQV');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header paymentsUrl={contact.paymentsUrl} placementTestUrl={contact.placementTestUrl} social={contact.social} />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat whatsapp={contact.whatsapp} />
      </body>
    </html>
  );
}
