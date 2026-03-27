'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  storagePath?: string; // e.g. 'blog-images'
  label?: string;
  /** Tamaño recomendado para mostrar como guía, e.g. "1280 × 720 px (16:9)" */
  recommendedSize?: string;
}

export default function ImageUploader({
  value,
  onChange,
  storagePath = 'uploads',
  label = 'Imagen',
  recommendedSize,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!storage) {
      setError('Firebase Storage no configurado.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.');
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
      setError('Error al subir la imagen. Verifica las reglas de Storage.');
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

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-xs font-medium text-text-light">{label}</label>
        {recommendedSize && (
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
        {value ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-text-light">
              {uploading ? 'Subiendo...' : 'Arrastra una imagen o haz clic'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — máx. 5 MB</p>
            {recommendedSize && (
              <p className="text-[10px] text-amber-600 font-medium mt-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                Tamaño ideal: {recommendedSize}
              </p>
            )}
          </div>
        )}

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
          placeholder="O pega una URL directamente"
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-text-light"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-400 hover:text-red-600 px-2"
            title="Quitar imagen"
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
