import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, Knowledge } from '@/lib/supabase';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { format } from 'date-fns';

async function getLatestKnowledge(): Promise<Knowledge[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge')
      .select('*, author:profiles(full_name, avatar_url)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function LatestKnowledgeSection() {
  const knowledge = await getLatestKnowledge();

  if (knowledge.length === 0) return null;

  return (
    <section
      aria-labelledby="latest-knowledge-heading"
      className="section-padding bg-gray-50"
    >
      <div className="container-custom">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <span className="text-electric-600 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              Learning Resources
            </span>
            <h2
              id="latest-knowledge-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2"
            >
              Knowledge Terbaru
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 leading-relaxed">
              Tutorial, artikel teknis, dan pengetahuan terbaru dari komunitas KROENG.
            </p>
          </div>
          <Link href="/knowledge" prefetch={false} className="hidden sm:block flex-shrink-0">
            <Button variant="outline" className="gap-2 text-sm sm:text-base">
              Lihat Knowledge
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </header>

        {/* Knowledge Grid */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none" role="list">
          {knowledge.map((item, index) => (
            <li key={item.id}>
              <AnimateOnScroll animation="fade-up" delay={index * 100}>
                <Link
                  href={`/knowledge/${item.slug}`}
                  className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 focus-visible:ring-offset-2 rounded-xl"
                  prefetch={false}
                >
                  <Card className="h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-electric-500 to-navy-600 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" aria-hidden="true" />
                        </div>
                      )}
                      {item.category && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-navy-900 hover:bg-white text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                        <span>{format(new Date(item.created_at), 'dd MMM yyyy')}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-heading font-semibold text-navy-900 mb-2 group-hover:text-electric-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-electric-600 text-xs sm:text-sm font-medium mt-3 sm:mt-4">
                        Baca selengkapnya
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimateOnScroll>
            </li>
          ))}
        </ul>

        {/* Mobile View All */}
        <div className="text-center mt-6 sm:hidden">
          <Link href="/knowledge" prefetch={false}>
            <Button variant="outline" className="gap-2 text-sm">
              Lihat Semua Knowledge
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
