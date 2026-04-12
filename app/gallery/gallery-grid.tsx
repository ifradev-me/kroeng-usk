'use client';

import { useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GalleryItem } from '@/lib/supabase';

export function GalleryGrid({ gallery }: { gallery: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(gallery.map((item) => item.category)))];
  const filteredGallery = filter === 'all' ? gallery : gallery.filter((item) => item.category === filter);

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredGallery.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (gallery.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-gray-700 mb-2">Belum ada gambar, Tungguin ya!</h3>
        <p className="text-gray-500">Galeri kami akan ditampilkan di sini segera!. jadi tetap pantau terus ya!</p>
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
        {filteredGallery.map((item, index) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                {item.category}
              </Badge>
              <h3 className="text-white font-heading font-semibold">{item.title}</h3>
              {item.description && (
                <p className="text-gray-200 text-sm mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-electric-400 transition-colors"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-electric-400 transition-colors disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={selectedIndex === 0}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-electric-400 transition-colors disabled:opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={selectedIndex === filteredGallery.length - 1}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredGallery[selectedIndex].image_url}
              alt={filteredGallery[selectedIndex].title}
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="text-center mt-4 text-white">
              <h3 className="text-xl font-heading font-semibold">
                {filteredGallery[selectedIndex].title}
              </h3>
              {filteredGallery[selectedIndex].description && (
                <p className="text-gray-300 mt-2">{filteredGallery[selectedIndex].description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
