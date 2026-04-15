import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const STATIC_PATHS = ['/', '/cursos', '/blog', '/yes-factor', '/contacto'];

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  if (configuredSecret) {
    const secret = request.headers.get('x-revalidate-secret');
    if (secret !== configuredSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const slugs: string[] = body.slugs ?? [];

  for (const path of STATIC_PATHS) {
    revalidatePath(path);
  }
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }

  const revalidated = [...STATIC_PATHS, ...slugs.map(s => `/blog/${s}`)];
  return NextResponse.json({ revalidated });
}
