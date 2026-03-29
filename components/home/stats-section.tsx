import { supabase } from '@/lib/supabase';
import { StatsClient } from './stats-client';

// Fetch stats on server - no client-side fetch needed
async function getStats() {
  try {
    const [membersRes, achievementsRes, galleryRes, knowledgeRes] = await Promise.all([
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase.from('achievements').select('id', { count: 'exact', head: true }),
      supabase.from('gallery').select('id', { count: 'exact', head: true }),
      supabase.from('knowledge').select('id', { count: 'exact', head: true }).eq('published', true),
    ]);

    return [
      { label: 'Members', value: membersRes.count || 0, suffix: '+' },
      { label: 'Achievements', value: achievementsRes.count || 0, suffix: '+' },
      { label: 'Projects', value: galleryRes.count || 0, suffix: '+' },
      { label: 'Articles', value: knowledgeRes.count || 0, suffix: '+' },
    ];
  } catch (error) {
    console.error('Error fetching stats:', error);
    return [
      { label: 'Members', value: 0, suffix: '+' },
      { label: 'Achievements', value: 0, suffix: '+' },
      { label: 'Projects', value: 0, suffix: '+' },
      { label: 'Articles', value: 0, suffix: '+' },
    ];
  }
}

export async function StatsSection() {
  const stats = await getStats();

  return (
    <section
      aria-labelledby="stats-heading"
      className="py-12 sm:py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden"
    >
      <h2 id="stats-heading" className="sr-only">
        KROENG dalam Angka
      </h2>

      {/* Background - static, no JS */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-electric-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-4 md:px-8 relative z-10">
        <StatsClient stats={stats} />
      </div>
    </section>
  );
}