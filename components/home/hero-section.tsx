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
      className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden py-16 sm:py-20"
    >
      {/* Static background - no JS needed */}
      <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
      <div className="absolute top-20 right-0 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-electric-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-20 left-0 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-navy-500/10 rounded-full blur-3xl" aria-hidden="true" />

      {/* Floating icons - hidden on small mobile to prevent overlap with text */}
      <div className="hidden sm:block absolute top-1/4 right-[10%] md:right-1/4 animate-float" aria-hidden="true">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-electric-500/20 to-navy-500/20 backdrop-blur-sm flex items-center justify-center border border-electric-500/30">
          <Bot className="w-6 h-6 md:w-8 md:h-8 text-electric-600" />
        </div>
      </div>
      <div className="hidden sm:block absolute bottom-1/3 right-[15%] md:right-1/4 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 backdrop-blur-sm flex items-center justify-center border border-gold-500/30">
          <Cpu className="w-5 h-5 md:w-7 md:h-7 text-gold-600" />
        </div>
      </div>
      <div className="hidden md:block absolute top-1/3 left-1/4 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-500/20 to-electric-500/20 backdrop-blur-sm flex items-center justify-center border border-navy-500/30">
          <Zap className="w-6 h-6 text-navy-600" />
        </div>
      </div>

      <div className="container-custom px-4 md:px-8 relative z-10 w-full">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className={`${baseTransition} ${visibleClass}`}>
            <span className="inline-flex items-start sm:items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-electric-100 text-electric-700 text-[11px] sm:text-sm font-medium mb-5 sm:mb-6 max-w-full">
              <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse flex-shrink-0 mt-1 sm:mt-0" aria-hidden="true" />
              <span className="leading-snug">Komunitas Robot Aceh · Teknik Elektro USK · Banda Aceh</span>
            </span>
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4 sm:mb-6 leading-tight ${baseTransition} delay-100 ${visibleClass}`}
          >
            <span className="text-navy-900">Forge Engineers.</span>{' '}
            <span className="gradient-text">Win Competitions.</span>
          </h1>

          {/* Description */}
          <p className={`text-sm sm:text-base md:text-lg text-gray-800 mb-6 sm:mb-8 max-w-2xl leading-relaxed ${baseTransition} delay-200 ${visibleClass}`}>
            KROENG adalah komunitas robot Aceh dari Universitas Syiah Kuala — mencetak
            engineer berprestasi lewat KRI, KRTI, dan kompetisi robotika nasional.
            Berbasis di Banda Aceh, untuk Indonesia.
          </p>

          {/* CTA */}
          <nav
            aria-label="Primary actions"
            className={`flex flex-wrap gap-3 sm:gap-4 ${baseTransition} delay-[400ms] ${visibleClass}`}
          >
            <Link href="/contact" prefetch={false} className="flex-1 sm:flex-none min-w-[140px]">
              <Button size="lg" className="w-full sm:w-auto bg-electric-500 hover:bg-electric-600 text-white gap-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base">
                Join Community
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/gallery" prefetch={false} className="flex-1 sm:flex-none min-w-[140px]">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base border-gray-300 hover:border-electric-500 hover:text-electric-600 hover:bg-electric-50"
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