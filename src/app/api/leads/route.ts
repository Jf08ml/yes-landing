import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, interest, message, sourcePage, turnstileToken } = body;

    // Validate required fields
    if (!name || !phone || !email || !interest) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben estar completos.' },
        { status: 400 }
      );
    }

    // Validate Turnstile if secret is configured
    const turnstileSecret = process.env.TURNSTILE_SECRET;
    if (turnstileSecret && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { error: 'Verificación anti-spam fallida. Intenta de nuevo.' },
          { status: 403 }
        );
      }
    }

    // Try to write to Firestore (client SDK via dynamic import)
    try {
      const { isFirebaseConfigured, db } = await import('@/lib/firebase');
      if (isFirebaseConfigured && db) {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'leads'), {
          name,
          phone,
          email,
          interest,
          message: message || '',
          sourcePage: sourcePage || 'unknown',
          createdAt: serverTimestamp(),
          status: 'new',
        });
      } else {
        // Firebase not configured — log lead to console for development
        console.log('[leads] Firebase not configured. Lead data:', { name, phone, email, interest, message, sourcePage });
      }
    } catch (firebaseError) {
      console.error('[leads] Firebase write failed:', firebaseError);
      // Still return success to user — lead might be captured via notification later
    }

    // TODO: Send email notification here (e.g., via Resend, SendGrid, etc.)

    return NextResponse.json({ success: true, message: '¡Gracias! Tu solicitud ha sido recibida.' });
  } catch (error) {
    console.error('[leads] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
