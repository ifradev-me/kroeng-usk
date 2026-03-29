import { Suspense } from 'react';
import { supabase, Member, Division } from '@/lib/supabase';
import { DivisionsView } from './divisions-view';

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

async function getAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*, division:divisions(*)')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data || [];
}

export const revalidate = 60;

export default async function DivisionsPage() {
  const [divisions, members] = await Promise.all([getDivisions(), getAllMembers()]);

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Our Divisions
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2">
            Division Members
          </h1>
          <p className="text-gray-600 mt-4">
            Setiap divisi memiliki keahlian dan fokus yang berbeda. Lihat anggota dari setiap divisi
            KROENG.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse">
              <div className="flex gap-4 justify-center mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-10 w-32" />
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64" />
                ))}
              </div>
            </div>
          }
        >
          <DivisionsView divisions={divisions} members={members} />
        </Suspense>
      </div>
    </div>
  );
}
