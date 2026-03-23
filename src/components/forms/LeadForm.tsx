'use client';

import { useState, FormEvent } from 'react';

interface LeadFormProps {
  sourcePage: string;
}

export default function LeadForm({ sourcePage }: LeadFormProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    interest: 'ingles' as 'ingles' | 'frances' | 'ambos',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', email: '', interest: 'ingles', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Error al enviar. Intenta de nuevo.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Error de conexión. Intenta de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Mensaje enviado!</h3>
        <p className="text-green-700 text-sm">
          Nos pondremos en contacto contigo pronto. También puedes escribirnos directamente por WhatsApp.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-primary font-semibold text-sm hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="lead-name" className="block text-sm font-medium text-text mb-1">
          Nombre completo *
        </label>
        <input
          id="lead-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          placeholder="Tu nombre"
        />
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-phone" className="block text-sm font-medium text-text mb-1">
            Teléfono *
          </label>
          <input
            id="lead-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            placeholder="+57 300 000 0000"
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="block text-sm font-medium text-text mb-1">
            Correo electrónico *
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Interest */}
      <div>
        <label htmlFor="lead-interest" className="block text-sm font-medium text-text mb-1">
          Interés *
        </label>
        <select
          id="lead-interest"
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value as 'ingles' | 'frances' | 'ambos' })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-white"
        >
          <option value="ingles">Inglés</option>
          <option value="frances">Francés</option>
          <option value="ambos">Ambos</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="lead-message" className="block text-sm font-medium text-text mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          id="lead-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
          placeholder="Cuéntanos qué curso te interesa, tu disponibilidad horaria, o cualquier duda..."
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {status === 'loading' ? 'Enviando...' : 'Solicitar información'}
      </button>
      <p className="text-xs text-text-light text-center">
        Al enviar aceptas que te contactemos por correo o teléfono.
      </p>
    </form>
  );
}
