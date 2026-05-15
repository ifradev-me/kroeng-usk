'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const PDF_TYPES = ['application/pdf'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALL_TYPES = [...IMAGE_TYPES, ...PDF_TYPES];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per file

type AcceptKind = 'pdf' | 'image' | 'both';

interface FileUploadProps {
  /** Current attachment URLs */
  value: string[];
  /** Called with the updated list of URLs */
  onChange: (urls: string[]) => void;
  /** Subfolder in the bucket, e.g. "applications". Default "applications" */
  folder?: string;
  /** Storage bucket. Default "attachments" */
  bucket?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Max files allowed. Default 5 */
  maxFiles?: number;
  /** Allowed file type. Default 'both' */
  accept?: AcceptKind;
}

function getFileNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const raw = parts[parts.length - 1] || 'file';
    // strip timestamp-random prefix added during upload
    return decodeURIComponent(raw.replace(/^\d+-[a-z0-9]+-/i, ''));
  } catch {
    return 'file';
  }
}

export function FileUpload({
  value,
  onChange,
  folder = 'applications',
  bucket = 'attachments',
  disabled = false,
  maxFiles = 5,
  accept = 'both',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes =
    accept === 'pdf' ? PDF_TYPES : accept === 'image' ? IMAGE_TYPES : ALL_TYPES;
  const acceptedExt =
    accept === 'pdf'
      ? '.pdf'
      : accept === 'image'
      ? '.jpg,.jpeg,.png,.webp'
      : '.jpg,.jpeg,.png,.webp,.pdf';
  const acceptLabel =
    accept === 'pdf' ? 'PDF' : accept === 'image' ? 'JPG, PNG, atau WebP' : 'JPG, PNG, WebP, atau PDF';

  const remainingSlots = Math.max(0, maxFiles - value.length);
  const isFull = remainingSlots === 0;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Determine how many we can actually accept
      const toUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast.error(
          `Hanya ${remainingSlots} file lagi yang bisa diupload (maks. ${maxFiles} total)`
        );
      }

      // Validate each file first
      const valid: File[] = [];
      for (const file of toUpload) {
        if (!acceptedTypes.includes(file.type)) {
          toast.error(`"${file.name}" bukan format ${acceptLabel}`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`"${file.name}" melebihi 10 MB`);
          continue;
        }
        valid.push(file);
      }
      if (valid.length === 0) return;

      setUploading(true);
      try {
        const uploadedUrls: string[] = [];
        for (const file of valid) {
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

          if (error) {
            toast.error(`Gagal upload "${file.name}": ${error.message}`);
            continue;
          }

          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
          uploadedUrls.push(urlData.publicUrl);
        }

        if (uploadedUrls.length > 0) {
          onChange([...value, ...uploadedUrls]);
          toast.success(
            uploadedUrls.length === 1
              ? 'Lampiran berhasil diupload'
              : `${uploadedUrls.length} lampiran berhasil diupload`
          );
        }
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [folder, bucket, onChange, value, remainingSlots, maxFiles, acceptedTypes, acceptLabel]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading || isFull) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) uploadFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading && !isFull) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* File list */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((url, i) => {
            const fileName = getFileNameFromUrl(url);
            const isPdf = /\.pdf($|\?)/i.test(url);
            const Icon = isPdf ? FileText : ImageIcon;

            return (
              <li
                key={`${url}-${i}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-electric-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-electric-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={url}
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
                  onClick={() => removeAt(i)}
                  disabled={disabled || uploading}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  aria-label={`Hapus ${fileName}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Drop zone — hidden when full */}
      {!isFull && (
        <div
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-xl border-2 border-dashed p-5 sm:p-7 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-electric-500 bg-electric-50'
              : 'border-gray-300 bg-gray-50 hover:border-electric-400 hover:bg-electric-50/30'
          } ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedExt}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />

          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                isDragging ? 'bg-electric-500 text-white' : 'bg-electric-100 text-electric-600'
              }`}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-navy-900">
                {uploading
                  ? 'Mengupload...'
                  : isDragging
                  ? 'Lepas file di sini'
                  : 'Drop file di sini'}
              </p>
              {!uploading && !isDragging && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  atau <span className="text-electric-600 font-medium">klik untuk pilih</span>
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">
                {acceptLabel} · maks. 10 MB per file · sisa{' '}
                <span className="font-semibold text-electric-600">{remainingSlots}</span> dari{' '}
                {maxFiles} file
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full state notice */}
      {isFull && (
        <p className="text-xs sm:text-sm text-gray-500 text-center py-2">
          Sudah mencapai batas maksimal {maxFiles} file. Hapus salah satu untuk menambahkan yang baru.
        </p>
      )}
    </div>
  );
}
