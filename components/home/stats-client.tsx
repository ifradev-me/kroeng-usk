'use client';

import { useEffect, useState, memo } from 'react';
import { Users, Trophy, Briefcase, BookOpen } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

interface StatsClientProps {
  stats: StatItem[];
}

// Icons defined inside client component
const icons = [Users, Trophy, Briefcase, BookOpen];

// Memoized counter component
const AnimatedCounter = memo(function AnimatedCounter({
  value,
  suffix,
  isInView,
}: {
  value: number;
  suffix: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === 0) return;

    let start = 0;
    const duration = 1500; // Reduced from 2000ms
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span aria-label={`${value}${suffix}`}>
      {count}
      {suffix}
    </span>
  );
});

export function StatsClient({ stats }: StatsClientProps) {
  const [ref, isInView] = useInView<HTMLDListElement>();

  return (
    <dl ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
      {stats.map((stat, index) => {
        const Icon = icons[index];

        return (
          <div key={stat.label} className="text-center group">
            <div
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 text-electric-400 mb-3 sm:mb-4 group-hover:bg-electric-500 group-hover:text-white transition-colors"
              aria-hidden="true"
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <dt className="sr-only">{stat.label}</dt>
            <dd className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-electric-400">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} isInView={isInView} />
            </dd>

            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base font-medium" aria-hidden="true">
              {stat.label}
            </p>
          </div>
        );
      })}
    </dl>
  );
}