'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

type UploaderType = 'image' | 'video' | 'document';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  storagePath?: string;
  label?: string;
  /** Tamaño recomendado para mostrar como guía, e.g. "1280 × 720 px (16:9)" */
  recommendedSize?: string;
  /** Tipo de archivo permitido. Por defecto 'image'. */
  type?: UploaderType;
}

const CONFIG: Record<UploaderType, { accept: string; maxMB: number; label: string; hint: string }> = {
  image:    { accept: 'image/*',               maxMB: 5,   label: 'imagen',    hint: 'PNG, JPG, WebP — máx. 5 MB' },
  video:    { accept: 'video/mp4,video/webm,video/ogg', maxMB: 200, label: 'video', hint: 'MP4, WebM — máx. 200 MB' },
  document: { accept: 'application/pdf',       maxMB: 20,  label: 'documento', hint: 'PDF — máx. 20 MB' },
};

function fileNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    const last = parts[parts.length - 1];
    // Remove query strings
    return last.split('?')[0].split('%2F').pop() || 'archivo';
  } catch {
    return 'archivo';
  }
}

export default function ImageUploader({
  value,
  onChange,
  storagePath = 'uploads',
  label = 'Archivo',
  recommendedSize,
  type = 'image',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const cfg = CONFIG[type];

  const handleFile = async (file: File) => {
    if (!storage) {
      setError('Firebase Storage no configurado.');
      return;
    }

    // Validate type
    const isValid =
      type === 'image'    ? file.type.startsWith('image/') :
      type === 'video'    ? file.type.startsWith('video/') :
      type === 'document' ? file.type === 'application/pdf' :
      false;

    if (!isValid) {
      setError(`Solo se permiten archivos de tipo ${cfg.label}.`);
      return;
    }

    if (file.size > cfg.maxMB * 1024 * 1024) {
      setError(`El archivo no puede superar ${cfg.maxMB} MB.`);
      return;
    }

    setError('');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, `${storagePath}/${filename}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Error al subir el ${cfg.label}. Verifica las reglas de Storage.`);
    }
    setUploading(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const renderPreview = () => {
    if (!value) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {type === 'image' && (
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {type === 'video' && (
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {type === 'document' && (
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          <p className="text-sm text-text-light">
            {uploading ? 'Subiendo...' : `Arrastra un ${cfg.label} o haz clic`}
          </p>
          <p className="text-xs text-gray-400 mt-1">{cfg.hint}</p>
          {recommendedSize && type === 'image' && (
            <p className="text-[10px] text-amber-600 font-medium mt-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              Tamaño ideal: {recommendedSize}
            </p>
          )}
        </div>
      );
    }

    if (type === 'image') {
      return (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={value}
            alt="Portada"
            fill
            className="object-cover"
            unoptimized={value.startsWith('blob:')}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {uploading ? 'Subiendo...' : 'Cambiar imagen'}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'video') {
      return (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            src={value}
            className="w-full max-h-48 object-contain"
            controls
          />
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
              {uploading ? 'Subiendo...' : 'Clic para cambiar'}
            </span>
          </div>
        </div>
      );
    }

    // document (PDF)
    return (
      <div className="flex items-center gap-3 py-5 px-4">
        <svg className="w-10 h-10 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8" fill="none" stroke="white" strokeWidth="1.5"/>
          <text x="6" y="18" fontSize="5" fill="white" fontWeight="bold">PDF</text>
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">{fileNameFromUrl(value)}</p>
          <p className="text-xs text-gray-400">
            {uploading ? 'Subiendo...' : 'Haz clic para cambiar el archivo'}
          </p>
        </div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary font-semibold hover:underline shrink-0"
        >
          Abrir PDF
        </a>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-xs font-medium text-text-light">{label}</label>
        {recommendedSize && type === 'image' && (
          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
            ✦ {recommendedSize}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer select-none
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        {renderPreview()}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Subiendo...
            </div>
          </div>
        )}
      </div>

      {/* URL manual fallback */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`O pega una URL de ${cfg.label} directamente`}
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-text-light"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-600 px-2"
            title={`Quitar ${cfg.label}`}
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={cfg.accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
