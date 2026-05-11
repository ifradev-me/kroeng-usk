import Link from 'next/link';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, News } from '@/lib/supabase';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { format } from 'date-fns';

async function getLatestNews(): Promise<News[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*, author:profiles(full_name, avatar_url)')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function LatestNewsSection() {
  const news = await getLatestNews();

  if (news.length === 0) return null;

  return (
    <section
      aria-labelledby="latest-news-heading"
      className="section-padding bg-white"
    >
      <div className="container-custom">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <span className="text-electric-600 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              Latest Updates
            </span>
            <h2
              id="latest-news-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-navy-900 mt-2"
            >
              Berita Terbaru
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 leading-relaxed">
              Update terbaru dari kegiatan, event, dan perkembangan KROENG.
            </p>
          </div>
          <Link href="/news" prefetch={false} className="hidden sm:block flex-shrink-0">
            <Button variant="outline" className="gap-2 text-sm sm:text-base">
              Lihat Berita
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </header>

        {/* News Grid */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none" role="list">
          {news.map((item, index) => (
            <li key={item.id}>
              <AnimateOnScroll animation="fade-up" delay={index * 100}>
                <Link
                  href={`/news/${item.slug}`}
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
                          <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                        <span>
                          {item.published_at
                            ? format(new Date(item.published_at), 'dd MMM yyyy')
                            : format(new Date(item.created_at), 'dd MMM yyyy')}
                        </span>
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
          <Link href="/news" prefetch={false}>
            <Button variant="outline" className="gap-2 text-sm">
              Lihat Semua Berita
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
