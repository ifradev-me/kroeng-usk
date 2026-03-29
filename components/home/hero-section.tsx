'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Floating icon component - memoized for performance
const FloatingIcon = ({
  icon: Icon,
  className,
  iconClass,
  delay = 0,
}: {
  icon: typeof Bot;
  className: string;
  iconClass: string;
  delay?: number;
}) => (
  <div
    className={`absolute animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
    aria-hidden="true"
  >
    <div className="rounded-xl bg-gradient-to-br backdrop-blur-sm flex items-center justify-center border">
      <Icon className={iconClass} />
    </div>
  </div>
);

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame for smoother initial animation
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const baseTransition = 'transition-all duration-700';
  const visibleClass = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Static background - no JS needed */}
      <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-electric-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl" aria-hidden="true" />

      {/* Floating icons - CSS animations only */}
      <div className="absolute top-1/4 right-1/4 animate-float" aria-hidden="true">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-500/20 to-navy-500/20 backdrop-blur-sm flex items-center justify-center border border-electric-500/30">
          <Bot className="w-8 h-8 text-electric-600" />
        </div>
      </div>
      <div className="absolute bottom-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 backdrop-blur-sm flex items-center justify-center border border-gold-500/30">
          <Cpu className="w-7 h-7 text-gold-600" />
        </div>
      </div>
      <div className="absolute top-1/3 left-1/4 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-500/20 to-electric-500/20 backdrop-blur-sm flex items-center justify-center border border-navy-500/30">
          <Zap className="w-6 h-6 text-navy-600" />
        </div>
      </div>

      <div className="container-custom px-4 md:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className={`${baseTransition} ${visibleClass}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-100 text-electric-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" aria-hidden="true" />
              Komunitas Robotic Electrical Engineering
            </span>
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            className={`text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 ${baseTransition} delay-100 ${visibleClass}`}
          >
            <span className="text-navy-900">Build Robots.</span>{' '}
            <span className="gradient-text">Build Engineers.</span>
          </h1>

          {/* Tagline */}
          <p className={`text-lg md:text-xl text-gray-600 mb-4 font-medium ${baseTransition} delay-200 ${visibleClass}`}>
            Where Engineers Build the Future
          </p>

          {/* Description */}
          <p className={`text-base md:text-lg text-gray-800 mb-8 max-w-2xl leading-relaxed ${baseTransition} delay-300 ${visibleClass}`}>
            KROENG adalah komunitas robotika mahasiswa Teknik Elektro USK yang mengembangkan
            engineer masa depan melalui kompetisi, kolaborasi, dan proyek teknologi nyata.
          </p>

          {/* CTA */}
          <nav
            aria-label="Primary actions"
            className={`flex flex-wrap gap-4 ${baseTransition} delay-[400ms] ${visibleClass}`}
          >
            <Link href="/contact" prefetch={false}>
              <Button size="lg" className="bg-electric-500 hover:bg-electric-600 text-white gap-2 h-12 px-6">
                Join Community
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/gallery" prefetch={false}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-gray-300 hover:border-electric-500 hover:text-electric-600 hover:bg-electric-50"
              >
                Explore Projects
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}