'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Calendar, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Knowledge } from '@/lib/supabase';
import { format } from 'date-fns';

export function KnowledgeGrid({ knowledge }: { knowledge: Knowledge[] }) {
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(knowledge.map((item) => item.category)))];
  const filteredKnowledge =
    filter === 'all' ? knowledge : knowledge.filter((item) => item.category === filter);

  if (knowledge.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">
          belum ada artikel, Tungguin ya!
        </h3>
        <p className="text-gray-500">Artikel dan blog ilmu pengetahuan akan ditampilkan di sini segera!</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category)}
            className={filter === category ? 'bg-electric-500 hover:bg-electric-600' : ''}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKnowledge.map((item) => (
          <Link key={item.id} href={`/knowledge/${item.slug}`} className="group">
            <Card className="h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                {item.cover_image ? (
                  <img
                    src={item.cover_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-electric-500 to-navy-600 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-navy-900 hover:bg-white">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(item.created_at), 'dd MMM yyyy')}
                </div>
                <h3 className="text-lg font-heading font-semibold text-navy-900 mb-2 group-hover:text-electric-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{item.excerpt}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-electric-600 text-sm font-medium mt-4">
                  Baca selengkapnya
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
