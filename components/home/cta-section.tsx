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
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-electric-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-electric-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>Ready to start?</span>
          </div>

          {/* Heading */}
          <h2
            id="cta-heading"
            className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Ready to Build the Future?
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
            Tertarik belajar robotika, mengikuti kompetisi teknologi, dan membangun proyek
            engineering nyata? Bergabunglah dengan KROENG. Di sini, kamu bukan sekadar anggota —
            kamu bagian dari komunitas yang membentuk engineer masa depan.
          </p>

          {/* CTA Buttons */}
          <nav aria-label="Call to action" className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/profile" className="flex-1 sm:flex-none min-w-[140px]">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-electric-500 hover:bg-electric-400 text-white gap-2 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
              >
                Join Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contract" className="flex-1 sm:flex-none min-w-[140px]">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/30 text-gold-600 hover:bg-white/10 hover:text-white h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
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