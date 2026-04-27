import Link from 'next/link';
import { Home, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-electric-500/8 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-navy-500/8 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative container-custom text-center px-4">
        {/* Floating robot icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-electric-500/20 to-navy-500/20 backdrop-blur-sm border border-electric-500/30 flex items-center justify-center animate-float"
            aria-hidden="true"
          >
            <Bot className="w-12 h-12 text-electric-500" />
          </div>
        </div>

        {/* 404 number */}
        <div className="relative mb-4">
          <p
            className="font-display font-black text-[8rem] md:text-[12rem] leading-none text-navy-900/5 select-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            404
          </p>
          <p className="font-display font-bold text-6xl md:text-8xl gradient-text relative">
            404
          </p>
        </div>

        {/* Message */}
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-navy-900 mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 text-base md:text-lg max-w-md mx-auto mb-10">
          Sepertinya robot kami tidak bisa menemukan halaman yang kamu cari.
          Mungkin sudah dipindah atau tidak pernah ada.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-electric-300" />
          <div className="w-2 h-2 rounded-full bg-electric-400" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-electric-300" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-electric-600 hover:bg-electric-700 text-white gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <BackButton />
        </div>

        {/* Quick links */}
        <div className="mt-12">
          <p className="text-sm text-gray-400 mb-4">Atau kunjungi halaman lainnya:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: '/news', label: 'Berita' },
              { href: '/achievements', label: 'Prestasi' },
              { href: '/structure', label: 'Struktur' },
              { href: '/gallery', label: 'Galeri' },
              { href: '/knowledge', label: 'Knowledge' },
              { href: '/contact', label: 'Kontak' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 rounded-full text-sm border border-electric-200 text-electric-600 hover:bg-electric-50 hover:border-electric-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
