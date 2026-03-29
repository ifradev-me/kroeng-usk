import { Suspense } from 'react';
import { Metadata } from 'next';
import { supabase, Achievement } from '@/lib/supabase';
import { AchievementsGrid } from './achievements-grid';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: 'Prestasi & Penghargaan',
  description:
    'Daftar prestasi dan penghargaan KROENG USK dalam kompetisi robotika nasional seperti KRI, KRTI, dan kompetisi teknologi lainnya.',
  keywords: ['prestasi', 'penghargaan', 'juara', 'KRI', 'KRTI', 'kompetisi robot', 'trophy'],
  openGraph: {
    title: 'Prestasi & Penghargaan | KROENG',
    description: 'Prestasi KROENG USK dalam kompetisi robotika nasional dan internasional.',
  },
};

// Breadcrumb JSON-LD
const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Prestasi', path: '/achievements' },
]);

async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 60;

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              Our Pride
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
              Prestasi & Penghargaan
            </h1>
            <p className="text-gray-600 mt-4">
              Prestasi yang diraih oleh anggota KROENG di berbagai kompetisi teknologi nasional dan
              internasional. Ini adalah bukti dedikasi dan kerja keras tim kami.
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
            <AchievementsGrid achievements={achievements} />
          </Suspense>
        </div>
      </div>
    </>
  );
}