# YES Institute — Landing + CMS

Landing moderna para **YES Institute** (clases de inglés y francés en Neiva, Huila) con CMS ligero basado en Firebase.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS** — estilos
- **Framer Motion** — animaciones sutiles
- **Firebase** (client SDK): Auth + Firestore + Storage
- **Vercel** — deploy

## Desarrollo local

```bash
npm install
npm run dev
```

La app renderiza con **datos mock** si Firebase no está configurado. Para conectar Firebase, copia `.env.example` a `.env.local` y completa las variables.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp (E.164, ej: `573133973411`) |
| `NEXT_PUBLIC_SITE_URL` | URL canónica del sitio |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Cloudflare Turnstile site key (opcional) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret (opcional) |

## Setup Firebase

### 1. Crear proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un proyecto nuevo (ej: "yes-institute")
3. Habilita **Authentication** → método "Email/Password"
4. Habilita **Firestore Database** (modo producción)
5. Habilita **Storage** (si subirás imágenes)

### 2. Crear usuario admin
1. En Firebase Console → Authentication → Users
2. Agrega un usuario con email/password
3. Agrega el mismo email en `firestore.rules` (allowlist de admins)

### 3. Configurar Firestore Rules
Copia el contenido de `firestore.rules` del repo a Firebase Console → Firestore → Rules.

### 4. Crear documentos de contenido
En Firestore Console, crea la colección `siteConfig` con 3 documentos:

- **`home`** — copia el objeto de `src/lib/mockData.ts` → `mockHome`
- **`courses`** — copia el objeto de `src/lib/mockData.ts` → `mockCourses`
- **`contact`** — copia el objeto de `src/lib/mockData.ts` → `mockContact`

> 💡 Si no creas estos documentos, la app usa automáticamente los datos mock del código.

### 5. Obtener config
En Firebase Console → Project Settings → Web app → copia las variables de configuración a `.env.local`.

## Deploy a Vercel

1. Conecta el repo a [Vercel](https://vercel.com)
2. En Vercel → Settings → Environment Variables, agrega todas las variables de `.env.example`
3. Deploy → listo ✅

## Panel de administración

- Accede a `/admin`
- Inicia sesión con el email/password del usuario admin de Firebase
- Edita contenido de Home, Cursos y Contacto
- Guarda → los cambios se reflejan en el sitio en ~5 minutos (ISR)

## Estructura

```
src/
├── app/
│   ├── layout.tsx          # Layout raíz + SEO + Schema.org
│   ├── page.tsx            # Home (ISR)
│   ├── cursos/page.tsx     # Cursos (ISR)
│   ├── contacto/page.tsx   # Contacto (ISR)
│   ├── admin/page.tsx      # Panel admin (login + editor)
│   ├── api/leads/route.ts  # API captación de leads
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── layout/             # Header, Footer
│   ├── home/               # Hero, TrustBar, Features, CoursesPreview, Location, Testimonials, FAQ, CTA
│   ├── forms/              # LeadForm
│   └── ui/                 # Section
├── lib/
│   ├── firebase.ts         # Firebase client SDK init
│   ├── content.ts          # Fetch helpers + fallback
│   ├── mockData.ts         # Datos demo
│   └── seo.ts              # Schema.org helpers
└── types/index.ts          # TypeScript interfaces
```

## SEO

- **Local keywords**: "clases de inglés en Neiva", "instituto de inglés en Neiva", etc.
- **Schema.org**: Organization, LocalBusiness (Neiva/Huila), Course (Inglés/Francés), FAQPage
- **Sitemap** y **robots.txt** generados dinámicamente
- **OpenGraph** y **Twitter Cards** por página
- **301 Redirects** desde URLs antiguas del sitio anterior

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Firebase client SDK only | Evita service accounts, reduce complejidad |
| ISR time-based (300s) | Minimiza lecturas Firestore, buen performance |
| Mock data fallback | La app siempre compila y renderiza sin Firebase |
| No Admin SDK | No depender de service accounts para deploy en Vercel |
| No on-demand revalidation | Simplicidad; ISR con 5 min de cache es suficiente |
"# yes-landing" 
