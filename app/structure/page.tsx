import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, Member, Division } from '@/lib/supabase';
import { MembersGrid } from './members-grid';

async function getCoreTeam(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*, division:divisions(*)')
    .eq('is_core_team', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching core team:', error);
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
  const [coreTeam, divisions] = await Promise.all([getCoreTeam(), getDivisions()]);

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Our Team
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
            Organization Structure
          </h1>
          <p className="text-gray-600 mt-4">
            KROENG memiliki struktur organisasi yang fleksibel dan kolaboratif. Setiap anggota
            berkontribusi sesuai dengan keahlian dan passion mereka.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-heading font-bold text-navy-900 mb-8 text-center">
            Core Team
          </h2>
          <Suspense
            fallback={
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            }
          >
            <MembersGrid members={coreTeam} />
          </Suspense>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-navy-900 mb-4">Explore Divisions</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Lihat anggota-anggota dari setiap divisi KROENG. Setiap divisi memiliki keahlian dan
            fokus yang berbeda.
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
