import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBlogPosts, fetchNoticias, fetchBlogContent } from '@/lib/content';
import Section from '@/components/ui/Section';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchBlogContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

export default async function BlogPage() {
  const [blogs, noticias, content] = await Promise.all([
    fetchBlogPosts(),
    fetchNoticias(),
    fetchBlogContent(),
  ]);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Blog &amp; Noticias
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>
      </div>

      {/* ── Noticias ── */}
      {noticias.length > 0 && (
        <Section>
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-block w-1 h-6 rounded-full" style={{ background: '#ED1118' }} />
            <h2 className="text-2xl font-bold text-text">Noticias</h2>
            <span className="text-sm text-text-light">{noticias.length} publicada{noticias.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia, i) => (
              <article
                key={noticia.id}
                className={`group relative flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {noticia.coverImage && (
                  <Link href={`/blog/${noticia.slug}`} className="block aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={noticia.coverImage}
                      alt={noticia.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                      style={{ background: '#ED1118' }}
                    >
                      Noticia
                    </span>
                    {noticia.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-text-light">
                        {noticia.category}
                      </span>
                    )}
                    {noticia.expiresAt && (
                      <span className="ml-auto text-[10px] text-text-light">
                        Hasta {new Date(noticia.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <Link href={`/blog/${noticia.slug}`}>
                    <h3 className="font-bold text-text text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {noticia.title}
                    </h3>
                  </Link>
                  <p className="text-text-light text-sm line-clamp-2 flex-1 mb-4">
                    {noticia.excerpt}
                  </p>
                  <Link
                    href={`/blog/${noticia.slug}`}
                    className="text-sm font-bold text-primary flex items-center gap-1 group/link"
                  >
                    Ver noticia
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* ── Blog ── */}
      <Section className={noticias.length > 0 ? 'bg-surface' : 'bg-white'}>
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-block w-1 h-6 rounded-full bg-primary" />
          <h2 className="text-2xl font-bold text-text">Blog</h2>
          <span className="text-sm text-text-light">{blogs.length} artículo{blogs.length !== 1 ? 's' : ''}</span>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article key={post.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] relative overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-primary text-4xl">
                      📝
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                      {post.category}
                    </span>
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <time className="text-xs text-text-light mb-2 font-medium">
                    {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-bold text-text text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-text-light text-sm line-clamp-3 flex-1 mb-4">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-bold text-primary flex items-center gap-1 group/link"
                  >
                    Leer artículo
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="text-text-light">Próximamente más artículos.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
