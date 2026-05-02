import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, Member, Division } from '@/lib/supabase';
import { OrgChart } from './org-chart';

export const metadata: Metadata = {
  title: 'Struktur Organisasi',
  description: 'Bagan struktur organisasi KROENG USK — kenali ketua, wakil, sekretaris, bendahara, dan ketua setiap divisi.',
  keywords: ['struktur organisasi', 'bagan organisasi', 'divisi KROENG', 'anggota KROENG', 'tim robotika USK'],
  openGraph: {
    title: 'Struktur Organisasi | KROENG',
    description: 'Bagan struktur organisasi KROENG USK.',
    type: 'website',
  },
};

type OrgMember = Member & {
  profile?: { full_name: string | null; avatar_url: string | null; nim: string | null } | null;
};

async function getOrgMembers(): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*, profile:profiles(full_name, avatar_url, nim)')
    .in('position', ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Ketua Divisi', 'Wakil Ketua Divisi'])
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching org members:', error);
    return [];
  }

  return data || [];
}

async function getDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from('divisions')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching divisions:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 60;

export default async function StructurePage() {
  const [members, divisions] = await Promise.all([getOrgMembers(), getDivisions()]);

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Our Team
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
            Struktur Organisasi
          </h1>
          <p className="text-gray-600 mt-4">
            Bagan struktur organisasi KROENG USK. Setiap anggota berkontribusi sesuai peran dan divisinya.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <div className="animate-spin w-10 h-10 border-4 border-electric-500 border-t-transparent rounded-full" />
            </div>
          }
        >
          <OrgChart members={members} divisions={divisions} />
        </Suspense>

        <div className="text-center mt-16 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-heading font-bold text-navy-900 mb-4">Lihat Anggota Divisi</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Lihat seluruh anggota dari setiap divisi KROENG beserta keahlian mereka.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {divisions.map((division) => (
              <Link key={division.id} href={`/structure/divisions?division=${division.slug}`}>
                <Button variant="outline" className="gap-2">
                  {division.name}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
