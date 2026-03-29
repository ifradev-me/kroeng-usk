'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="section-padding bg-gradient-to-br from-navy-900 via-navy-800 to-electric-900 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-electric-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Ready to start?</span>
          </div>

          {/* Heading */}
          <h2
            id="cta-heading"
            className="text-3xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            Ready to Build the Future?
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Tertarik belajar robotika, mengikuti kompetisi teknologi, dan membangun proyek
            engineering nyata? Bergabunglah dengan KROENG. Di sini, kamu bukan sekadar anggota —
            kamu bagian dari komunitas yang membentuk engineer masa depan.
          </p>

          {/* CTA Buttons */}
          <nav aria-label="Call to action" className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-electric-500 hover:bg-electric-400 text-white gap-2 h-12 px-8"
              >
                Join Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-gold-600 hover:bg-white/10 hover:text-white h-12 px-8"
              >
                Contact Us
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}