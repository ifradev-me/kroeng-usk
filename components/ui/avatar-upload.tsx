'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const MAX_DIMENSION = 400;
const WEBP_QUALITY = 0.85;

async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
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
      if (!ctx) { reject(new Error('Canvas context tidak tersedia')); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Konversi gambar gagal')); return; }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
        },
        'image/webp',
        WEBP_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Gagal memuat gambar')); };
    img.src = objectUrl;
  });
}

interface AvatarUploadProps {
  /** Current avatar URL */
  value: string | null;
  /** Called with the new public URL after upload */
  onChange: (url: string) => void;
  /** Display name for initials fallback */
  name?: string;
  /** Size in tailwind units, default w-24 h-24 */
  size?: string;
}

export function AvatarUpload({ value, onChange, name, size = 'w-24 h-24' }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Harap pilih file gambar'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran file maksimal 5MB'); return; }

    setUploading(true);
    try {
      const webpFile = await convertToWebP(file);
      const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, webpFile, {
          cacheControl: '31536000',
          upsert: false,
          contentType: 'image/webp',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      toast.success('Foto profil diperbarui');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengupload foto');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className={`relative ${size} rounded-full cursor-pointer group`}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar image or initials */}
      {value ? (
        <img
          src={value}
          alt={name || 'Avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-electric-500 to-navy-600 flex items-center justify-center text-white font-bold text-2xl select-none">
          {initials}
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <>
            <Camera className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-medium">Ganti</span>
          </>
        )}
      </div>
    </div>
  );
}
