import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPostBySlug, fetchBlogPosts } from '@/lib/content';
import Section from '@/components/ui/Section';

export const revalidate = 300;

/**
 * Detecta si la URL apunta a un archivo de video directo (mp4, webm, etc.)
 * frente a un embed (YouTube, Vimeo, iframe). Ignora el query string para
 * soportar URLs de Firebase Storage que llevan tokens (`?alt=media&token=…`).
 */
function isDirectVideoFile(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return /\.(mp4|webm|ogg|ogv|mov|m4v)$/.test(path);
}

// Dynamic routes for build time
export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: 'Nota no encontrada' };

  return {
    title: `${post.title} | Blog YES Institute`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="pt-32 pb-24">
      {/* Post Header */}
      <header className="max-w-4xl mx-auto px-4 mb-12 sm:mb-16">
        <Link 
          href="/blog" 
          className="text-sm font-bold text-primary hover:underline mb-8 inline-block flex items-center gap-2"
        >
          ← Regresar al blog
        </Link>
        
        <div className="mb-6 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <span className="bg-primary text-white px-3 py-1 rounded-full">
            {post.category}
          </span>
          <time className="text-text-light">
            {new Date(post.date).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </time>
          <span className="text-text-lighter">•</span>
          <span className="text-text-light">Por {post.author}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text leading-tight mb-8">
          {post.title}
        </h1>
        
        <p className="text-xl text-text-light leading-relaxed font-medium italic border-l-4 border-secondary pl-6">
          {post.excerpt}
        </p>
      </header>

      {/* Featured media */}
      {(post.coverImage || post.coverVideo) && (
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="aspect-[16/9] relative rounded-3xl overflow-hidden shadow-2xl bg-black">
            {post.coverType === 'video' && post.coverVideo ? (
              isDirectVideoFile(post.coverVideo) ? (
                // Archivo de video directo → reproductor con sonido (no muteado)
                <video
                  src={post.coverVideo}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <iframe
                  src={
                    post.coverVideo.includes('youtube.com/watch')
                      ? `https://www.youtube.com/embed/${new URLSearchParams(post.coverVideo.split('?')[1]).get('v')}`
                      : post.coverVideo.includes('youtu.be')
                        ? `https://www.youtube.com/embed/${post.coverVideo.split('/').pop()}`
                        : post.coverVideo
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Post Content */}
      <Section className="bg-white py-0">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-primary max-w-none
            prose-headings:text-text prose-headings:font-bold
            prose-p:text-text-light prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-primary prose-blockquote:text-text-light
            prose-img:rounded-2xl prose-img:shadow-md
            prose-strong:text-text
          ">
            {post.content.trim().startsWith('<') ? (
              // HTML desde TipTap
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              // Markdown legacy
              post.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                if (line.trim() === '') return <div key={i} className="h-4" />;
                if (line.startsWith('* ')) return <li key={i}>{line.replace('* ', '')}</li>;
                if (line.match(/^\d\./)) return <li key={i} className="list-decimal ml-6">{line.replace(/^\d\./, '')}</li>;
                return <p key={i}>{line}</p>;
              })
            )}
          </div>
        </div>
      </Section>

      {/* Footer / CTA */}
      <footer className="mt-24 bg-surface py-24 px-4 text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-text mb-6">¿Te gustó este artículo?</h2>
          <p className="text-text-light text-lg mb-12">
            Compártelo con alguien que esté aprendiendo o suscríbete a nuestros programas de formación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contacto" 
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl"
            >
              Consultar programas
            </Link>
            <Link 
              href="/blog" 
              className="bg-white border border-gray-200 text-text font-bold px-8 py-4 rounded-xl transition-all hover:bg-gray-50"
            >
              Más artículos
            </Link>
          </div>
        </div>
      </footer>
    </article>
  );
}
