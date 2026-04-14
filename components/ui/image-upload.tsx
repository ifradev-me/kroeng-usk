'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  maxSizeMB?: number;
}

// Max dimension for output images (px), prevents storing huge files
const MAX_DIMENSION = 1920;
// WebP quality 0–1; 0.82 gives ~70-80% smaller than PNG with barely visible loss
const WEBP_QUALITY = 0.82;

async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down proportionally if either dimension exceeds MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context tidak tersedia'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Konversi gambar gagal'));
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memuat gambar'));
    };

    img.src = objectUrl;
  });
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'images',
  folder = 'uploads',
  aspectRatio = 'auto',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-[200px]',
  };

  const uploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Harap upload file gambar');
      return;
    }

    // Validate original file size before conversion
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Ukuran file harus kurang dari ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      // Convert & compress to WebP before uploading
      const webpFile = await convertToWebP(file);

      // Generate unique filename with .webp extension
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, webpFile, {
          cacheControl: '31536000', // 1 year – WebP files are content-addressed
          upsert: false,
          contentType: 'image/webp',
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
      toast.success('Gambar berhasil diupload');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Gagal mengupload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = async () => {
    if (value) {
      // Extract file path from URL
      try {
        const url = new URL(value);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex((p) => p === bucket);
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          await supabase.storage.from(bucket).remove([filePath]);
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
    onChange('');
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className={`relative rounded-lg overflow-hidden border ${aspectRatioClass[aspectRatio]}`}>
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-lg border-2 border-dashed transition-colors cursor-pointer
            ${aspectRatioClass[aspectRatio]}
            ${dragOver ? 'border-electric-500 bg-electric-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-electric-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP hingga {maxSizeMB}MB
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Otomatis dikonversi &amp; dikompres ke WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Optional: Manual URL input — only https URLs allowed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">or</span>
        <Input
          type="url"
          placeholder="Paste image URL (https://...)"
          value={value}
          onChange={(e) => {
            const url = e.target.value;
            if (!url || url.startsWith('https://')) {
              onChange(url);
            } else {
              toast.error('Hanya URL dengan https:// yang diizinkan');
            }
          }}
          className="text-sm h-8"
        />
      </div>
    </div>
  );
}