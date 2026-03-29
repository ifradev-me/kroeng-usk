import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Critical above-the-fold components - loaded immediately
import { HeroSection } from '@/components/home/hero-section';

// Below-the-fold sections - lazy loaded with dynamic imports
const StatsSection = dynamic(
  () => import('@/components/home/stats-section').then((mod) => ({ default: mod.StatsSection })),
  {
    loading: () => <SectionSkeleton height="py-16" />,
  }
);

const AboutSection = dynamic(
  () => import('@/components/home/about-section').then((mod) => ({ default: mod.AboutSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const WhatWeDoSection = dynamic(
  () => import('@/components/home/what-we-do-section').then((mod) => ({ default: mod.WhatWeDoSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const WhyJoinSection = dynamic(
  () => import('@/components/home/why-join-section').then((mod) => ({ default: mod.WhyJoinSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const DivisionsSection = dynamic(
  () => import('@/components/home/divisions-section').then((mod) => ({ default: mod.DivisionsSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const CompetitionsSection = dynamic(
  () => import('@/components/home/competitions-section').then((mod) => ({ default: mod.CompetitionsSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const CollaborationSection = dynamic(
  () => import('@/components/home/collaboration-section').then((mod) => ({ default: mod.CollaborationSection })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const CTASection = dynamic(
  () => import('@/components/home/cta-section').then((mod) => ({ default: mod.CTASection })),
  {
    loading: () => <SectionSkeleton height="py-16" dark />,
  }
);

// Loading skeleton component
function SectionSkeleton({
  height = 'py-16 md:py-24',
  dark = false,
}: {
  height?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`${height} ${dark ? 'bg-navy-900' : 'bg-gray-50'} animate-pulse`}
      aria-label="Loading section..."
    >
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`h-4 w-32 mx-auto rounded ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className={`h-8 w-64 mx-auto mt-4 rounded ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Critical - render immediately */}
      <HeroSection />

      {/* Lazy loaded sections with Suspense boundaries */}
      <Suspense fallback={<SectionSkeleton height="py-16" dark />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <AboutSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <WhatWeDoSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <DivisionsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CompetitionsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <WhyJoinSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CollaborationSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="py-16" dark />}>
        <CTASection />
      </Suspense>
    </>
  );
}