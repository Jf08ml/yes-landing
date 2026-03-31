'use client';

// ─── Floating language words — three visual tiers ────────────────────────────
//
//  1. GHOST   — very large, barely visible text (English / Français)
//  2. BADGE   — pill with glassmorphism + colored left border
//  3. AMBIENT — small plain words, low opacity, slight rotation
//
// All pointer-events-none, z-index -15 (above shader, below content)
// ─────────────────────────────────────────────────────────────────────────────

const RED  = '#ED1118';
const BLUE = '#323D6E';

interface Word {
  text: string;
  lang: 'en' | 'fr';
  tier: 'ghost' | 'badge' | 'ambient';
  x: string; y: string;
  size: number;
  rot: number;
  dur: number; delay: number;
}

const WORDS: Word[] = [
  // ── Ghost tier ──────────────────────────────────────────────────────────────
  { text: 'English',   lang: 'en', tier: 'ghost',   x: '0%',   y: '18%', size: 80,  rot: -6,  dur: 38, delay: 0   },
  { text: 'Français',  lang: 'fr', tier: 'ghost',   x: '55%',  y: '58%', size: 72,  rot: 4,   dur: 42, delay: 6   },
  { text: 'Bilingüe',  lang: 'fr', tier: 'ghost',   x: '30%',  y: '82%', size: 60,  rot: -3,  dur: 35, delay: 14  },

  // ── Badge tier ──────────────────────────────────────────────────────────────
  { text: 'Hello!',            lang: 'en', tier: 'badge', x: '4%',  y: '10%', size: 13, rot: -2,  dur: 24, delay: 0   },
  { text: 'Good morning ☀️',   lang: 'en', tier: 'badge', x: '66%', y: '4%',  size: 12, rot: 1.5, dur: 28, delay: 4   },
  { text: 'Thank you 🙏',      lang: 'en', tier: 'badge', x: '3%',  y: '55%', size: 12, rot: 2,   dur: 22, delay: 10  },
  { text: 'Excellent! ⭐',     lang: 'en', tier: 'badge', x: '80%', y: '72%', size: 12, rot: -1.5,dur: 26, delay: 17  },
  { text: 'Bonjour! 👋',       lang: 'fr', tier: 'badge', x: '78%', y: '8%',  size: 13, rot: 1,   dur: 26, delay: 2   },
  { text: 'Félicitations 🎉',  lang: 'fr', tier: 'badge', x: '5%',  y: '34%', size: 12, rot: -2,  dur: 30, delay: 8   },
  { text: 'C\'est parfait !',  lang: 'fr', tier: 'badge', x: '72%', y: '40%', size: 12, rot: 1.5, dur: 23, delay: 15  },
  { text: 'Bienvenue 🌍',      lang: 'fr', tier: 'badge', x: '42%', y: '88%', size: 12, rot: -1,  dur: 27, delay: 20  },

  // ── Ambient tier ────────────────────────────────────────────────────────────
  { text: 'Speak up',          lang: 'en', tier: 'ambient', x: '20%', y: '5%',  size: 12, rot: -4,  dur: 20, delay: 5   },
  { text: 'Fluency',           lang: 'en', tier: 'ambient', x: '88%', y: '30%', size: 11, rot: 3,   dur: 25, delay: 11  },
  { text: 'See you later',     lang: 'en', tier: 'ambient', x: '60%', y: '94%', size: 11, rot: -2,  dur: 22, delay: 18  },
  { text: 'Nice to meet you',  lang: 'en', tier: 'ambient', x: '36%', y: '48%', size: 11, rot: 2.5, dur: 29, delay: 7   },
  { text: 'Au revoir',         lang: 'fr', tier: 'ambient', x: '12%', y: '76%', size: 12, rot: -3,  dur: 21, delay: 3   },
  { text: 'Parlez-vous ?',     lang: 'fr', tier: 'ambient', x: '86%', y: '55%', size: 11, rot: 4,   dur: 27, delay: 13  },
  { text: 'Merci beaucoup',    lang: 'fr', tier: 'ambient', x: '50%', y: '20%', size: 11, rot: -2,  dur: 24, delay: 22  },
  { text: 'Enchanté',          lang: 'fr', tier: 'ambient', x: '25%', y: '64%', size: 12, rot: 1.5, dur: 19, delay: 9   },
];

