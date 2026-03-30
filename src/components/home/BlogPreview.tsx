"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { BlogPost } from "@/types";

interface BlogPreviewProps {
  posts: BlogPost[];
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  return (
    <Section className="bg-white">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-text mb-4">
            Blog
          </h2>
          <p className="text-text-light text-lg">
            Consejos para tu aprendizaje, eventos institucionales y todo lo que
            necesitas saber sobre el mundo bilingüe.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-primary font-bold hover:underline flex items-center gap-2 group"
        >
          Ver blog & noticias
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(0, 3).map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group flex flex-col bg-surface rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="block aspect-[16/9] relative overflow-hidden"
            >
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl">
                  📝
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-white text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>
            </Link>

            <div className="p-6 flex flex-col flex-1">
              <time className="text-xs text-text-light mb-2">
                {new Date(post.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h3 className="text-xl font-bold text-text mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-text-light text-sm line-clamp-3 mb-6 flex-1">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-bold text-primary flex items-center gap-1 group/link"
              >
                Leer más
                <span className="group-hover/link:translate-x-1 transition-transform">
                  ›
                </span>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
