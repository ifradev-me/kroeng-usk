'use client';

import { ReactNode, forwardRef } from 'react';
import { useInView } from '@/hooks/use-in-view';

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'fade';
  delay?: number;
  duration?: number;
}

const animationClasses = {
  'fade-up': { visible: 'opacity-100 translate-y-0', hidden: 'opacity-0 translate-y-6' },
  'fade-left': { visible: 'opacity-100 translate-x-0', hidden: 'opacity-0 -translate-x-6' },
  'fade-right': { visible: 'opacity-100 translate-x-0', hidden: 'opacity-0 translate-x-6' },
  fade: { visible: 'opacity-100', hidden: 'opacity-0' },
};

/**
 * Wrapper component for scroll animations
 * Reduces boilerplate in section components
 */
export function AnimateOnScroll({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 500,
}: AnimateOnScrollProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();
  const { visible, hidden } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ${isInView ? visible : hidden} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger children animations - provides context for staggered items
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerContainerProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={className} data-in-view={isInView}>
      {children}
    </div>
  );
}