function GhostWord({ w }: { w: Word }) {
  const color = w.lang === 'en' ? RED : BLUE;
  return (
    <span
      style={{
        position:    'absolute',
        left:        w.x,
        top:         w.y,
        fontSize:    `${w.size}px`,
        fontWeight:  900,
        color,
        opacity:     0.038,
        whiteSpace:  'nowrap',
        transform:   `rotate(${w.rot}deg)`,
        animation:   `hwDrift ${w.dur}s ease-in-out ${w.delay}s infinite`,
        letterSpacing: '-0.02em',
        userSelect:  'none',
      }}
    >
      {w.text}
    </span>
  );
}

function BadgeWord({ w }: { w: Word }) {
  const color  = w.lang === 'en' ? RED : BLUE;
  const bgRgba = w.lang === 'en'
    ? 'rgba(255,255,255,0.62)'
    : 'rgba(255,255,255,0.62)';
  return (
    <span
      style={{
        position:       'absolute',
        left:           w.x,
        top:            w.y,
        fontSize:       `${w.size}px`,
        fontWeight:     600,
        color,
        opacity:        0.72,
        whiteSpace:     'nowrap',
        transform:      `rotate(${w.rot}deg)`,
        animation:      `hwDrift ${w.dur}s ease-in-out ${w.delay}s infinite`,
        padding:        '5px 12px',
        borderRadius:   '20px',
        background:     bgRgba,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border:         `1px solid ${w.lang === 'en' ? 'rgba(237,17,24,0.20)' : 'rgba(50,61,110,0.18)'}`,
        borderLeft:     `3px solid ${color}`,
        boxShadow:      `0 4px 18px rgba(${w.lang === 'en' ? '237,17,24' : '50,61,110'},0.09)`,
        userSelect:     'none',
      }}
    >
      {w.text}
    </span>
  );
}

function AmbientWord({ w }: { w: Word }) {
  const color = w.lang === 'en' ? RED : BLUE;
  return (
    <span
      style={{
        position:    'absolute',
        left:        w.x,
        top:         w.y,
        fontSize:    `${w.size}px`,
        fontWeight:  600,
        color,
        opacity:     0.11,
        whiteSpace:  'nowrap',
        transform:   `rotate(${w.rot}deg)`,
        animation:   `hwDrift ${w.dur}s ease-in-out ${w.delay}s infinite`,
        letterSpacing: '0.01em',
        userSelect:  'none',
      }}
    >
      {w.text}
    </span>
  );
}

export default function HeroFloatingWords() {
  return (
    <>
      <style>{`
        @keyframes hwDrift {
          0%   { transform: translateY(0px)   translateX(0px)   rotate(var(--r, 0deg)); }
          25%  { transform: translateY(-10px) translateX(5px)   rotate(var(--r, 0deg)); }
          50%  { transform: translateY(-6px)  translateX(-4px)  rotate(var(--r, 0deg)); }
          75%  { transform: translateY(-15px) translateX(3px)   rotate(var(--r, 0deg)); }
          100% { transform: translateY(0px)   translateX(0px)   rotate(var(--r, 0deg)); }
        }
      `}</style>

      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none"
        style={{ zIndex: -15 }}
        aria-hidden="true"
      >
        {WORDS.map((w, i) => {
          if (w.tier === 'ghost')   return <GhostWord   key={i} w={w} />;
          if (w.tier === 'badge')   return <BadgeWord   key={i} w={w} />;
          if (w.tier === 'ambient') return <AmbientWord key={i} w={w} />;
        })}
      </div>
    </>
  );
}
