/**
 * ==============================================
 * PANDUAN METADATA SEO UNTUK SETIAP HALAMAN
 * ==============================================
 * 
 * Copy-paste metadata yang sesuai ke masing-masing page.tsx
 * Sesuaikan dengan konten aktual halaman
 */

import { generatePageMetadata, generateArticleMetadata } from '@/lib/seo';

// ================================
// HALAMAN: /achievements
// File: app/achievements/page.tsx
// ================================
export const achievementsMetadata = generatePageMetadata({
  title: 'Prestasi & Penghargaan',
  description:
    'Daftar prestasi dan penghargaan KROENG USK dalam kompetisi robotika nasional seperti KRI, KRTI, dan kompetisi internasional.',
  keywords: ['prestasi', 'penghargaan', 'juara', 'KRI', 'KRTI', 'kompetisi robot'],
  path: '/achievements',
});

// ================================
// HALAMAN: /contact
// File: app/contact/page.tsx
// ================================
export const contactMetadata = generatePageMetadata({
  title: 'Hubungi Kami',
  description:
    'Hubungi KROENG USK untuk kolaborasi, sponsorship, atau pertanyaan seputar komunitas robotika Teknik Elektro Unsyiah.',
  keywords: ['kontak', 'hubungi', 'email', 'lokasi', 'kolaborasi', 'sponsorship'],
  path: '/contact',
});

// ================================
// HALAMAN: /gallery
// File: app/gallery/page.tsx
// ================================
export const galleryMetadata = generatePageMetadata({
  title: 'Galeri',
  description:
    'Galeri foto dan dokumentasi kegiatan KROENG USK: workshop, kompetisi, project showcase, dan momen-momen berharga komunitas.',
  keywords: ['galeri', 'foto', 'dokumentasi', 'workshop', 'kegiatan'],
  path: '/gallery',
});

// ================================
// HALAMAN: /knowledge
// File: app/knowledge/page.tsx
// ================================
export const knowledgeMetadata = generatePageMetadata({
  title: 'Knowledge Base',
  description:
    'Pusat pengetahuan KROENG: tutorial robotika, panduan Arduino & ESP32, artikel teknis, dan resource belajar untuk pemula hingga advanced.',
  keywords: ['tutorial', 'belajar', 'arduino', 'esp32', 'robotika', 'pemrograman', 'elektronika'],
  path: '/knowledge',
});

// ================================
// HALAMAN: /news
// File: app/news/page.tsx
// ================================
export const newsMetadata = generatePageMetadata({
  title: 'Berita & Kegiatan',
  description:
    'Berita terbaru dan update kegiatan KROENG USK: event, workshop, kompetisi, dan perkembangan komunitas robotika.',
  keywords: ['berita', 'kegiatan', 'event', 'workshop', 'update'],
  path: '/news',
});

// ================================
// HALAMAN: /structure
// File: app/structure/page.tsx
// ================================
export const structureMetadata = generatePageMetadata({
  title: 'Struktur Organisasi',
  description:
    'Struktur organisasi dan tim KROENG USK. Kenali pengurus, divisi, dan anggota komunitas robotika Teknik Elektro Unsyiah.',
  keywords: ['struktur', 'organisasi', 'pengurus', 'divisi', 'tim', 'anggota'],
  path: '/structure',
});

// ================================
// HALAMAN: /profile (noIndex karena private)
// File: app/profile/page.tsx
// ================================
export const profileMetadata = generatePageMetadata({
  title: 'Profil Saya',
  description: 'Halaman profil anggota KROENG.',
  path: '/profile',
  noIndex: true, // Private page, jangan diindex
});

// ================================
// CONTOH PENGGUNAAN DI PAGE.TSX:
// ================================
/*
// app/contact/page.tsx

import { generatePageMetadata, generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Hubungi Kami',
  description: 'Hubungi KROENG USK untuk kolaborasi...',
  keywords: ['kontak', 'hubungi', 'email'],
  path: '/contact',
});

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Kontak', path: '/contact' },
]);

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <main>
        <h1>Hubungi Kami</h1>
        ...
      </main>
    </>
  );
}
*/