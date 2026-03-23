import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPostBySlug, fetchBlogPosts } from '@/lib/content';
import Section from '@/components/ui/Section';

export const revalidate = 300;

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

      {/* Featured Image */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="aspect-[21/9] relative rounded-3xl overflow-hidden shadow-2xl">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>
      </div>

      {/* Post Content */}
      <Section className="bg-white py-0">
        <div className="max-w-3xl mx-auto">
          {/* Content Render - Note: In a real app we'd use react-markdown here. 
              For now, simple split by lines since Markdown parser isn't installed. */}
          <div className="prose prose-lg prose-primary max-w-none">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('### ', '')}</h3>;
              if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mb-4">{line.replaceAll('**', '')}</p>;
              if (line.trim() === '') return <div key={i} className="h-4" />;
              if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-2">{line.replace('* ', '')}</li>;
              if (line.match(/^\d\./)) return <li key={i} className="ml-4 mb-2 list-item list-decimal" style={{ marginLeft: '1.5rem'}}>{line.replace(/^\d\./, '')}</li>;
              
              return <p key={i} className="text-text-light leading-relaxed mb-4 text-lg">{line}</p>;
            })}
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
