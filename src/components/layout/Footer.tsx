import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-text-inverse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4 p-2 bg-white rounded-xl shadow-sm hover:opacity-90 transition-all">
              <Image 
                src="/fav.png" 
                alt="YES Institute Logo" 
                width={56} 
                height={56} 
                className="w-14 h-14 object-contain"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              YES YOUR ENGLISH SERVICES SAS. Instituto de educación no formal en Neiva, Huila.
              Formando profesionales bilingües desde 1993.
            </p>
            <p className="text-gray-400 text-xs mt-2 italic">
              Licencia de Funcionamiento No. 1598 — MEN (27 de agosto de 2024)
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/cursos', label: 'Cursos' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span>📍</span> Cra 7 con Calle 17A, Quirinal, Neiva</li>
              <li className="flex gap-2"><span>📞</span> +57 313 3973411</li>
              <li className="flex gap-2"><span>📞</span> +57 316 5377072</li>
              <li className="flex gap-2"><span>✉️</span> contactenos@yes.edu.co</li>
              <li className="flex gap-2"><span>🕐</span> Lun–Vie: 6:00 am – 8:30 pm</li>
              <li className="flex gap-2"><span>🕐</span> Sáb: 8:00 am – 6:00 pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {year} YES Institute. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/institutoyes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a
              href="https://www.youtube.com/channel/UCfvzDmamWvhdZubng7YRzfQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
