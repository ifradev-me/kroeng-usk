import Link from 'next/link';
import { Zap, Code, Palette, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, Division } from '@/lib/supabase';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electrical: Zap,
  programmer: Code,
  designer: Palette,
  'non-technical': Users,
  default: Users,
};

// Color mapping
const colorMap: Record<string, string> = {
  electrical: 'from-gold-500 to-gold-600',
  programmer: 'from-electric-500 to-electric-600',
  designer: 'from-pink-500 to-pink-600',
  'non-technical': 'from-green-500 to-green-600',
  default: 'from-gray-500 to-gray-600',
};

// Fallback data
const fallbackDivisions: Division[] = [
  { id: '1', name: 'Electrical Division', slug: 'electrical', description: 'Fokus pada rangkaian elektronik, sistem listrik, dan hardware robot.', icon: 'electrical', color: '#d97706', order_index: 1, created_at: '' },
  { id: '2', name: 'Programmer Division', slug: 'programmer', description: 'Software development, embedded systems, AI, dan sistem robotika.', icon: 'programmer', color: '#0ea5e9', order_index: 2, created_at: '' },
  { id: '3', name: 'Designer Division', slug: 'designer', description: 'Desain produk, komponen mekanik, visual teknologi, dan 3D modeling.', icon: 'designer', color: '#a21caf', order_index: 3, created_at: '' },
  { id: '4', name: 'Non Technical Division', slug: 'non-technical', description: 'Manajemen komunitas, event organizing, dan urusan organisasi.', icon: 'non-technical', color: '#059669', order_index: 4, created_at: '' },
];

async function getDivisions(): Promise<Division[]> {
  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackDivisions;
    }
    return data;
  } catch {
    return fallbackDivisions;
  }
}

export async function DivisionsSection() {
  const divisions = await getDivisions();

  return (
    <section aria-labelledby="divisions-heading" className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-electric-600 font-semibold text-sm uppercase tracking-wider">
            Our Team
          </span>
          <h2
            id="divisions-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2"
          >
            Our Divisions
          </h2>
        </header>

        {/* Divisions Grid */}
        <ul className="grid sm:grid-cols-2 gap-4 sm:gap-6 list-none" role="list">
          {divisions.map((division, index) => {
            const Icon = iconMap[division.slug || 'default'] || iconMap.default;
            const gradient = colorMap[division.slug || 'default'] || colorMap.default;

            return (
              <li key={division.id}>
                <AnimateOnScroll animation="fade-up" delay={index * 100}>
                  <Link
                    href={`/structure/divisions?division=${division.slug}`}
                    className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 focus-visible:ring-offset-2 rounded-xl"
                    aria-label={`Lihat detail ${division.name}`}
                    prefetch={false}
                  >
                    <Card className="h-full bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                            aria-hidden="true"
                          >
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl font-heading font-semibold text-navy-900 mb-1 sm:mb-2 flex items-center gap-2">
                              <span className="truncate">{division.name}</span>
                              <ArrowRight
                                className="w-4 h-4 flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-electric-500"
                                aria-hidden="true"
                              />
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-2">
                              {division.description || 'No description available.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimateOnScroll>
              </li>
            );
          })}
        </ul>

        {/* View All */}
        <div className="text-center mt-6 sm:mt-8">
          <Link href="/structure/divisions" prefetch={false}>
            <Button variant="outline" className="gap-2 text-sm sm:text-base">
              View All Divisions
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}