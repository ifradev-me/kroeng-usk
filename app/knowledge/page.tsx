import { Suspense } from 'react';
import { Metadata } from 'next';
import { supabase, Knowledge } from '@/lib/supabase';
import { KnowledgeGrid } from './knowledge-grid';
import { generateBreadcrumbJsonLd, JsonLd } from '@/lib/seo';

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: 'Knowledge Base',
  description:
    'Pusat pengetahuan KROENG: tutorial robotika, panduan Arduino & ESP32, artikel teknis IoT, dan resource belajar untuk pemula hingga advanced.',
  keywords: [
    'tutorial',
    'belajar',
    'arduino',
    'esp32',
    'robotika',
    'IoT',
    'pemrograman',
    'elektronika',
    'embedded',
  ],
  openGraph: {
    title: 'Knowledge Base | KROENG',
    description: 'Tutorial dan artikel teknis dari komunitas robotika KROENG USK.',
  },
};

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Knowledge Base', path: '/knowledge' },
]);

async function getKnowledge(): Promise<Knowledge[]> {
  const { data, error } = await supabase
    .from('knowledge')
    .select('*, author:profiles(full_name, avatar_url)')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 60;

export default async function KnowledgePage() {
  const knowledge = await getKnowledge();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
              Learning Resources
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
              Knowledge Base
            </h1>
            <p className="text-gray-600 mt-4">
              Koleksi artikel, tutorial, dan pengetahuan teknis yang dibagikan oleh anggota KROENG.
              Belajar bersama dan berbagi ilmu adalah DNA kami.
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
            <KnowledgeGrid knowledge={knowledge} />
          </Suspense>
        </div>
      </div>
    </>
  );
}