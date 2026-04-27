'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="lg"
      className="border-navy-200 text-navy-700 hover:bg-navy-50 gap-2"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      Halaman Sebelumnya
    </Button>
  );
}
