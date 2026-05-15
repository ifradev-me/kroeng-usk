'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader2, X, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const PDF_TYPES = ['application/pdf'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type AcceptKind = 'pdf' | 'image';

interface SingleFileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Type filter — 'pdf' or 'image' */
  accept: AcceptKind;
  /** Subfolder in bucket, default 'applications' */
  folder?: string;
  /** Storage bucket, default 'attachments' */
  bucket?: string;
  disabled?: boolean;
}

function getFileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const raw = parts[parts.length - 1] || 'file';
    return decodeURIComponent(raw.replace(/^\d+-[a-z0-9]+-/i, ''));
  } catch {
    return 'file';
  }
}

export function SingleFileUpload({
  value,
  onChange,
  accept,
  folder = 'applications',
  bucket = 'attachments',
  disabled = false,
}: SingleFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = accept === 'pdf' ? PDF_TYPES : IMAGE_TYPES;
  const acceptedExt = accept === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.webp';
  const acceptLabel = accept === 'pdf' ? 'PDF' : 'JPG, PNG, atau WebP';

  const uploadFile = useCallback(
    async (file: File) => {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`Format harus ${acceptLabel}`);
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error('Ukuran file maksimal 10 MB');
        return;
      }

      setUploading(true);
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const safeBase = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9-_]/g, '_')
          .slice(0, 40);
        const fileName = `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}-${safeBase}.${ext}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '31536000',
            upsert: false,
            contentType: file.type,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        onChange(urlData.publicUrl);
        toast.success('Lampiran berhasil diupload');
      } catch (err: any) {
        toast.error(err.message || 'Gagal mengupload lampiran');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [folder, bucket, onChange, acceptedTypes, acceptLabel]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Preview — file uploaded
  if (value) {
    const fileName = getFileNameFromUrl(value);
    const Icon = accept === 'pdf' ? FileText : ImageIcon;

    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-electric-200 bg-electric-50/40">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center">
          <Icon className="w-5 h-5 text-electric-600" />
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-navy-900 hover:text-electric-600 truncate block"
          >
            {fileName}
          </a>
          <p className="text-xs text-gray-500 mt-0.5">Klik nama file untuk membuka</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          disabled={disabled || uploading}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-white hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
          aria-label="Hapus lampiran"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Empty — drop zone
  return (
    <div
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-electric-500 bg-electric-50'
          : 'border-gray-300 bg-gray-50 hover:border-electric-400 hover:bg-electric-50/30'
      } ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedExt}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center ${
            isDragging ? 'bg-electric-500 text-white' : 'bg-electric-100 text-electric-600'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-navy-900">
            {uploading
              ? 'Mengupload...'
              : isDragging
              ? 'Lepas di sini'
              : 'Drop file di sini'}
          </p>
          {!uploading && !isDragging && (
            <p className="text-xs text-gray-500 mt-0.5">
              atau <span className="text-electric-600 font-medium">klik untuk pilih</span>
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-1.5">
            {acceptLabel} · maks. 10 MB
          </p>
        </div>
      </div>
    </div>
  );
}
