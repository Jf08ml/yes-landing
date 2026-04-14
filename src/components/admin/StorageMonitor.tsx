'use client';

import { useState, useCallback, useEffect } from 'react';
import { ref, listAll, getMetadata, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface StorageFile {
  path: string;
  name: string;
  size: number;
  contentType: string;
  updated: string;
  fullPath: string;
  url: string;
}

interface StorageMonitorProps {
  onUsageLoad?: (ratio: number) => void;
}

export const FREE_TIER_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
const WARN_THRESHOLD = 0.80;

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function listAllFiles(folderRef: ReturnType<typeof ref>): Promise<StorageFile[]> {
  const result = await listAll(folderRef);
  const files: StorageFile[] = [];

  const subFolderFiles = await Promise.all(result.prefixes.map(p => listAllFiles(p)));
  subFolderFiles.forEach(sub => files.push(...sub));

  const metaResults = await Promise.all(
    result.items.map(async (item) => {
      try {
        const [meta, url] = await Promise.all([
          getMetadata(item),
          getDownloadURL(item),
        ]);
        return {
          path: item.fullPath,
          name: item.name,
          size: meta.size ?? 0,
          contentType: meta.contentType ?? 'application/octet-stream',
          updated: meta.updated ?? '',
          fullPath: item.fullPath,
          url,
        } satisfies StorageFile;
      } catch {
        return null;
      }
    })
  );
  metaResults.forEach(m => { if (m) files.push(m); });

  return files;
}

function FileThumbnail({ file }: { file: StorageFile }) {
  const [imgError, setImgError] = useState(false);

  if (file.contentType.startsWith('image/') && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name}
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
      />
    );
  }

  if (file.contentType.startsWith('video/')) {
    return (
      <div className="relative w-12 h-12 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 shrink-0">
        <video
          src={file.url}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    );
  }

  if (file.contentType === 'application/pdf') {
    return (
      <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-[9px] font-black text-red-500 tracking-widest">PDF</span>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

export default function StorageMonitor({ onUsageLoad }: StorageMonitorProps) {
  const [files, setFiles] = useState<StorageFile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!storage) {
      setError('Firebase Storage no está configurado.');
      return;
    }
    setLoading(true);
    setError('');
    setDeleteError('');
    try {
      const rootRef = ref(storage, '/');
      const result = await listAllFiles(rootRef);
      result.sort((a, b) => b.size - a.size);
      setFiles(result);
      const total = result.reduce((sum, f) => sum + f.size, 0);
      onUsageLoad?.(total / FREE_TIER_BYTES);
    } catch (err) {
      console.error(err);
      setError('Error al obtener los archivos. Verifica las reglas de Storage.');
    }
    setLoading(false);
  }, [onUsageLoad]);

  // Auto-load on mount
  useEffect(() => {
    loadFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (file: StorageFile) => {
    if (!storage) return;
    setDeleting(file.path);
    setDeleteError('');
    try {
      const fileRef = ref(storage, file.path);
      await deleteObject(fileRef);
      const updated = (files ?? []).filter(f => f.path !== file.path);
      setFiles(updated);
      const total = updated.reduce((sum, f) => sum + f.size, 0);
      onUsageLoad?.(total / FREE_TIER_BYTES);
    } catch (err) {
      console.error(err);
      setDeleteError(`No se pudo eliminar "${file.name}". Puede estar en uso.`);
    }
    setDeleting(null);
    setConfirmDelete(null);
  };

  const totalBytes = files ? files.reduce((sum, f) => sum + f.size, 0) : 0;
  const usageRatio = totalBytes / FREE_TIER_BYTES;
  const isWarning  = usageRatio >= WARN_THRESHOLD;
  const isCritical = usageRatio >= 0.95;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text">Monitor de almacenamiento</h3>
          <p className="text-xs text-text-light mt-0.5">Cuota gratuita de Firebase Storage: <span className="font-semibold">5 GB/mes</span></p>
        </div>
        <button
          onClick={loadFiles}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-colors"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && files === null && (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-gray-100 rounded-2xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      )}

      {files !== null && (
        <>
          {/* Usage bar */}
          <div className={`rounded-2xl border p-5 ${isCritical ? 'border-red-300 bg-red-50' : isWarning ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
            {(isWarning || isCritical) && (
              <div className={`flex items-start gap-3 mb-4 p-3 rounded-xl font-semibold text-sm
                ${isCritical ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  {isCritical
                    ? `⚠️ ALMACENAMIENTO CASI LLENO (${Math.round(usageRatio * 100)}%) — Estás a punto de superar la cuota gratuita de 5 GB. Elimina archivos para evitar cobros.`
                    : `⚠️ Almacenamiento al ${Math.round(usageRatio * 100)}% — Considera liberar espacio para no superar la cuota.`}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-bold text-text">
                {formatBytes(totalBytes)}{' '}
                <span className="font-normal text-text-light">usados de 5 GB</span>
              </span>
              <span className={`text-sm font-bold ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'}`}>
                {Math.round(usageRatio * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-green-500'}`}
                style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-light mt-2">
              {files.length} archivo{files.length !== 1 ? 's' : ''} · Disponible: {formatBytes(FREE_TIER_BYTES - totalBytes)}
            </p>
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {deleteError}
            </div>
          )}

          {/* File list */}
          {files.length === 0 ? (
            <p className="text-center text-text-light py-8">No hay archivos en Storage.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Archivo</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ruta</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tamaño</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.path} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <FileThumbnail file={file} />
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-text text-xs max-w-[160px] truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{file.contentType}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 hidden md:table-cell max-w-[200px]">
                        <span className="truncate block">{file.path}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right font-mono text-gray-600 whitespace-nowrap">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {confirmDelete === file.path ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[10px] text-red-600 font-semibold whitespace-nowrap">¿Eliminar?</span>
                            <button
                              onClick={() => handleDelete(file)}
                              disabled={deleting === file.path}
                              className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-red-600 disabled:opacity-60"
                            >
                              {deleting === file.path ? '…' : 'Sí'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(file.path)}
                            className="text-[10px] text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
