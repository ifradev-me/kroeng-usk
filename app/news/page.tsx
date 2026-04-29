import { Suspense } from 'react';
import { Metadata } from 'next';
import { supabase, News } from '@/lib/supabase';
import { NewsGrid } from './news-grid';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: 'Berita & Kegiatan',
  description:
    'Berita terbaru dan update kegiatan KROENG USK: event, workshop, kompetisi robotika, dan perkembangan komunitas.',
  keywords: ['berita', 'news', 'kegiatan', 'event', 'workshop', 'update', 'KROENG'],
  openGraph: {
    title: 'Berita & Kegiatan | KROENG',
    description: 'Update terbaru dari komunitas robotika KROENG USK.',
  },
};

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Berita', path: '/news' },
]);

async function getNews(): Promise<News[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[News Page] Error fetching news:', error.message, error.code);
    return [];
  }

  console.log('[News Page] Fetched news count:', data?.length ?? 0);
  return data || [];
}

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              News & Updates
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
              Berita & Kegiatan
            </h1>
            <p className="text-gray-600 mt-4">
              Ikuti perkembangan terbaru dari KROENG — kegiatan komunitas, prestasi kompetisi,
              workshop, dan proyek teknologi yang sedang kami kerjakan.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            }
          >
            <NewsGrid news={news} />
          </Suspense>
        </div>
      </div>
    </>
  );
}