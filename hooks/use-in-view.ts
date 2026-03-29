'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Reusable hook for intersection observer
 * Use this instead of creating new observers in each component
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if already triggered and triggerOnce is true
    if (isInView && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, isInView]);

  return [ref, isInView];
}

/**
 * Simple fade-in animation classes
 * Use with useInView hook
 */
export const fadeInUp = (isVisible: boolean, delay = 0) =>
  `transition-all duration-500 ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }` + (delay ? ` delay-[${delay}ms]` : '');

export const fadeInLeft = (isVisible: boolean, delay = 0) =>
  `transition-all duration-500 ${
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
  }` + (delay ? ` delay-[${delay}ms]` : '');

export const fadeInRight = (isVisible: boolean, delay = 0) =>
  `transition-all duration-500 ${
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
  }` + (delay ? ` delay-[${delay}ms]` : '');