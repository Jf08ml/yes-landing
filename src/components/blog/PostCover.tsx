'use client';

import Image from 'next/image';

interface PostCoverProps {
  coverType?: 'image' | 'video';
  coverImage?: string;
  coverVideo?: string;
  title: string;
  /** Extra classes for the wrapper (aspect ratio, rounding, etc.) */
  className?: string;
  /** Show hover scale on image/thumbnail */
  hoverScale?: boolean;
}

function getYouTubeId(url: string): string | null {
  return (
    url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
    )?.[1] ?? null
  );
}

export default function PostCover({
  coverType,
  coverImage,
  coverVideo,
  title,
  className = 'aspect-[16/9] relative overflow-hidden',
  hoverScale = true,
}: PostCoverProps) {
  const scaleClass = hoverScale
    ? 'group-hover:scale-105 transition-transform duration-500'
    : '';

  // ── Video cover ──
  if (coverType === 'video' && coverVideo) {
    const ytId = getYouTubeId(coverVideo);

    if (ytId) {
      // YouTube → thumbnail + play overlay
      const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      return (
        <div className={className}>
          <Image
            src={thumb}
            alt={title}
            fill
            className={`object-cover ${scaleClass}`}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <svg
                className="w-6 h-6 ml-0.5"
                style={{ color: '#ED1118' }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>
      );
    }

    // Direct video file → reproductor real con sonido.
    // Detiene la propagación del clic para que los controles del video no
    // disparen la navegación del <Link> que envuelve la portada.
    return (
      <div
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <video
          src={coverVideo}
          className="w-full h-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  // ── Image cover ──
  if (coverImage) {
    return (
      <div className={className}>
        <Image
          src={coverImage}
          alt={title}
          fill
          className={`object-cover ${scaleClass}`}
        />
      </div>
    );
  }

  // ── Fallback ──
  return (
    <div className={`${className} bg-primary/10 flex items-center justify-center text-4xl`}>
      📝
    </div>
  );
}
