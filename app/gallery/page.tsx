import { Suspense } from 'react';
import { Metadata } from 'next';
import { supabase, GalleryItem } from '@/lib/supabase';
import { GalleryGrid } from './gallery-grid';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: 'Galeri',
  description:
    'Galeri foto dan dokumentasi kegiatan KROENG USK: workshop robotika, kompetisi KRI, project showcase, dan momen-momen berharga komunitas.',
  keywords: ['galeri', 'foto', 'dokumentasi', 'workshop', 'project', 'robot', 'kegiatan'],
  openGraph: {
    title: 'Galeri | KROENG',
    description: 'Dokumentasi kegiatan dan project KROENG USK.',
  },
};

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Galeri', path: '/gallery' },
]);

async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 60;

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              Our Work
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
              Galeri Kegiatan
            </h1>
            <p className="text-gray-600 mt-4">
              Anggota KROENG aktif membangun berbagai proyek teknologi — dari robot kompetisi hingga
              sistem IoT untuk klien industri. Lihat dokumentasi kegiatan kami.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl aspect-square animate-pulse" />
                ))}
              </div>
            }
          >
            <GalleryGrid gallery={gallery} />
          </Suspense>
        </div>
      </div>
    </>
  );
}