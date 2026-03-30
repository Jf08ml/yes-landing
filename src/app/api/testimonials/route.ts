import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, text, rating } = body;

    if (!name?.trim() || !role?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    if (text.trim().length < 20) {
      return NextResponse.json(
        { error: 'El comentario debe tener al menos 20 caracteres.' },
        { status: 400 }
      );
    }

    try {
      const { isFirebaseConfigured, db } = await import('@/lib/firebase');
      if (isFirebaseConfigured && db) {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'testimonials'), {
          name: name.trim(),
          role: role.trim(),
          text: text.trim(),
          rating: Math.min(5, Math.max(1, Number(rating) || 5)),
          approved: false,
          createdAt: serverTimestamp(),
        });
      } else {
        console.log('[testimonials] Firebase not configured. Submission:', { name, role, text });
      }
    } catch (firebaseError) {
      console.error('[testimonials] Firebase write failed:', firebaseError);
    }

    return NextResponse.json({ success: true, message: '¡Gracias! Tu comentario será revisado pronto.' });
  } catch (error) {
    console.error('[testimonials] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
