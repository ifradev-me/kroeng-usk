'use client';

import Link from 'next/link';
import { Calendar, ArrowRight, Newspaper, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { News } from '@/lib/supabase';
import { format } from 'date-fns';

export function NewsGrid({ news }: { news: News[] }) {
  if (news.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Newspaper className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">Belum ada berita, Tungguin ya!</h3>
        <p className="text-gray-500">Stay tuned for updates from KROENG!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <Link key={item.id} href={`/news/${item.slug}`} className="group">
          <Card className="h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="aspect-video relative overflow-hidden">
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
                  <Newspaper className="w-12 h-12 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {item.published_at
                    ? format(new Date(item.published_at), 'dd MMM yyyy')
                    : format(new Date(item.created_at), 'dd MMM yyyy')}
                </span>
                {(item.author as any) && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    {(item.author as any).avatar_url ? (
                      <img
                        src={(item.author as any).avatar_url}
                        alt={(item.author as any).full_name || ''}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-electric-100 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-electric-600" />
                      </span>
                    )}
                    <span className="truncate text-xs">
                      {(item.author as any).full_name || 'KROENG Team'}
                    </span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-heading font-semibold text-navy-900 mb-2 group-hover:text-electric-600 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">{item.excerpt}</p>
              <div className="flex items-center gap-1 text-electric-600 text-sm font-medium mt-4">
                Read More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
