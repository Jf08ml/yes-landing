import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBlogPosts, fetchBlogContent } from '@/lib/content';
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
  const [posts, content] = await Promise.all([
    fetchBlogPosts(),
    fetchBlogContent(),
  ]);

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-surface border-b border-gray-100 py-16 sm:py-24 px-4 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black text-text mb-6">
            {content.title}
          </h1>
          <p className="text-text-light text-lg sm:text-xl max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>
        {/* Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <Section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col bg-white">
              <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] relative rounded-3xl overflow-hidden mb-6 shadow-md shadow-primary/5">
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
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    {post.category}
                  </span>
                </div>
              </Link>

              <div className="flex flex-col flex-1 pl-2">
                <time className="text-xs text-text-light mb-2 font-medium">
                  {new Date(post.date).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                <h2 className="text-xl sm:text-2xl font-bold text-text mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-text-light text-sm sm:text-base line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-bold text-primary flex items-center gap-1 group/link"
                >
                  Leer artículo completo
                  <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24">
            <span className="text-6xl mb-6 block">📭</span>
            <h3 className="text-xl font-bold text-text">Próximamente más artículos</h3>
            <p className="text-text-light">Estamos preparando nuevo contenido para ti.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
